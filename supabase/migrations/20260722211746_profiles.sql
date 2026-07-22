-- ---------------------------------------------------------------------------
-- 0002 — Profiles, roles, and the admin predicate.
--
-- `profiles` mirrors `auth.users` 1:1 and is created by trigger on sign-up.
-- `profiles.role` drives every admin check in the system, so the central
-- security concern here is that a user must never be able to promote himself.
-- That is enforced with COLUMN-level privileges, not with a policy: even a
-- permissive UPDATE policy cannot grant a column the role was never given.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  avatar_url  text check (avatar_url is null or char_length(avatar_url) <= 2048),
  role        public.app_role not null default 'member',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile per auth user. `role` is not user-writable — see column grants below.';

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin predicate.
--
-- `security definer` so it can read `profiles` without recursing into the very
-- policies that call it. Marked `stable` and always invoked as
-- `(select public.is_admin())` so Postgres evaluates it once per statement
-- (InitPlan) rather than once per row — see Supabase lint 0003_auth_rls_initplan.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Provision a profile whenever an auth user is created.
-- `on conflict do nothing` keeps sign-up idempotent if the trigger ever reruns.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Column privileges: the privilege-escalation guard.
--
-- Supabase grants `authenticated` full table privileges by default. Revoke the
-- blanket UPDATE and hand back only the two columns a user owns. An attacker
-- calling PostgREST with `{"role":"admin"}` gets 42501, regardless of policies.
-- ---------------------------------------------------------------------------
revoke update on public.profiles from authenticated;
grant update (name, avatar_url) on public.profiles to authenticated;

-- No INSERT/DELETE grants or policies: rows arrive via the trigger above and
-- leave via the cascade from auth.users. Nothing else may touch them.
revoke insert, delete on public.profiles from authenticated, anon;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using ((select public.is_admin()));

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
