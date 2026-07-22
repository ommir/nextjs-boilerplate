-- ---------------------------------------------------------------------------
-- 0008 — Normalise the checkout email before validating it.
--
-- Bug found by the checkout verification suite: place_order() ran the email
-- regex against the *raw* argument and only lower/trimmed it at INSERT time.
-- A perfectly ordinary "  Buyer@Example.com " — the kind of value that arrives
-- when someone pastes an address, or when a mobile keyboard appends a space —
-- failed the `[:space:]` class and aborted the whole order with INVALID_EMAIL.
--
-- Fix: canonicalise once, up front, then validate and store that single value.
-- ---------------------------------------------------------------------------

create or replace function public.place_order(p_email text)
returns table (order_id uuid, order_reference text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user      uuid := (select auth.uid());
  v_email     text := lower(trim(coalesce(p_email, '')));
  v_cart      uuid;
  v_order     uuid := pg_catalog.gen_random_uuid();
  v_reference text;
  v_subtotal  bigint := 0;
  v_item      record;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     or char_length(v_email) > 254
  then
    raise exception 'INVALID_EMAIL' using errcode = '22023';
  end if;

  select c.id into v_cart from public.carts c where c.user_id = v_user;

  if v_cart is null
     or not exists (select 1 from public.cart_items where cart_id = v_cart)
  then
    raise exception 'CART_EMPTY' using errcode = 'P0001';
  end if;

  -- Lock every product in the cart, in id order, before reading stock.
  perform p.id
  from public.products p
  where p.id in (select ci.product_id from public.cart_items ci where ci.cart_id = v_cart)
  order by p.id
  for update;

  for v_item in
    select ci.qty, p.slug, p.price_cents, p.stock, p.is_published
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.cart_id = v_cart
    order by p.id
  loop
    if not v_item.is_published then
      raise exception 'PRODUCT_UNAVAILABLE:%', v_item.slug using errcode = 'P0001';
    end if;
    if v_item.stock < v_item.qty then
      raise exception 'INSUFFICIENT_STOCK:%', v_item.slug using errcode = 'P0001';
    end if;
    v_subtotal := v_subtotal + (v_item.price_cents::bigint * v_item.qty);
  end loop;

  if v_subtotal > 2147483647 then
    raise exception 'ORDER_TOO_LARGE' using errcode = '22003';
  end if;

  v_reference := 'STU-' || upper(substr(replace(v_order::text, '-', ''), 1, 8));

  insert into public.orders (id, user_id, reference, email, status, subtotal_cents, total_cents)
  values (v_order, v_user, v_reference, v_email, 'pending', v_subtotal, v_subtotal);

  insert into public.order_items (order_id, product_id, name, slug, unit_price_cents, qty)
  select v_order, p.id, p.name, p.slug, p.price_cents, ci.qty
  from public.cart_items ci
  join public.products p on p.id = ci.product_id
  where ci.cart_id = v_cart;

  update public.products p
  set stock = p.stock - ci.qty
  from public.cart_items ci
  where ci.product_id = p.id
    and ci.cart_id = v_cart;

  delete from public.cart_items where cart_id = v_cart;

  return query select v_order, v_reference;
end;
$$;

revoke execute on function public.place_order(text) from public, anon;
grant execute on function public.place_order(text) to authenticated;
