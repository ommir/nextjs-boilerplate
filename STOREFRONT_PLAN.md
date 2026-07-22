# Implementation Plan — Public Storefront + Dashboard Product CRUD

> Splits the product experience in two: a **public storefront** at `/` where
> visitors browse the catalog, read a product page, add to cart, and check out;
> and a **private dashboard** at `/dashboard` that becomes a focused **Products
> CRUD** example and nothing else.
>
> **Baseline:** build, typecheck, lint, 64 unit/component tests, and 7 e2e tests
> are green. This plan will intentionally break several of them — see
> [§8 Test Impact](#8-test-impact).

---

## 1. Decisions Taken

| # | Decision | Choice |
| - | -------- | ------ |
| D1 | Fate of the Agency Operations dashboard | **Delete.** Dashboard becomes Products CRUD only. |
| D2 | CRUD write durability | **localStorage-backed mock repository** — create/edit/delete survive reload. |
| D3 | Cart depth | **Cart drawer + `/checkout` summary route** with a mock order confirmation. |
| D4 | Design direction | **Conventional commerce** — familiar hero + uniform product grid. |
| D5 | Typography | **Inter only.** No second family; strictly faithful to `DESIGN_SYSTEM.md` §3. |

---

## 2. Information Architecture

### Before → After

| Route | Before | After |
| ----- | ------ | ----- |
| `/` | redirect → `/dashboard` | **Storefront landing** (public) |
| `/products/[id]` | — | **Product page + add to cart** (public) |
| `/checkout` | — | **Order summary + mock place-order** (public) |
| `/dashboard` | Agency Operations overview | **Products CRUD index** (private) |
| `/dashboard/products/new` | — | **Create product** (private) |
| `/dashboard/products/[id]/edit` | — | **Edit product** (private) |
| `/dashboard/products` | storefront-ish list | *removed* (folded into `/dashboard`) |
| `/dashboard/products/[id]` | public-style detail | *removed* (storefront owns it) |
| `/dashboard/[section]` | 8 stub sections | *deleted* |
| `/login`, `/register` | unchanged | unchanged |

### Guarding

`src/middleware.ts` needs **no logic change** — it only redirects on the
`/dashboard` prefix, so `/`, `/products/*`, and `/checkout` already pass through
as public. The "authenticated user visiting `/login` → `/dashboard`" rule stays.

`src/app/dashboard/layout.tsx` keeps its server-side cookie check.

---

## 3. Design Direction — Conventional Commerce

### 3.1 The brief, pinned

- **Subject:** Studio sells a small catalog of developer and design goods —
  dashboard kits, auth modules, icon packs, a data grid, marketing pages, and one
  consulting engagement. Six real products already exist in `mockProducts.ts`.
- **Audience:** engineers and design-system people sizing up a kit before buying.
- **The landing page's job:** state what the shop sells, then let a buyer scan the
  catalog and open something.

### 3.2 Direction and rationale

A **deliberately familiar commerce layout**: a centred hero statement, then a
uniform product grid. Chosen because this is a *boilerplate* — the layout's job
is to be immediately recognisable and easy to adapt, not to impose an art
direction that every adopter has to undo first.

`DESIGN_SYSTEM.md` pins the palette and the Inter-only rule, and those are not
free variables here. So the work is to execute a conventional pattern *well*
rather than to invent a new one.

**Guardrails, so "conventional" doesn't become "generic":**

- **No gradient blob, no decorative background flourish.** The hero is type and
  whitespace on `--color-canvas`. Structure comes from hairlines, per §1.2.
- **Hierarchy inside the grid.** Uniform cells, but a clear internal type ramp:
  name at `text-body` 600, summary at `text-body-sm` in `ink-secondary`, price
  tabular and visually anchored bottom-left. Not four equal-weight lines.
- **Every state is designed** — rest, hover, focus-visible, active, disabled,
  loading, empty, error. This is where a conventional layout earns its keep.
- **Colour stays signal-only** (§2.4). The only colour on the page is status.

### 3.3 Type

Inter only (D5). One addition to the scale:

**`--text-hero`** — `clamp(2.25rem, 1.5rem + 3.5vw, 3.75rem)`, weight 600,
tracking `-0.03em`. *Rationale:* the system's largest token is 30px, tuned for a
dashboard. A landing hero needs exactly one size above that. Extending the scale
is in the system's spirit; adding a family would not be.

Everything else maps to existing tokens: `text-display` for section headings,
`text-body` / `text-body-sm` for prose, `text-label` for eyebrows, `text-caption`
for meta, and `text-metric` for the price on the product page and the checkout
total.

### 3.4 Stock as a status signal

Reuse the existing semantic tokens (§2.4) so inventory reads at a glance:

| Stock | Token | Reads as |
| ----- | ----- | -------- |
| `> 10` | `success` | In stock |
| `1–10` | `warning` | Only *n* left |
| `0` | `danger` | Sold out |

This is a small detail, not a headline gesture — but it reuses the design
system's own escalation vocabulary instead of inventing a parallel one, and it
keeps §9's "never colour-only" rule (each state ships with a label).

### 3.5 Layout — landing `/`

```
┌──────────────────────────────────────────────────────────────┐
│ ◧ Studio       Catalog  Templates  Plugins   [Cart·2] [Sign in]│ ← hairline base
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              Production-ready kits for                       │  text-hero
│                  design systems                              │
│                                                              │
│         Templates, plugins, and assets built on the          │  text-body,
│         Studio design system. Buy once, own the source.      │  ink-secondary
│                                                              │
│                  [ Browse the catalog ]                      │  primary button
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Catalog                    [All][Template][Plugin][Asset][Service]
├───────────────┬───────────────┬──────────────────────────────┤
│  ┌─────────┐  │  ┌─────────┐  │  ┌─────────┐                 │
│  │  image  │  │  │  image  │  │  │  image  │                 │
│  └─────────┘  │  └─────────┘  │  └─────────┘                 │
│  Horizon      │  Atlas Auth   │  Meridian Icon                │
│  Dashboard Kit│  Module       │  Pack                         │
│  40+ analytics│  Drop-in JWT… │  620 line icons…              │
│  $189.00  ●12 │  $89.00   ●34 │  $39.00   ● Sold out          │
└───────────────┴───────────────┴──────────────────────────────┘
```

- Hero is centred, max-width constrained, generous vertical rhythm.
- Filter row uses the product's **real taxonomy** (`template | plugin | asset |
  service`) — an existing typed union, not invented categories.
- Grid: 3-up desktop → 2-up tablet → 1-up mobile.
- Card links to `/products/[id]`; whole card is the target, with a visible
  focus ring.

### 3.6 Layout — product page `/products/[id]`

Standard two-column commerce layout — image left, buy box right.

```
← Back to catalog

┌────────────────────┐   TEMPLATE          ★ 4.8
│                    │   Horizon Dashboard Kit
│    product image   │   40+ analytics screens with the
│                    │   Studio design system baked in.
└────────────────────┘
                         $189.00                    ← text-metric
                         ● 12 in stock
                         [ Add to cart ]

                         ─────────────────────────
                         Category      Template
                         Rating        4.8 / 5
                         Availability  12 in stock
                         ─────────────────────────

About this kit
A production-grade dashboard kit covering overview, tables…

Recently viewed  [ Atlas Auth Module ] [ Cobalt Data Grid ]
```

The details table reuses the Data Table treatment (§8.3) — hairline rows,
`text-label` keys, `text-body-sm` values. "Recently viewed" is the existing
`useLocalStorage` behaviour, kept.

### 3.7 Cart drawer

Right slide-over using `--shadow-pop` — the token reserved for "things that truly
float" (§5), so this is its correct first use. Line items with quantity steppers,
remove control, subtotal in `text-metric` tabular, and a **"Check out"** primary
button routing to `/checkout`.

**Empty state is an invitation:** "Nothing in the cart yet." + "Browse the
catalog" button.

Keyboard: focus trapped while open, `Esc` closes, focus returns to the cart
trigger.

### 3.8 Checkout `/checkout` (D3)

A single-column order summary — **explicitly a demo, and it must look like one.**

```
Checkout

Order summary
─────────────────────────────────────
Horizon Dashboard Kit   ×1    $189.00
Atlas Auth Module       ×2    $178.00
─────────────────────────────────────
Subtotal                      $367.00
Total                         $367.00   ← text-metric

Email  [ you@company.com          ]

┌───────────────────────────────────┐
│ Demo checkout. No payment is      │
│ taken and no card details are     │
│ collected. Placing an order just  │
│ clears your cart.                 │
└───────────────────────────────────┘

[ Place order ]
```

**No card fields, no payment capture, not even fake ones.** A form that imitates
real payment collection is the wrong thing to ship in a template someone will
clone — it invites a downstream adopter to wire it up as though it were real.
Email plus an honest notice is enough to demonstrate the flow.

On submit: show a confirmation state with a generated order reference, clear the
cart, and offer "Back to the catalog". Empty cart → redirect to `/` rather than
render an orderless checkout.

### 3.9 Motion

Restrained, and only where it clarifies:

- Cart drawer slides in (`transform`) over `--duration-normal` with `--ease-out`.
- Cart badge ticks on add.
- Card hover: border `border` → `border-strong`, image `scale(1.03)`.

All compositor-friendly (`transform` / `opacity`), already covered by the global
`prefers-reduced-motion` collapse in `globals.css`. No page-load choreography —
it would fight the plainness of the layout.

### 3.10 Copy rules

- Active voice; the control names the outcome. **"Add to cart"** everywhere —
  never mixed with "Buy" or "Submit". Feedback says **"Added"**.
- The action keeps its name through the flow: "Check out" → `/checkout` →
  "Place order" → "Order placed".
- Stock reads "12 in stock" / "Only 3 left" / "Sold out".
- Errors say what happened and what to do; empty states invite an action.

---

## 4. Work Breakdown

### Phase A — Storefront

**A1. Extend design tokens** · `src/app/globals.css` — add `--text-hero` to
`@theme`, and register it in the tailwind-merge font-size group in
`src/lib/utils.ts` (the custom-scale list already there, or it will silently
collide with text colours). **S**

**A2. Cart feature** · new `src/features/cart/`
- `store/cartStore.ts` — Zustand + `persist` (localStorage), mirroring
  `ui-store.ts`. State `{ items: { productId, qty }[] }`; actions `addItem`,
  `removeItem`, `setQty`, `clear`; selectors for count and subtotal.
- `components/{CartDrawer,CartButton,AddToCartButton}.tsx`. **M**

**A3. Storefront chrome** · new `src/components/storefront/`
- `StorefrontHeader.tsx` (brand, taxonomy nav, cart button, Sign in link)
- `StorefrontFooter.tsx`
- `src/app/(storefront)/layout.tsx` route group. **M**

**A4. Landing page** · `src/app/(storefront)/page.tsx` + new
`features/product/components/{Hero,CatalogGrid,StockSignal}.tsx`. Replaces the
current root redirect. **M**

**A5. Product page** · `src/app/(storefront)/products/[id]/page.tsx`; rework
`ProductDetail.tsx` into the two-column buy layout with the details table. Keep
the existing "recently viewed" behaviour. **M**

**A6. Checkout** · `src/app/(storefront)/checkout/page.tsx` +
`features/cart/components/{OrderSummary,CheckoutForm,OrderConfirmation}.tsx`.
Email validation at the boundary; clears cart on success; redirects when the
cart is empty. **M**

### Phase B — Dashboard CRUD

**B1. Product repository with persistence (D2)** · extend
`features/product/services/productService.ts` with `create`, `update`, `remove`;
back the mock path with a localStorage-seeded repository so writes survive
reload. Keep the real-API branch intact. **M**

**B2. Mutation hooks** · `useCreateProduct`, `useUpdateProduct`,
`useDeleteProduct` in `hooks/useProducts.ts` — React Query mutations with
optimistic update + rollback + `invalidateQueries`. **M**

**B3. CRUD index** · `src/app/dashboard/page.tsx` becomes the products table
(§8.3): thumb, name + category, price (tabular right), stock signal, row
actions, "New product" primary button, and an empty state. **M**

**B4. Create / edit forms** · `dashboard/products/new/page.tsx` and
`.../[id]/edit/page.tsx`, sharing `ProductForm.tsx`. Validate at the boundary
(name required, price ≥ 0, stock ≥ 0, category in union) with inline field
errors. **L**

**B5. Delete confirmation** · `ConfirmDialog.tsx` in `components/ui`, wired to
the delete mutation, using the `danger` button variant. **S**

### Phase C — Teardown (D1)

**C1. Delete the Agency Operations feature**
- `src/features/dashboard/**` (6 components, `mockDashboard.ts`, `types`)
- `src/app/dashboard/[section]/page.tsx`
- old `src/app/dashboard/products/page.tsx`, `.../[id]/page.tsx`

**C2. Trim navigation** · `src/config/nav.ts` → Catalog + Settings, plus a
"View storefront ↗" link back to `/`. **S**

**C3. Reconcile `getBreadcrumbs`** · `src/lib/breadcrumbs.ts` — the "Overview"
root crumb no longer exists; retarget to the CRUD IA. **S**

### Phase D — Docs

**D1. `DESIGN_SYSTEM.md`** — add a storefront section (hero, catalog card, stock
signal, cart drawer, checkout summary) and the `--text-hero` token. Mark
§8.2/8.5/8.6/8.7 (stat card, progress bar, activity feed, segmented control) as
**reserved — documented but currently unused** rather than deleting their specs,
since they stay useful as reference. **M**

**D2. `README.md`** — rewrite the feature tour: the headline example is now a
storefront + admin CRUD, not an agency dashboard. **S**

---

## 5. New File Map

```
src/
├── app/
│   ├── (storefront)/
│   │   ├── layout.tsx                 # public chrome
│   │   ├── page.tsx                   # landing
│   │   ├── products/[id]/page.tsx     # product page
│   │   └── checkout/page.tsx          # order summary + confirmation
│   └── dashboard/
│       ├── page.tsx                   # CRUD index (replaces overview)
│       └── products/
│           ├── new/page.tsx
│           └── [id]/edit/page.tsx
├── components/
│   ├── storefront/{StorefrontHeader,StorefrontFooter}.tsx
│   └── ui/ConfirmDialog.tsx
└── features/
    ├── cart/
    │   ├── store/cartStore.ts
    │   └── components/{CartDrawer,CartButton,AddToCartButton,
    │                   OrderSummary,CheckoutForm,OrderConfirmation}.tsx
    └── product/
        └── components/{Hero,CatalogGrid,StockSignal,ProductForm}.tsx
```

---

## 6. Sequencing

```
Milestone 1 — "Storefront stands up"      A1 → A2 → A3 → A4 → A5 → A6
  Gate: browse catalog → open product → add to cart → check out → cart clears.
        Cart persists across reload.

Milestone 2 — "Dashboard manages catalog" B1 → B2 → B3 → B4 → B5
  Gate: create → edit → delete round-trips and survives reload.

Milestone 3 — "Clean house"               C1 → C2 → C3 → D1 → D2
  Gate: no dead imports; build + typecheck + lint + full test suite green.
```

Phase C runs **last on purpose** — deleting the dashboard feature before the CRUD
replaces it would leave `/dashboard` broken mid-plan.

---

## 7. Definition of Done

- [ ] `/` is a public storefront; no auth required to browse, add to cart, or check out.
- [ ] `/products/[id]` renders the product page with a working add-to-cart.
- [ ] Cart persists across reload; drawer supports quantity change and removal.
- [ ] `/checkout` summarises the order, places a mock order, and clears the cart.
- [ ] Checkout collects **no payment details** and says plainly that it's a demo.
- [ ] `/dashboard` is Products CRUD only; create/edit/delete survive reload.
- [ ] Agency Operations feature fully removed — no dead imports or nav entries.
- [ ] Stock signal uses the §2.4 status tokens, always paired with a label.
- [ ] Every interactive element has hover, focus-visible, and disabled states.
- [ ] Cart drawer traps focus, closes on `Esc`, restores focus to its trigger.
- [ ] Responsive at 320 / 768 / 1024 / 1440; no horizontal overflow.
- [ ] `npm run build`, `typecheck`, `lint`, `test`, `test:e2e` all green.

---

## 8. Test Impact

**These existing tests will break by design and must be updated, not deleted:**

| File | Why it breaks | Action |
| ---- | ------------- | ------ |
| `e2e/auth.spec.ts` | asserts the `/Agency Operations/` heading on `/dashboard` — that heading is being deleted | retarget to the CRUD heading |
| `e2e/products.spec.ts` | drives `/dashboard/products` and expects a public-style list | retarget to `/` and `/products/[id]` |
| `src/lib/breadcrumbs.test.ts` | asserts an "Overview" root and a "Products" nav lookup against the old nav | rewrite for the new IA |
| `ProductList.test.tsx` | component moves into the storefront catalog | update import path + context |

**New coverage to add:**

- `cartStore.test.ts` — add, increment an existing line, remove, subtotal maths,
  clear, persistence round-trip.
- `productService` CRUD — create assigns an id, update is immutable, delete
  removes, `getById` throws after delete.
- `StockSignal.test.tsx` — the three escalation bands.
- `ProductForm.test.tsx` — boundary validation rejects negative price/stock.
- `CheckoutForm.test.tsx` — rejects an invalid email; clears the cart on success.
- e2e `storefront.spec.ts` — browse → filter → open product → add to cart →
  drawer shows line + subtotal → survives reload.
- e2e `checkout.spec.ts` — cart → checkout → place order → confirmation → cart
  empty; empty cart redirects away from `/checkout`.
- e2e `dashboard-crud.spec.ts` — create → appears in table → edit → delete.

Coverage thresholds in `vitest.config.ts` are scoped to an explicit file list —
**that list must be updated** as modules move, or coverage will silently measure
the wrong set.

---

## 9. Risks

- **Largest deletion in the repo's history.** Phase C removes the feature the
  design system was reverse-engineered from. Sequenced last, and §8.2/8.5/8.6/8.7
  specs are retained as reference so the design language isn't lost with the code.
- **`DESIGN_SYSTEM.md` drifts** the moment the dashboard widgets go. D1 is not
  optional cleanup — it's what keeps docs and code honest, which is the stated
  contract at the top of that file.
- **A conventional layout is easy to under-execute.** The pattern is familiar by
  choice (D4), so quality has to come from the details in §3.2 — hierarchy,
  states, spacing rhythm. The guardrails there are the acceptance bar, not
  suggestions.
- **Checkout must stay obviously fake.** No card fields, no payment-shaped
  inputs, and a visible demo notice — otherwise someone clones this and treats it
  as a real payment path.
- **Cart and stock can disagree** — nothing decrements stock on add-to-cart. That
  is correct for a catalog demo, but the plan should not pretend it's an
  inventory system. Stock stays a display signal only.
```
