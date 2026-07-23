-- ---------------------------------------------------------------------------
-- 0001 — Extensions, enums, and shared trigger helpers.
--
-- Extensions live in the `extensions` schema, never `public`: anything in an
-- exposed schema is reachable through PostgREST.
-- ---------------------------------------------------------------------------

create extension if not exists pg_trgm with schema extensions;

-- Mirrors `UserRole` in src/features/auth/types.
create type public.app_role as enum ('admin', 'member', 'viewer');

-- Mirrors `ProductCategory` in src/features/product/types.
create type public.product_category as enum ('template', 'plugin', 'asset', 'service');

create type public.order_status as enum ('pending', 'paid', 'cancelled');

-- ---------------------------------------------------------------------------
-- Shared `updated_at` trigger.
--
-- `security invoker` + an empty search_path: this runs with the caller's
-- privileges and cannot be tricked into resolving `now()` against an
-- attacker-controlled schema.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
