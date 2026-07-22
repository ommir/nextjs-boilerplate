-- ---------------------------------------------------------------------------
-- Local / CI seed data.
--
-- Runs on `supabase db reset` and before `supabase test db`. It is NOT applied
-- to the hosted project: the demo accounts below have well-known passwords, and
-- a public repo advertising working credentials against a live database is an
-- open door. On a hosted project, sign up through the app and promote yourself:
--
--   update public.profiles set role = 'admin' where id = '<your auth uid>';
-- ---------------------------------------------------------------------------

-- --------------------------------------------------------------------------
-- Demo accounts (local only). Password for both: `demo-password-1234`
-- --------------------------------------------------------------------------
-- NOTE the empty-string token columns below. GoTrue scans them into a Go
-- `string`, so a NULL there makes every sign-in fail with
-- "converting NULL to string is unsupported" — a 500 that looks nothing like
-- a credentials problem. Leaving them out of a hand-written INSERT is the
-- single most common way to produce a seeded user that cannot log in.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
)
values
  ('00000000-0000-0000-0000-000000000000',
   'aaaaaaaa-0000-4000-8000-000000000001',
   'authenticated', 'authenticated', 'admin@studio.test',
   extensions.crypt('demo-password-1234', extensions.gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Studio Admin"}'::jsonb, false, false,
   '', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   'aaaaaaaa-0000-4000-8000-000000000002',
   'authenticated', 'authenticated', 'member@studio.test',
   extensions.crypt('demo-password-1234', extensions.gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"name":"Studio Member"}'::jsonb, false, false,
   '', '', '', '', '', '', '', '')
on conflict (id) do nothing;

-- GoTrue needs a matching identity row for password sign-in to work.
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
values
  (gen_random_uuid(), 'aaaaaaaa-0000-4000-8000-000000000001',
   'aaaaaaaa-0000-4000-8000-000000000001',
   '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","email":"admin@studio.test","email_verified":true,"phone_verified":false}'::jsonb,
   'email', now(), now(), now()),
  (gen_random_uuid(), 'aaaaaaaa-0000-4000-8000-000000000002',
   'aaaaaaaa-0000-4000-8000-000000000002',
   '{"sub":"aaaaaaaa-0000-4000-8000-000000000002","email":"member@studio.test","email_verified":true,"phone_verified":false}'::jsonb,
   'email', now(), now(), now())
on conflict do nothing;

-- The on_auth_user_created trigger already made both profiles as 'member'.
update public.profiles
set role = 'admin'
where id = 'aaaaaaaa-0000-4000-8000-000000000001';

-- --------------------------------------------------------------------------
-- Catalog — ported from the former src/features/product/data/mockProducts.ts.
-- Prices are integer cents.
-- --------------------------------------------------------------------------
insert into public.products
  (slug, name, summary, description, price_cents, category, rating, stock, created_by)
values
  ('horizon-dashboard-kit', 'Horizon Dashboard Kit',
   '40+ analytics screens with the Studio design system baked in.',
   'A production-grade dashboard kit covering overview, tables, billing, and settings. Ships with tokens, dark-ready theming, and fully typed components so your team starts from a real foundation instead of a blank canvas.',
   18900, 'template', 4.8, 12, 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('atlas-auth-module', 'Atlas Auth Module',
   'Drop-in JWT + OAuth flows with RBAC and session guards.',
   'Email/password and OAuth-ready authentication with role-based access control, middleware guards, and a Zustand session store. Wire it to your backend or run the bundled mock adapter in minutes.',
   8900, 'plugin', 4.6, 34, 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('meridian-icon-pack', 'Meridian Icon Pack',
   '620 line icons tuned for 1.5px stroke interfaces.',
   'A cohesive icon set drawn on a 24px grid to match the Studio aesthetic. Delivered as optimized SVGs and a tree-shakeable React package.',
   3900, 'asset', 4.9, 0, 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('summit-onboarding-audit', 'Summit Onboarding Audit',
   'A senior engineer reviews your setup and hands back a plan.',
   'A focused engagement: we review your repo, architecture, and DX, then deliver a prioritized report with concrete next steps and a reference implementation for the trickiest piece.',
   120000, 'service', 5.0, 5, 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('cobalt-data-grid', 'Cobalt Data Grid',
   'Virtualized, sortable, filterable table for large datasets.',
   'A headless data grid with column virtualization, multi-sort, and server-side pagination hooks. Themed with Studio tokens out of the box.',
   12900, 'plugin', 4.7, 21, 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('verve-marketing-pages', 'Verve Marketing Pages',
   '12 conversion-focused landing sections, fully responsive.',
   'Hero, features, pricing, testimonials, and CTA sections engineered for Core Web Vitals. Copy slots and imagery are easy to swap for your brand.',
   14900, 'template', 4.5, 18, 'aaaaaaaa-0000-4000-8000-000000000001')
on conflict (slug) do nothing;
