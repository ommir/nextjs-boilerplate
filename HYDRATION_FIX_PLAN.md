# Fix Plan — Hydration Mismatch on `<body>`

> Resolves the React "A tree hydrated but some attributes of the server
> rendered HTML didn't match the client properties" warning shown in dev.

---

## Diagnosis

The dev-overlay diff points at the `<body>` element, and the mismatched
attribute is:

```
cz-shortcut-listen="true"
```

The `cz-` prefix is injected by the **ColorZilla** browser extension (other
extensions like Grammarly inject their own: `data-gr-*`, `data-new-gr-*`,
`data-lt-installed`). The extension mutates the DOM **before React hydrates**,
so the client `<body>` carries an attribute the server-rendered HTML never had.

Key fact about the current code: [`src/app/layout.tsx`](./src/app/layout.tsx)
already sets `suppressHydrationWarning` on `<html>`, but **that flag does not
cascade**. React only suppresses the mismatch on the exact element it is placed
on (and that element's text content) — never its descendants. Because the
injected attribute lands on `<body>`, the warning survives.

This class of mismatch is **benign** (it's caused by client-only browser
extensions, not by our render logic) and only surfaces in development. The
correct, documented remedy is to opt the affected element out of the
attribute-level hydration check.

---

## The Fix

**File:** [`src/app/layout.tsx`](./src/app/layout.tsx)

Add `suppressHydrationWarning` to the `<body>` element, alongside the one
already on `<html>`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Why this is safe here:** `suppressHydrationWarning` is a single-level,
attribute/text-only escape hatch — it does **not** disable hydration for the
subtree, so every real component inside `<body>` is still fully hydration-checked.
`<body>` itself only carries a static `className`, so there is no genuine
server/client difference we'd want the warning to catch on this element.

**Effort:** S (one-line change)

---

## Acceptance Criteria

- [ ] With the ColorZilla/Grammarly extension enabled, a fresh dev load of `/`,
      `/login`, and `/dashboard` produces **no** hydration warning in the console
      or dev overlay.
- [ ] The subtree is still guarded: temporarily rendering
      `{typeof window !== "undefined" ? "client" : "server"}` inside a component
      **still** warns (proving suppression didn't leak into children). Remove the
      probe afterward.
- [ ] `npm run build`, `npm run typecheck`, and `npm run lint` stay green.
- [ ] `npm run test` and `npm run test:e2e` stay green (no behavioral change).

---

## Verification Steps

```bash
npm run dev          # load /, /login, /dashboard with the extension on — console clean
npm run typecheck
npm run lint
npm run build
```

No test changes are required; this is a render-attribute-only fix with no
observable behavior change.

---

## Non-Goals / What This Is Not

- **Not** wrapping the whole app subtree in suppression — we deliberately keep
  the flag on `<body>` only so real mismatches inside the app still surface.
- **Not** an attempt to stop extensions from mutating the DOM (impossible from
  app code).

---

## Related Observation (optional follow-up, out of scope)

While tracing the root layout, note that `data-theme="light"` is hard-coded on
`<html>`, but `useUiStore` persists a `theme` preference to `localStorage` and
only applies it to the DOM inside `setTheme`. On reload there is no
`onRehydrateStorage` step re-applying the persisted theme, so a user who chose a
non-default theme would briefly render the wrong one. This is a **separate
theming-robustness gap**, not the cause of the `<body>` hydration warning above,
and is only worth addressing if/when a real theme toggle ships. Track it apart
from this fix.
