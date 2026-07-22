-- ---------------------------------------------------------------------------
-- 0003 — Products.
--
-- Public read of *published* rows, admin-only write. Prices are integer cents:
-- floating point money accumulates rounding error and there is no reason to
-- risk it. `image_path` holds a Storage object path, never a full URL, so the
-- bucket can move without a data migration.
-- ---------------------------------------------------------------------------

create table public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null check (char_length(name) between 1 and 120),
  summary       text not null check (char_length(summary) between 1 and 200),
  description   text not null check (char_length(description) between 1 and 4000),
  price_cents   integer not null check (price_cents >= 0 and price_cents <= 100000000),
  category      public.product_category not null,
  image_path    text check (image_path is null or char_length(image_path) <= 512),
  rating        numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  stock         integer not null default 0 check (stock >= 0 and stock <= 1000000),
  is_published  boolean not null default true,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on column public.products.price_cents is 'Integer cents. Never store money as float.';
comment on column public.products.image_path is 'Object path inside the product-images bucket, not a URL.';

alter table public.products enable row level security;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Indexes for the hot filters and for the FK used by admin joins. An
-- unindexed column referenced by a policy or filter is the usual cause of RLS
-- performance collapse.
create index products_category_published_idx
  on public.products (category) where is_published;

create index products_name_trgm_idx
  on public.products using gin (name extensions.gin_trgm_ops);

create index products_created_by_idx
  on public.products (created_by);

-- ---------------------------------------------------------------------------
-- Policies
--
-- Anonymous visitors and signed-in users both see published rows only.
-- Unpublished drafts are invisible to everyone except admins.
-- ---------------------------------------------------------------------------
create policy "products_select_published"
  on public.products for select
  to anon, authenticated
  using (is_published);

create policy "products_admin_read_all"
  on public.products for select
  to authenticated
  using ((select public.is_admin()));

create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "products_admin_update"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));
