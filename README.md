# Studio — Next.js Frontend Boilerplate

A production-ready, **feature-based** Next.js frontend boilerplate. It ships a real
public **storefront** (catalog, product page, cart, checkout) plus an authenticated
**Products CRUD admin**, typed data plumbing, and a fully documented design system —
so you start from a working foundation, not a blank `app/`.

> **Runs with zero backend.** Leave the Supabase variables blank and every
> repository serves in-memory mock data. Fill them in and the same code talks to
> a real Postgres, with Row Level Security deciding what each user may touch.

---

## ✨ Highlights

| Area              | What's included                                                              |
| ----------------- | --------------------------------------------------------------------------- |
| **Framework**     | Next.js 15 (App Router, RSC), React 19, TypeScript (strict)                 |
| **Styling**       | Tailwind CSS v4 with a token-first `@theme` design system                   |
| **State**         | Zustand (primary) · Redux Toolkit (optional example) · React Query (server) |
| **Backend**       | Supabase Postgres — RLS on every table, pgTAP policy tests, forward-only migrations |
| **Auth**          | Supabase Auth (email + password, confirmation, password reset), Server Actions, JWT-verified guards, RBAC |
| **Storefront**    | Public catalog + filter/search, product page, persisted cart drawer, transactional checkout |
| **Dashboard**     | Products CRUD — table, create/edit forms with image upload, delete confirmation, admin-gated |
| **Data layer**    | Server Components read · Server Actions write · repository interface with Supabase + mock implementations |
| **DX**            | Absolute imports (`@/*`), ESLint security rules, Prettier, generated DB types |
| **Design system** | [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — the single source of truth for tokens |
| **Backend docs**  | [`docs/SUPABASE.md`](./docs/SUPABASE.md) — schema, policies, and why they are shaped that way |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. (optional) point at a Supabase project
cp .env.example .env.local        # runs in mock mode if you skip this

# 3. Start the dev server
npm run dev                       # http://localhost:3000
```

You'll land on the public **storefront** — browse the catalog, open a product,
add it to cart, and check out (no payment is ever collected).

**Mock mode** (no Supabase configured) serves in-memory data and treats you as a
signed-in admin, so you can explore `/dashboard` immediately. A *production*
build refuses to start unconfigured — falling back to "everyone is an admin" in
production would be an authentication bypass, so it is made impossible rather
than documented as a caveat.

**With Supabase configured**, sign up at `/register`, confirm your email, then
promote yourself:

```sql
update public.profiles set role = 'admin' where id = '<your auth uid>';
```

See [`docs/SUPABASE.md`](./docs/SUPABASE.md) for the schema, the policy model,
and the reasoning behind both.

### Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Production build                     |
| `npm run start`     | Serve the production build           |
| `npm run lint`      | ESLint                               |
| `npm run typecheck` | `tsc --noEmit`                       |
| `npm run format`    | Prettier write                       |
| `npm run test`      | Unit + component tests (Vitest)      |
| `npm run test:e2e`  | End-to-end tests (Playwright)        |
| `npm run db:reset`  | Replay migrations + seed (needs Docker) |
| `npm run db:test`   | pgTAP RLS policy suites (needs Docker)  |
| `npm run db:types`  | Regenerate `database.types.ts`       |
| `npm run db:push`   | Apply pending migrations to the linked project |

---

## 📁 Project Structure

Feature-based and domain-driven. Everything for a feature lives together; shared,
cross-cutting code lives at the top level.

```
src/
├── app/                      # Routes (App Router)
│   ├── (storefront)/         #   route group: public landing, /products/[id], /checkout
│   ├── (auth)/               #   route group: login, register
│   ├── api/auth/              #   route handlers: login, register, logout, me
│   ├── dashboard/            #   protected shell + Products CRUD (index, new, [id]/edit, settings)
│   ├── layout.tsx            #   root layout + fonts + providers
│   ├── providers.tsx         #   React Query (client)
│   └── globals.css           #   design tokens (@theme) — see DESIGN_SYSTEM.md
├── features/                 # Self-contained domains
│   ├── auth/                 #   components · hooks · services · store · types
│   ├── product/              #   components · hooks · services · data · lib · types
│   └── cart/                 #   store (Zustand + persist) · drawer · checkout components
├── components/
│   ├── ui/                   # Reusable primitives (Button, Card, Table, Badge, ConfirmDialog…)
│   ├── shared/               # Dashboard chrome (Sidebar, Header)
│   └── storefront/           # Public chrome (StorefrontHeader, StorefrontFooter)
├── lib/                      # api-client, query-client, cookies, session, utils
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
| Client/global | **Zustand**             | `features/auth/store`, `features/cart/store`, `store/ui-store` |
| Complex/enterprise | **Redux Toolkit** _(optional)_ | `store/redux/*` (not mounted by default) |

Zustand stores are **feature-modularized** and use `persist` for durable slices
(session profile, cart, theme). See `store/ui-store.ts`, `features/auth/store/authStore.ts`,
and `features/cart/store/cartStore.ts`.

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

## 🛍️ Storefront & Cart

Public, no auth required:

- **`/`** — landing hero + catalog grid (category filter + search), reusing the
  same `ProductList` container the dashboard's data lifecycle demonstrates.
- **`/products/[id]`** — product page: image, price, **Stock Signal**
  (§8.11 in `DESIGN_SYSTEM.md` — reuses the design system's own success/warning/danger
  escalation tokens, inverted for inventory), spec table, "recently viewed"
  (`useLocalStorage`), add-to-cart.
- **Cart** (`features/cart`) — persisted Zustand store; a focus-trapped,
  `Esc`-closing drawer; quantity steppers; subtotal.
- **`/checkout`** — order summary + a **mock** place-order flow. No payment
  fields, not even fake ones — see `DESIGN_SYSTEM.md` §8.14 for why.

## 🛠️ Dashboard: Products CRUD

`/dashboard` (protected) is a full create/read/update/delete example over the
same product catalog the storefront reads from:

- **Index** — sortable table (thumbnail, price, Stock Signal, row actions).
- **`/dashboard/products/new`** / **`/dashboard/products/[id]/edit`** — shared
  `ProductForm`, validated at the boundary (required fields, non-negative
  price/stock).
- **Delete** — `ConfirmDialog` (same focus-trap contract as the cart drawer),
  `danger`-variant confirm.
- **Persistence** — mock mode backs `productService` with a localStorage-seeded
  catalog, so create/update/delete survive a reload with zero backend. Mutations
  use React Query with optimistic updates + rollback (`features/product/hooks/useProducts.ts`).

Both surfaces share one data lifecycle: React Query hooks → service → typed
models, with **loading / error / empty** states throughout.

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

1. Replace mock services with your API (set `NEXT_PUBLIC_API_URL`); `productService`'s
   real-API branch is already wired for `list`/`getById`/`create`/`update`/`remove`.
2. Swap `mockAuthBackend.ts`'s validation for a real user lookup, and a vetted
   session library (NextAuth, Lucia, Iron Session) in place of `lib/session.ts`.
3. Wire `/checkout` to a real payment provider if you need one — it's
   deliberately a mock today (see `DESIGN_SYSTEM.md` §8.14).
4. Fill in dark-theme token values in `globals.css` if you want a dark mode.
