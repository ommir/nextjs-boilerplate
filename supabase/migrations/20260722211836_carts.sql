-- ---------------------------------------------------------------------------
-- 0005 — Server-persisted carts.
--
-- One cart per user, enforced by a unique constraint rather than by
-- application discipline. Guests keep using localStorage; `merge_guest_cart`
-- folds that into the server cart at sign-in.
-- ---------------------------------------------------------------------------

create table public.carts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.carts enable row level security;

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  qty         integer not null check (qty between 1 and 99),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (cart_id, product_id)
);

comment on table public.cart_items is
  'Deleting a product cascades here — that is what keeps a cart from holding unrenderable lines.';

alter table public.cart_items enable row level security;

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- `carts.user_id` is already indexed by its unique constraint.
create index cart_items_cart_id_idx on public.cart_items (cart_id);
create index cart_items_product_id_idx on public.cart_items (product_id);

-- ---------------------------------------------------------------------------
-- Policies — a user reaches exactly his own cart, and nothing else.
-- ---------------------------------------------------------------------------
create policy "carts_all_own"
  on public.carts for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "cart_items_all_own"
  on public.cart_items for all
  to authenticated
  using (
    cart_id in (select id from public.carts where user_id = (select auth.uid()))
  )
  with check (
    cart_id in (select id from public.carts where user_id = (select auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- current_cart_id() — get-or-create the caller's cart.
--
-- `security invoker`: it must run under the caller's RLS so it can never
-- return another user's cart, even if called with a forged argument (it takes
-- none). The insert is guarded by the unique constraint, making concurrent
-- first-writes safe.
-- ---------------------------------------------------------------------------
create or replace function public.current_cart_id()
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_cart uuid;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  insert into public.carts (user_id)
  values (v_user)
  on conflict (user_id) do nothing;

  select id into v_cart from public.carts where user_id = v_user;
  return v_cart;
end;
$$;

revoke execute on function public.current_cart_id() from public, anon;
grant execute on function public.current_cart_id() to authenticated;

-- ---------------------------------------------------------------------------
-- merge_guest_cart(p_items) — fold a localStorage cart into the server cart.
--
-- Input shape: [{"product_id": "<uuid>", "qty": 2}, ...]
-- Quantities sum, capped at the same 99 the table allows. Unknown or
-- unpublished product ids are silently dropped rather than failing the whole
-- merge — a stale guest cart must not block sign-in.
-- ---------------------------------------------------------------------------
create or replace function public.merge_guest_cart(p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_cart uuid := public.current_cart_id();
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    return;
  end if;

  insert into public.cart_items (cart_id, product_id, qty)
  select
    v_cart,
    p.id,
    least(sum((item ->> 'qty')::integer), 99)
  from jsonb_array_elements(p_items) as item
  join public.products p
    on p.id = (item ->> 'product_id')::uuid
   and p.is_published
  where (item ->> 'qty') ~ '^[0-9]+$'
    and (item ->> 'qty')::integer > 0
  group by p.id
  on conflict (cart_id, product_id) do update
    set qty        = least(public.cart_items.qty + excluded.qty, 99),
        updated_at = now();
end;
$$;

revoke execute on function public.merge_guest_cart(jsonb) from public, anon;
grant execute on function public.merge_guest_cart(jsonb) to authenticated;
