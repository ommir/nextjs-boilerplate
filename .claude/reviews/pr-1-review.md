# PR Review: #1 — feat: Supabase backend — auth, RLS-enforced CRUD, cart, and transactional checkout

**Reviewed**: 2026-07-23
**Author**: ommir
**Branch**: feat/supabase-backend → main
**Head**: 482946cf3fab7e386c961f6dab9a9209281d635f
**Decision**: APPROVE with comments

## Summary

Replaces the mock backend with Supabase Postgres, with RLS as the authorization
boundary. The security-critical paths (RLS policies, privilege-escalation guard,
transactional checkout, auth flows, and the follow-up RBAC redirect fix) were
each verified empirically against the live database and in a browser. No
CRITICAL or HIGH issues found. Two LOW notes below.

## Findings

### CRITICAL
None.

### HIGH
None.

### MEDIUM
None.

### LOW

1. **CSP `script-src` uses `'unsafe-inline'`** — `next.config.ts`.
   `web/security.md` calls for a per-request nonce instead of `'unsafe-inline'`.
   This is a real deviation, but a documented one: Next's App Router bootstraps
   hydration with inline scripts, and the code comment names nonce-threading via
   middleware as the next hardening step. Acceptable for now; worth a follow-up.

2. **Supabase repository `list()` search/category path is unused and untested** —
   `supabaseProductRepository.ts`. The UI only ever calls `list({})`; category
   and search are filtered client-side in `ProductList`. The `.or(...ilike...)`
   branch (with `%` wildcards passed through PostgREST) is therefore never
   exercised by the app, and the repository contract test covers only the mock
   implementation. Not a bug that will be hit in practice, but a future caller
   wiring server-side search would land on untested code. Consider an
   integration test against local Supabase, or a note that the branch is
   unverified.

## Validation Results

| Check | Result |
|---|---|
| Type check | Pass |
| Lint | Pass |
| Tests | Pass (115 unit, 29 e2e) |
| Build | Pass |

## Out of PR scope (working tree only)

Two files are modified in the working tree but not committed to this PR:

- `src/app/(storefront)/products/[slug]/page.tsx` — contains a
  `console.log(product)` debug statement (violates `coding-style.md`
  "no console.log in production code"). Remove before committing.
- `src/features/product/components/ProductDetail.tsx` — `key={product.id}`
  added to the root element.

## Files Reviewed

Full PR: 103 files (+6648 / −1740) across two commits — the Supabase migration
(b4615cc) and the RBAC redirect fix (482946c). Focus areas: SQL migrations and
RLS/RPC (supabase/migrations, supabase/tests), Server Actions (auth + product +
cart), auth guards and middleware, the repository split, and next.config
security headers.
