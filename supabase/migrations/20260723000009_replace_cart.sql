-- ---------------------------------------------------------------------------
-- 0009 — replace_cart(): make the server cart match the client's.
--
-- The cart lives in localStorage while browsing so that +/- feels instant and
-- guests get a cart at all. At checkout the server cart has to be brought in
-- line with it before place_order() reads it.
--
-- `merge_guest_cart` cannot be reused here: it *sums* quantities, which is
-- right when folding a guest cart into an existing account cart, and wrong
-- here — checking out twice would double the quantities.
--
-- The client chooses quantities, which is its business. It does not get to
-- choose prices or stock: place_order() still reads those from the database,
-- so this stays outside the trust boundary that matters.
-- ---------------------------------------------------------------------------

create or replace function public.replace_cart(p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_cart uuid := public.current_cart_id();
begin
  delete from public.cart_items where cart_id = v_cart;

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
    set qty        = excluded.qty,
        updated_at = now();
end;
$$;

revoke execute on function public.replace_cart(jsonb) from public, anon;
grant execute on function public.replace_cart(jsonb) to authenticated;
