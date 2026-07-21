# Implementation Plan — Code Review Remediation

> Actionable plan to resolve every finding from the code review of the Studio
> Next.js boilerplate. Findings are grouped into phases ordered by value and
> dependency. Each task lists the affected files, concrete steps, acceptance
> criteria, and a rough effort size (S ≈ <1h, M ≈ 1–3h, L ≈ half-day+).
>
> **Baseline:** build, type check, and lint are green. Nothing here is a blocker;
> this hardens the boilerplate to senior/production standard.

---

## Summary

| ID | Finding | Severity | Phase | Effort |
| -- | ------- | -------- | ----- | ------ |
| M1 | No test infrastructure or tests | MEDIUM | 0 + 2 | L |
| M2 | Product search fires a request per keystroke (no debounce) | MEDIUM | 1 | S |
| M3 | `useBreadcrumbs` misnamed (pure fn with `use` prefix) | MEDIUM | 1 | S |
| M4 | No route error boundary (`error.tsx` / `global-error.tsx`) | MEDIUM | 1 | S |
| M5 | ProgressBar `aria-valuenow` can exceed `aria-valuemax` | MEDIUM | 1 | S |
| L1 | Session token is JS-readable (localStorage + non-HttpOnly cookie) | LOW | 3 | L |
| L2 | Unused utility hooks (`useMediaQuery`, `useLocalStorage`) | LOW | 1/3 | S |
| L3 | Decorative buttons have no handlers | LOW | 1 | S |
| L4 | Emoji in `README.md` / `DESIGN_SYSTEM.md` | LOW | — | S (decision only) |
| L5 | `$600` shown where reference used `$0.6K` | LOW | 3 | S |
| N1 | Dashboard is client-only rendered (AuthGuard mount gate) | Note | 3 (opt) | L |

**Recommended order:** Phase 1 (quick fixes) → Phase 0 + 2 (tests) → Phase 3 (hardening/polish). Phase 1 and Phase 0 are independent and can run in parallel.

---

## Phase 1 — Quick Code Fixes

Small, self-contained changes with immediate quality payoff. No new dependencies.

### Task 1.1 — Debounce product search (M2)

**Files:** new `src/hooks/useDebouncedValue.ts`; edit `src/features/product/components/ProductList.tsx`

**Steps**
1. Add a reusable debounce hook:
   ```ts
   // src/hooks/useDebouncedValue.ts
   "use client";
   import { useEffect, useState } from "react";

   /** Returns `value` after it has stopped changing for `delayMs`. */
   export function useDebouncedValue<T>(value: T, delayMs = 300): T {
     const [debounced, setDebounced] = useState(value);
     useEffect(() => {
       const id = setTimeout(() => setDebounced(value), delayMs);
       return () => clearTimeout(id);
     }, [value, delayMs]);
     return debounced;
   }
   ```
2. In `ProductList`, debounce before it reaches the query:
   ```ts
   const [search, setSearch] = useState("");
   const debouncedSearch = useDebouncedValue(search, 300);
   const { data, isLoading, isError, refetch } = useProducts({
     category: filter === "all" ? undefined : filter,
     search: debouncedSearch,
   });
   ```
   Keep the `<Input value={search}>` bound to the immediate state so typing stays responsive.

**Acceptance**
- Rapid typing issues a single query ~300ms after the last keystroke (verify in `read_network_requests` or the React Query devtools).
- Input remains fully responsive while typing.

**Effort:** S

---

### Task 1.2 — Rename `useBreadcrumbs` → `getBreadcrumbs` (M3)

**Files:** `src/components/shared/Header.tsx`

**Steps**
1. Rename the function at `Header.tsx:16` to `getBreadcrumbs` (it takes `pathname` and calls no hooks).
2. Update the call site (`Header.tsx:35`) to `const crumbs = getBreadcrumbs(pathname);`.
3. Optionally move it above the component or into a small `lib/breadcrumbs.ts` if you want it unit-testable in isolation (recommended — pairs with Task 2.x).

**Acceptance**
- Type check + lint pass; breadcrumbs still render (`Overview / Agency Operations`, `Overview / Products`, etc.).
- No `use`-prefixed identifier that isn't a real hook remains.

**Effort:** S

---

### Task 1.3 — Add route error boundaries (M4)

**Files:** new `src/app/error.tsx`, new `src/app/global-error.tsx`; (optional) `src/app/dashboard/error.tsx`

**Steps**
1. Segment-level boundary reusing the existing `ErrorState`:
   ```tsx
   // src/app/error.tsx
   "use client";
   import { useEffect } from "react";
   import { ErrorState } from "@/components/ui";

   export default function RouteError({
     error,
     reset,
   }: {
     error: Error & { digest?: string };
     reset: () => void;
   }) {
     useEffect(() => {
       // Wire to your telemetry (Sentry, etc.) here.
     }, [error]);
     return (
       <div className="mx-auto max-w-md px-4 py-16">
         <ErrorState
           title="Something went wrong"
           description="An unexpected error occurred while rendering this page."
           onRetry={reset}
         />
       </div>
     );
   }
   ```
2. Root-level boundary (must render its own `<html>`/`<body>`):
   ```tsx
   // src/app/global-error.tsx
   "use client";
   export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
     return (
       <html lang="en">
         <body style={{ fontFamily: "system-ui", padding: "4rem", textAlign: "center" }}>
           <h1>Something went wrong</h1>
           <button onClick={reset}>Try again</button>
         </body>
       </html>
     );
   }
   ```
3. (Optional) A `dashboard/error.tsx` keeps the sidebar/header intact when only the content errors.

**Acceptance**
- Temporarily `throw new Error("boom")` in a page → styled error UI with a working "Try again".
- Remove the temporary throw before committing.

**Effort:** S

---

### Task 1.4 — Fix ProgressBar ARIA for values > 100% (M5)

**Files:** `src/components/ui/ProgressBar.tsx`

**Steps**
1. Add an optional `label` prop and expose a human-readable value; stop letting `valuenow` exceed `valuemax`:
   ```tsx
   <div
     role="progressbar"
     aria-valuenow={Math.round(value)}
     aria-valuemin={0}
     aria-valuemax={Math.max(100, Math.round(value))}
     aria-valuetext={`${Math.round(value)}%${label ? ` ${label}` : ""}`}
     aria-label={label}
     ...
   />
   ```
2. Pass context where used (e.g. `TeamCapacity` → `label="utilization"`, `RetainerBurn` → `label="of retainer used"`).

**Acceptance**
- No `aria-valuenow` exceeds `aria-valuemax` (check the 124% / 118% rows).
- Screen reader announces e.g. "124% utilization".

**Effort:** S

---

### Task 1.5 — Handle decorative buttons (L3)

**Files:** `src/components/shared/Header.tsx` (Sync, More options), `src/features/dashboard/components/{ProjectsTable,TeamCapacity}.tsx` (All Projects, Capacity Planner), `src/components/shared/Sidebar.tsx` (⌘K search)

**Steps** — pick one policy and apply consistently:
- **Minimal (recommended for a template):** add `title="Coming soon"` to each and, where honest, `disabled`. Keep the `aria-label`s already present.
- **Wire one real behavior:** make **Sync** call `queryClient.invalidateQueries()` (imported via `useQueryClient`) so at least one control is functional and demonstrates the pattern.

**Acceptance**
- No control silently does nothing without signaling intent (title/disabled), or it performs a real action.

**Effort:** S

---

## Phase 0 — Test Tooling Setup (enables M1)

Stand up the test stack. No product code changes.

### Task 0.1 — Install and configure Vitest + Testing Library

**Files:** `package.json`, new `vitest.config.ts`, new `vitest.setup.ts`

**Steps**
1. Add devDependencies:
   ```
   vitest @vitest/coverage-v8 jsdom
   @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
   @vitejs/plugin-react vite-tsconfig-paths
   ```
2. `vitest.config.ts`:
   ```ts
   import { defineConfig } from "vitest/config";
   import react from "@vitejs/plugin-react";
   import tsconfigPaths from "vite-tsconfig-paths";

   export default defineConfig({
     plugins: [react(), tsconfigPaths()],
     test: {
       environment: "jsdom",
       globals: true,
       setupFiles: ["./vitest.setup.ts"],
       coverage: {
         provider: "v8",
         reporter: ["text", "html"],
         include: ["src/**/*.{ts,tsx}"],
         exclude: ["src/**/*.d.ts", "src/app/**/layout.tsx", "src/app/**/page.tsx"],
         thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
       },
     },
   });
   ```
3. `vitest.setup.ts`: `import "@testing-library/jest-dom";`
4. Scripts in `package.json`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```

**Acceptance:** `npm run test` runs (green with zero tests) and `npm run test:coverage` produces a report.

**Effort:** M

---

### Task 0.2 — Install Playwright for E2E

**Files:** `package.json`, new `playwright.config.ts`, new `e2e/`

**Steps**
1. `npm i -D @playwright/test` then `npx playwright install chromium`.
2. `playwright.config.ts` with `webServer` running `npm run dev -p 3100`, `baseURL: http://localhost:3100`.
3. Script: `"test:e2e": "playwright test"`.

**Acceptance:** `npm run test:e2e` boots the dev server and runs an (initially empty) suite.

**Effort:** M

---

## Phase 2 — Write Tests (M1)

Target ≥ 80% coverage, prioritizing pure logic and stores (highest signal, lowest brittleness). Follow AAA structure and behavior-focused naming.

### Task 2.1 — Unit: utilities & pure logic

**Files:** `src/lib/utils.test.ts`, `src/lib/breadcrumbs.test.ts` (if extracted in 1.2)

- `formatCompactCurrency`, `formatCurrency`, `formatPercent`, `getInitials`, `clamp` — cover normal, zero, and edge inputs.
- `getBreadcrumbs` — `/dashboard`, `/dashboard/products`, `/dashboard/products/:id`, unknown section.

**Effort:** S

### Task 2.2 — Unit: Zustand stores

**Files:** `src/features/auth/store/authStore.test.ts`, `src/store/ui-store.test.ts`

- Auth: `login` sets `user/token/status=authenticated` and cookie; failed login sets `status=error`; `logout` clears state + cookie. Run in mock mode (`isMockMode`) or mock `authService`.
- UI: `toggleSidebar`, `setTheme` writes `data-theme`, `setTimeRange`.
- Reset store state between tests (`useAuthStore.setState(initial, true)`).

**Effort:** M

### Task 2.3 — Unit: services

**Files:** `src/features/product/services/productService.test.ts`

- `list()` filters by category and search term; `getById()` returns a product and throws for a missing id.

**Effort:** S

### Task 2.4 — Component: UI primitives & containers

**Files:** `src/components/ui/{Button,Badge,ProgressBar}.test.tsx`, `src/features/product/components/ProductList.test.tsx`

- Button: renders children, applies variant/size, disables while `isLoading`.
- Badge/ProgressBar: correct tone classes; ProgressBar ARIA bounds (locks in M5).
- ProductList: mock `useProducts` (or the service) to assert loading skeletons → cards → empty state. Mock `next/navigation` and `next/image`.
- Debounce: use `vi.useFakeTimers()` to prove one query per burst (locks in M2).

**Effort:** M

### Task 2.5 — E2E: critical flows

**Files:** `e2e/auth.spec.ts`, `e2e/products.spec.ts`

- Login (demo creds) → lands on `/dashboard`; heading visible.
- Unauthenticated `/dashboard` → redirected to `/login` (locks in the middleware guard).
- Products list renders cards; clicking a card opens the detail route.

**Effort:** M

**Phase 2 acceptance:** `npm run test:coverage` ≥ 80% lines on covered modules; `npm run test:e2e` green.

---

## Phase 3 — Hardening & Polish (optional / backlog)

### Task 3.1 — Real session security (L1)

Move off JS-readable tokens to an **HttpOnly** cookie set by the server.

**Steps**
1. Add Route Handlers (`src/app/api/auth/login/route.ts`, `logout/route.ts`) that validate credentials and `cookies().set("studio-auth", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" })`.
2. Point `authService` at these handlers; stop writing the token to `localStorage`/`document.cookie`.
3. Middleware already reads the cookie — no change. Simplify `AuthGuard` to trust middleware (or read session via a `/api/auth/me` call).
4. Keep the Zustand store for `user` profile only (not the token).

**Effort:** L · **Depends on:** having a real auth backend (or a mock Route Handler).

### Task 3.2 — Resolve unused hooks (L2)

Either **demonstrate** them (wire `useMediaQuery` into `Sidebar` to auto-close the drawer at `lg`; back a "recently viewed products" list with `useLocalStorage`) or **remove** them. If keeping as library utilities, add a `knip`/`ts-prune` config allowlist so CI doesn't flag them, and cover them with tests (Phase 2). **Recommended:** wire `useMediaQuery` into the Sidebar — it's a genuine UX improvement.

**Effort:** S

### Task 3.3 — Currency formatting parity (L5)

Decide whether sub-$1K values should read `$0.6K` (reference) or `$600` (clearer). If matching the reference, extend `formatCompactCurrency` to abbreviate below 1K, or introduce `formatMoneyK`. Otherwise mark as intentional in a comment. **Recommended:** leave `$600` (clearer); note the decision.

**Effort:** S

### Task 3.4 — (Optional) Server-rendered dashboard (N1)

If SSR'd dashboard content matters, replace the client `AuthGuard` mount-gate with a server check: read the cookie via `next/headers` in `dashboard/layout.tsx` and `redirect("/login")` server-side. Removes the "Checking your session…" flash and enables RSC data on the dashboard.

**Effort:** L

---

## Phase 4 — Documentation Decision (L4)

**Emoji in `README.md` / `DESIGN_SYSTEM.md`.** Decision required, no code:
- **Keep (recommended):** emoji in Markdown docs is conventional and aids scannability; it isn't code/comments. Document that the "no emoji" rule applies to source only.
- **Strip:** if you want a strict, emoji-free repo, remove the section-heading emoji from both docs.

**Effort:** S (decision + optional edit)

---

## Sequencing & Milestones

```
Milestone A — "Clean & correct" (½ day)
  Phase 1: 1.1 → 1.2 → 1.3 → 1.4 → 1.5
  Gate: build + type + lint green; manual smoke of error boundary and debounced search.

Milestone B — "Tested" (1–1.5 days)
  Phase 0: 0.1, 0.2  (parallel with Milestone A)
  Phase 2: 2.1 → 2.2 → 2.3 → 2.4 → 2.5
  Gate: coverage ≥ 80%; e2e green; CI script added.

Milestone C — "Production hardening" (backlog, as needed)
  Phase 3: 3.1 (needs backend) → 3.2 → 3.3 → 3.4
  Phase 4: L4 decision.
```

## Definition of Done

- [ ] M2–M5 fixed; temporary error-throw removed.
- [ ] Vitest + Playwright configured with `test`, `test:coverage`, `test:e2e` scripts.
- [ ] Unit + component + e2e suites green; coverage ≥ 80% on covered modules.
- [ ] `npm run build`, `npm run typecheck`, `npm run lint` all pass.
- [ ] L2/L3 resolved (wired or explicitly deferred); L4/L5 decisions recorded.
- [ ] L1 tracked as a backlog task (or done, if a backend is available).

## Risks & Notes

- **Component tests need mocks** for `next/navigation` (`useRouter`, `usePathname`) and `next/image`; centralize these in `vitest.setup.ts`.
- **Store test isolation:** reset Zustand stores between tests to avoid cross-test bleed; clear `localStorage` in setup.
- **Playwright + mock mode:** e2e runs against mock data (no backend needed), so keep `NEXT_PUBLIC_API_URL` unset in the test env.
- Keep each change small and independently verifiable; run the build after Phase 1 before starting Phase 2.
