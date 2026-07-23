-- ---------------------------------------------------------------------------
-- Checkout RPC suite — place_order() and merge_guest_cart().
--
-- The security property under test: the caller supplies only an email address,
-- so totals and stock movements are derived entirely from database state and
-- cannot be influenced by a tampered request.
-- ---------------------------------------------------------------------------
begin;
select plan(12);

create extension if not exists pgtap with schema extensions;

\set member_id '''aaaaaaaa-0000-4000-8000-000000000002'''

create or replace function tests.act_as(p_user uuid) returns void as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user, 'role', 'authenticated')::text,
    true
  );
  set local role authenticated;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Guard rails before any cart exists
-- ---------------------------------------------------------------------------
select tests.act_as(:member_id);

select throws_ok(
  $$select public.place_order('buyer@example.com')$$,
  'CART_EMPTY',
  'checkout with no cart is rejected'
);

-- ---------------------------------------------------------------------------
-- Happy path
-- ---------------------------------------------------------------------------
insert into public.cart_items (cart_id, product_id, qty)
select public.current_cart_id(), id, 2
from public.products where slug = 'horizon-dashboard-kit';

-- A deliberately messy address: leading/trailing space and mixed case.
select lives_ok(
  $$select public.place_order('  Buyer@Example.COM  ')$$,
  'place_order normalises the email instead of rejecting it'
);

select is(
  (select stock from public.products where slug = 'horizon-dashboard-kit'),
  10,
  'stock is decremented by the ordered quantity'
);

select is(
  (select total_cents from public.orders order by created_at desc limit 1),
  37800,
  'total is computed server-side from the DB price (2 x $189.00)'
);

select is(
  (select email from public.orders order by created_at desc limit 1),
  'buyer@example.com',
  'email is stored lower-cased and trimmed'
);

select is(
  (select count(*)::int from public.cart_items),
  0,
  'the cart is cleared after a successful order'
);

select matches(
  (select reference from public.orders order by created_at desc limit 1),
  '^STU-[0-9A-F]{8}$',
  'order reference follows the STU-XXXXXXXX format'
);

select is(
  (select unit_price_cents from public.order_items order by id desc limit 1),
  18900,
  'the line snapshots the unit price at purchase time'
);

-- ---------------------------------------------------------------------------
-- Stock exhaustion aborts the whole transaction
-- ---------------------------------------------------------------------------
insert into public.cart_items (cart_id, product_id, qty)
select public.current_cart_id(), id, 1
from public.products where slug = 'meridian-icon-pack'; -- seeded with stock 0

select throws_ok(
  $$select public.place_order('buyer@example.com')$$,
  'INSUFFICIENT_STOCK:meridian-icon-pack',
  'an out-of-stock line aborts the order'
);

select is(
  (select count(*)::int from public.cart_items),
  1,
  'a failed order leaves the cart untouched'
);

select throws_ok(
  $$select public.place_order('not-an-email')$$,
  'INVALID_EMAIL',
  'a malformed email is rejected'
);

-- ---------------------------------------------------------------------------
-- Guest cart merge
-- ---------------------------------------------------------------------------
delete from public.cart_items;

select public.merge_guest_cart(
  (select json_build_array(
     json_build_object('product_id', id, 'qty', 3),
     json_build_object('product_id', id, 'qty', 2),
     json_build_object('product_id', '00000000-0000-0000-0000-0000000000ff', 'qty', 1)
   )::jsonb
   from public.products where slug = 'cobalt-data-grid')
);

select results_eq(
  $$select qty::int, (select count(*)::int from public.cart_items) from public.cart_items$$,
  $$values (5, 1)$$,
  'merge sums duplicate guest lines and drops unknown product ids'
);

reset role;
select * from finish();
rollback;
