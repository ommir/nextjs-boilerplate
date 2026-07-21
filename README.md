# Studio — Next.js Frontend Boilerplate

A production-ready, **feature-based** Next.js frontend boilerplate. It ships a real
authenticated dashboard (reverse-engineered from the _Studio · Agency Operations_
reference), a CRUD product module, typed data plumbing, and a fully documented
design system — so you start from a working foundation, not a blank `app/`.

> **Runs with zero backend.** When `NEXT_PUBLIC_API_URL` is left as the placeholder,
> every service serves in-memory mock data. Point it at a real API and the same
> code hits your endpoints.

---

## ✨ Highlights

| Area              | What's included                                                              |
| ----------------- | --------------------------------------------------------------------------- |
| **Framework**     | Next.js 15 (App Router, RSC), React 19, TypeScript (strict)                 |
| **Styling**       | Tailwind CSS v4 with a token-first `@theme` design system                   |
| **State**         | Zustand (primary) · Redux Toolkit (optional example) · React Query (server) |
| **Auth**          | Signed HttpOnly session cookie via Route Handlers, Zustand profile store, middleware + server guard, RBAC |
| **Dashboard**     | Sidebar + header shell, metric cards, data tables, activity feed, burn bars |
| **Product module**| List with filter/search + detail, loading / error / empty states            |
| **DX**            | Absolute imports (`@/*`), ESLint, Prettier, typed API client                |
| **Design system** | [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — the single source of truth for tokens |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. (optional) configure environment
cp .env.example .env.local        # runs in mock mode if you skip this

# 3. Start the dev server
npm run dev                       # http://localhost:3000
```

You'll land on the login screen with **demo credentials pre-filled** — click
**Sign in** to enter the dashboard. Any email/password works in mock mode.

### Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Production build                     |
| `npm run start`     | Serve the production build           |
| `npm run lint`      | ESLint                               |
| `npm run typecheck` | `tsc --noEmit`                       |
| `npm run format`    | Prettier write                       |

---

## 📁 Project Structure

Feature-based and domain-driven. Everything for a feature lives together; shared,
cross-cutting code lives at the top level.

```
src/
├── app/                      # Routes (App Router)
│   ├── (auth)/               #   route group: login, register
│   ├── dashboard/            #   protected shell + overview, products, stubs
│   ├── layout.tsx            #   root layout + fonts + providers
│   ├── providers.tsx         #   React Query (client)
│   └── globals.css           #   design tokens (@theme) — see DESIGN_SYSTEM.md
├── features/                 # Self-contained domains
│   ├── auth/                 #   components · hooks · services · store · guards · types
│   ├── product/              #   components · hooks · services · data · types
│   └── dashboard/            #   components · data · types
├── components/
│   ├── ui/                   # Reusable primitives (Button, Card, Table, Badge…)
│   └── shared/               # App chrome (Sidebar, Header)
├── lib/                      # api-client, query-client, cookies, utils
├── hooks/                    # Generic hooks (useMediaQuery, useLocalStorage)
├── store/                    # ui-store (Zustand) + redux/ (optional example)
├── config/                   # env, site, nav
└── types/                    # Global shared types
```

### Layering rules

- **UI → logic → data** flows one way. Presentational components (`components/ui`)
  never fetch; container components (`*List`, `*Detail`) own data via hooks.
- **Services** are the only place that talk to the network (`lib/api-client`).
- **Feature isolation:** a feature imports from `@/lib`, `@/components/ui`, and its
  own folder — not from another feature's internals.

---

## 🧠 State Management

Three concerns, three tools — never duplicate server state into a client store.

| Concern       | Tool                    | Example                                  |
| ------------- | ----------------------- | ---------------------------------------- |
| Server state  | **React Query**         | `features/product/hooks/useProducts.ts`  |
| Client/global | **Zustand**             | `features/auth/store`, `store/ui-store`  |
| Complex/enterprise | **Redux Toolkit** _(optional)_ | `store/redux/*` (not mounted by default) |

Zustand stores are **feature-modularized** and use `persist` for durable slices
(session, theme). See `store/ui-store.ts` and `features/auth/store/authStore.ts`.

To adopt Redux, wrap the tree with `ReduxProvider` (see `store/redux/ReduxProvider.tsx`).

---

## 🔐 Authentication

- **Route Handlers** (`app/api/auth/{login,register,logout,me}/route.ts`): validate
  credentials and set/clear a **signed, HttpOnly** session cookie server-side.
  Swap the mock validation in `mockAuthBackend.ts` for a real user lookup.
- **Service** (`features/auth/services/authService.ts`): thin `fetch` wrapper
  around those route handlers. The client never sees the token itself.
- **Store** (`authStore.ts`): Zustand + `persist`; holds the `user` profile only,
  for display — not the session, which lives entirely in the cookie.
- **Protection:** `src/middleware.ts` (edge) is the first gate; `dashboard/layout.tsx`
  backs it up with a server-side check of the same cookie before rendering — no
  client mount-gate, no "Checking your session…" flash.
- **RBAC:** `User.role` (`admin | member | viewer`) drives nav filtering
  (`config/nav.ts`) and `useAuth().hasRole(...)`.

> `src/lib/session.ts` signs the cookie payload (HMAC) so it can't be tampered
> with client-side, but it's still a boilerplate-grade stand-in — swap in a
> vetted session library (NextAuth, Lucia, Iron Session) for production, and set
> a real `AUTH_SECRET` env var.

---

## 🛍️ Product Module

`/dashboard/products` (list, with category filter + search) and
`/dashboard/products/[id]` (detail). Demonstrates the full data lifecycle:
React Query hooks → service → typed models, with **loading / error / empty**
states and skeletons.

---

## 🎨 Design System

The visual language is documented in **[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)** and
implemented as CSS variables in [`src/app/globals.css`](./src/app/globals.css) via
Tailwind v4's `@theme`. Consume tokens through utilities:

```tsx
<Card className="text-ink">
  <Badge tone="danger" dot>Over pace</Badge>
</Card>
```

Because everything is a token, theming (including a future dark mode) is a matter
of overriding `--color-*` values — no component changes.

---

## ⚙️ Conventions

- **Imports:** absolute via `@/*`.
- **Naming:** `PascalCase` components/types, `camelCase` functions/vars, `use`-prefixed hooks.
- **Docs:** JSDoc on exported functions/services; comments explain _why_, not _what_.
- **Files:** small and cohesive (≤ ~200–400 lines), organized by feature.
- **Immutability:** state updates return new objects (Zustand/RTK patterns).
- **Emoji:** used in section headings here and in `DESIGN_SYSTEM.md` for scannability —
  that's a Markdown-docs convention, not a source-code one. Source stays emoji-free.

---

## 🔧 Environment Variables

| Variable               | Public | Purpose                                             |
| ---------------------- | :----: | --------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  |   ✅   | Backend base URL. Placeholder → **mock mode**.      |
| `NEXT_PUBLIC_APP_NAME` |   ✅   | App name in UI + titles.                            |
| `AUTH_SECRET`          |   ❌   | Server-only secret for signing/verifying tokens.    |

---

## 📦 Next Steps

1. Replace mock services with your API (set `NEXT_PUBLIC_API_URL`).
2. Swap the demo auth for real, HttpOnly-cookie sessions.
3. Build out the stubbed sections under `src/features/*` and route them in.
4. Fill in dark-theme token values in `globals.css` if you want a dark mode.
