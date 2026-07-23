-- ---------------------------------------------------------------------------
-- RLS access-control suite.
--
-- Every assertion here was first verified against a live database; these files
-- are the replayable version. Run with `npm run db:test` (needs Docker).
--
-- A policy without a negative test is an assumption, not a control — so the
-- bulk of this file is about what each role *cannot* do.
-- ---------------------------------------------------------------------------
begin;
select plan(14);

create extension if not exists pgtap with schema extensions;

-- Seeded by supabase/seed.sql
\set admin_id  '''aaaaaaaa-0000-4000-8000-000000000001'''
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

create or replace function tests.act_as_anon() returns void as $$
begin
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
select tests.act_as_anon();

select is(
  (select count(*)::int from public.products),
  6,
  'anon reads all six published products'
);

select throws_ok(
  $$insert into public.products (slug,name,summary,description,price_cents,category)
    values ('anon-hack','Hack','s','d',1,'asset')$$,
  '42501',
  null,
  'anon cannot insert a product'
);

reset role;
update public.products set is_published = false where slug = 'meridian-icon-pack';
select tests.act_as_anon();

select is(
  (select count(*)::int from public.products where slug = 'meridian-icon-pack'),
  0,
  'unpublished products are invisible to anon'
);

reset role;
update public.products set is_published = true where slug = 'meridian-icon-pack';

select tests.act_as(:member_id);

select throws_ok(
  $$insert into public.products (slug,name,summary,description,price_cents,category)
    values ('member-hack','Hack','s','d',1,'asset')$$,
  '42501',
  null,
  'a member cannot insert a product'
);

select throws_ok(
  $$delete from public.products where slug = 'horizon-dashboard-kit'$$,
  '42501',
  null,
  'a member cannot delete a product'
);

reset role;
select tests.act_as(:admin_id);

select lives_ok(
  $$insert into public.products (slug,name,summary,description,price_cents,category,stock)
    values ('admin-created','Admin Created','s','d',500,'asset',3)$$,
  'an admin can insert a product'
);

-- ---------------------------------------------------------------------------
-- profiles — the privilege-escalation guard
-- ---------------------------------------------------------------------------
reset role;
select tests.act_as(:member_id);

select is(
  (select count(*)::int from public.profiles),
  1,
  'a member sees only their own profile'
);

select throws_ok(
  format('update public.profiles set role = ''admin'' where id = %L', :member_id),
  '42501',
  null,
  'a member cannot promote themselves to admin'
);

select lives_ok(
  format('update public.profiles set name = ''Renamed'' where id = %L', :member_id),
  'a member can still edit their own name'
);

reset role;
select tests.act_as(:admin_id);

select is(
  (select count(*)::int from public.profiles),
  2,
  'an admin sees every profile'
);

-- ---------------------------------------------------------------------------
-- carts — cross-user isolation
-- ---------------------------------------------------------------------------
reset role;
select tests.act_as(:member_id);

insert into public.cart_items (cart_id, product_id, qty)
select public.current_cart_id(), id, 2 from public.products where slug = 'horizon-dashboard-kit';

reset role;
select tests.act_as(:admin_id);

select is(
  (select count(*)::int from public.cart_items),
  0,
  'another user cannot see the member cart, even as admin'
);

-- ---------------------------------------------------------------------------
-- orders — append-only, owner-scoped
-- ---------------------------------------------------------------------------
reset role;
select tests.act_as(:member_id);

select throws_ok(
  format(
    $$insert into public.orders (user_id, reference, email, subtotal_cents, total_cents)
      values (%L, 'STU-DEADBEEF', 'a@b.co', 0, 0)$$,
    :member_id
  ),
  '42501',
  null,
  'orders cannot be inserted directly — only through place_order()'
);

select throws_ok(
  $$update public.orders set total_cents = 1$$,
  '42501',
  null,
  'orders are append-only: even the owner cannot update one'
);

reset role;
select * from finish();
rollback;
