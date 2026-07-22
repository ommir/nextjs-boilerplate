# Supabase Backend

How auth, data, and authorization actually work in this project — and, more
importantly, why they are arranged this way.

---

## 1. The one idea

**Postgres decides who can read and write what.** Not React, not the Server
Actions, not the middleware.

Every query runs as the signed-in user with the *publishable* key, and Row
Level Security filters it. The application-level checks (`requireAdmin()`,
hidden buttons, route guards) exist to give people sensible redirects and
readable errors. If every one of them were deleted tomorrow, a member still
could not write a product or read someone else's order.

That is the property worth preserving in any change to this codebase.

There is **no service-role key anywhere in the app**. Nothing needs it, and its
absence means a leaked environment variable cannot become a total database
compromise.

---

## 2. Layout

```
supabase/
  migrations/     forward-only schema history, replayable from zero
  tests/          pgTAP suites — the executable version of the policy rules
  seed.sql        local/CI seed: demo accounts + the six catalog products
  config.toml

src/lib/supabase/
  server.ts           RSC / Server Actions / Route Handlers (per-request client)
  client.ts           browser — auth listener only, never used for reads/writes
  middleware.ts       token refresh via updateSession()
  database.types.ts   GENERATED — never hand-edit, run `npm run db:types`

src/lib/auth/guards.ts   requireUser / requireRole / requireAdmin
```

Feature code follows one shape:

```
features/<name>/
  actions/       "use server" — authorize, validate, delegate, revalidate
  repositories/  interface + supabase impl + mock impl (one selection point)
  schemas/       zod, shared by client and server
  mappers/       DB row (snake_case, cents) <-> domain model
```

---

## 3. Schema

| Table | Purpose | Who can read | Who can write |
| ----- | ------- | ------------ | ------------- |
| `profiles` | one row per auth user, holds `role` | self, admins | self — **name and avatar only** |
| `products` | catalog | anyone (published), admins (all) | admins |
| `carts` / `cart_items` | server cart | owner | owner |
| `orders` / `order_items` | placed orders | owner, admins | **nobody** — only `place_order()` |

Money is `integer` cents everywhere. Dollars exist only at the display edge,
converted in `productMapper.ts`.

### Helper functions live in a `private` schema

`private.is_admin()`, `private.set_updated_at()`, `private.handle_new_user()`.

PostgREST publishes every function in `public` as `/rest/v1/rpc/<name>`. Moving
helpers into `private` — which is not an exposed schema — removes those
endpoints entirely while policies and triggers keep working. The security
advisor flagged this; migration `0007` is the fix.

`public.place_order()` deliberately stays public and callable by
`authenticated`. It *is* the checkout API. Its safety comes from what it reads,
not from being hidden.

---

## 4. The three guard rails worth understanding

### Privilege escalation is closed with column grants, not a policy

```sql
revoke update on public.profiles from authenticated;
grant  update (name, avatar_url) on public.profiles to authenticated;
```

A user updating their own profile physically cannot touch `role`. Even a
too-permissive UPDATE policy could not grant a column privilege that was never
given. Verified: a member's `set role = 'admin'` on their own row returns 42501.

### Checkout cannot be price-tampered

`place_order(p_email)` takes **only an email**. It reads the caller's cart and
the product prices from the database, locks the product rows `for update`,
checks stock, computes the totals, writes the order with per-line price
snapshots, decrements stock, and clears the cart — one transaction.

The client chooses quantities. It never sends a price. There is no code path
where a forged request changes what something costs.

### Orders are append-only

No UPDATE or DELETE policy exists on `orders` or `order_items` for anyone,
including the owner. Verified: both return 42501.

---

## 5. Sessions

Use `supabase.auth.getClaims()` for anything that gates access. It verifies the
JWT signature against the project's published keys.

**Never `getSession()` server-side.** It does not revalidate the token and its
data comes from cookies, which a client can forge. There is an ESLint rule
(`no-restricted-syntax`) that fails the build on it — along with rules banning a
raw `createClient` and any `SERVICE_ROLE`/`SECRET_KEY` env access.

---

## 6. Local development

```bash
npm run db:start    # local stack (requires Docker)
npm run db:reset    # replay all migrations + seed.sql
npm run db:test     # pgTAP policy suites
npm run db:types    # regenerate database.types.ts — run after every migration
npm run db:push     # apply pending migrations to the linked project
```

Without Docker, work against the hosted project directly; `db:reset` and
`db:test` are the only commands that need it.

### Seeding auth users by hand

`seed.sql` inserts into `auth.users` directly. Note the empty-string token
columns:

```sql
confirmation_token, recovery_token, email_change, email_change_token_new,
email_change_token_current, phone_change, phone_change_token,
reauthentication_token   -- all '', never NULL
```

GoTrue scans these into a Go `string`. A NULL makes **every sign-in fail** with
`converting NULL to string is unsupported` — a 500 that looks nothing like a
credentials problem. This bit us during development; the comment in `seed.sql`
is there so it does not bite again.

---

## 7. Adding a table

1. Write a migration. Enable RLS in the same file — never "later".
2. Write policies naming their role (`to authenticated`, `to anon`). An
   unqualified policy is evaluated for every role.
3. Wrap `auth.uid()` and helpers as `(select …)` so Postgres caches them as an
   InitPlan instead of re-running per row.
4. Index every column a policy filters on.
5. Add a pgTAP test for what each role **cannot** do. A policy without a
   negative test is an assumption, not a control.
6. `npm run db:types`.
7. Check the advisors — the MCP `get_advisors` tool, or the dashboard's
   Security Advisor.

Any `SECURITY DEFINER` function must set `search_path = ''` and fully-qualify
every identifier, or it becomes a privilege-escalation primitive.

---

## 8. Mock mode

With no Supabase env vars, repositories serve in-memory data and the app treats
you as a signed-in admin, so the boilerplate runs with `npm install && npm run dev`.

**A production build refuses to start unconfigured.** That is not a
convenience check: without it, a deploy with a typo'd env var would silently
fall back to "everyone is an admin". See the guard in `src/config/env.ts`.

---

## 9. Promoting yourself to admin

Sign up through the app, then:

```sql
update public.profiles set role = 'admin' where id = '<your auth uid>';
```

The demo accounts in `seed.sql` are **local/CI only**. They are not applied to
the hosted project — a public repo advertising working credentials against a
live database is an open door.
