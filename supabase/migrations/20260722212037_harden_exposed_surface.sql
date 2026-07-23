-- ---------------------------------------------------------------------------
-- 0007 — Shrink the PostgREST-exposed surface.
--
-- Raised by `supabase advisors --type security` after 0001–0006:
--
--   1. `public_bucket_allows_listing` — a broad SELECT policy on
--      storage.objects let any client *enumerate* every file in the
--      product-images bucket. A public bucket serves objects over
--      /storage/v1/object/public/... without consulting RLS at all, so that
--      policy bought nothing and leaked the file listing. Dropped.
--
--   2/3. `is_admin()` and `handle_new_user()` were SECURITY DEFINER functions
--      sitting in `public`, which PostgREST publishes as /rest/v1/rpc/<name>.
--      Only `public` and `graphql_public` are exposed, so moving helpers into a
--      `private` schema removes the endpoints entirely while policies and
--      triggers keep working. `set_updated_at()` moves with them for
--      consistency: no helper belongs in the exposed schema.
--
-- `place_order()` deliberately stays in `public` and callable by
-- `authenticated` — it *is* the checkout API. Its safety comes from reading
-- the cart and prices server-side, not from being hidden.
-- ---------------------------------------------------------------------------

create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Re-home the helpers
-- ---------------------------------------------------------------------------
create or replace function private.is_admin()
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

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create or replace function private.set_updated_at()
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

create or replace function private.handle_new_user()
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

-- ---------------------------------------------------------------------------
-- Repoint every policy at private.is_admin()
-- ---------------------------------------------------------------------------
drop policy "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using ((select private.is_admin()));

drop policy "products_admin_read_all" on public.products;
create policy "products_admin_read_all"
  on public.products for select to authenticated
  using ((select private.is_admin()));

drop policy "products_admin_insert" on public.products;
create policy "products_admin_insert"
  on public.products for insert to authenticated
  with check ((select private.is_admin()));

drop policy "products_admin_update" on public.products;
create policy "products_admin_update"
  on public.products for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products for delete to authenticated
  using ((select private.is_admin()));

drop policy "orders_select_admin" on public.orders;
create policy "orders_select_admin"
  on public.orders for select to authenticated
  using ((select private.is_admin()));

drop policy "order_items_select_admin" on public.order_items;
create policy "order_items_select_admin"
  on public.order_items for select to authenticated
  using ((select private.is_admin()));

-- Storage: drop the listing policy outright, repoint the write policies.
drop policy "product_images_public_read" on storage.objects;

drop policy "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select private.is_admin()));

drop policy "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()))
  with check (bucket_id = 'product-images' and (select private.is_admin()));

drop policy "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Repoint every trigger, then drop the public originals
-- ---------------------------------------------------------------------------
drop trigger profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

drop trigger products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function private.set_updated_at();

drop trigger carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function private.set_updated_at();

drop trigger cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function private.set_updated_at();

drop trigger on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop function public.is_admin();
drop function public.handle_new_user();
drop function public.set_updated_at();
