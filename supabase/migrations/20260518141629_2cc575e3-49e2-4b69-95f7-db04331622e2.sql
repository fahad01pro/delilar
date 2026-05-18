
-- =========================
-- Admin helper
-- =========================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') = 'admin@delilar.com',
    false
  )
$$;

-- =========================
-- Products
-- =========================
create table public.products (
  id text primary key,
  name text not null,
  subtitle text,
  category text not null,
  product_type text not null default 'clothing',
  brand text default 'Delilar',
  sku text,
  price numeric not null default 0,
  original_price numeric,
  stock integer not null default 0,
  description text,
  badge text,
  in_stock boolean not null default true,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_trending boolean not null default false,
  is_sale boolean not null default false,
  is_visible boolean not null default true,
  rating numeric not null default 0,
  reviews integer not null default 0,
  tags text[] default '{}',
  data jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category);
create index products_featured_idx on public.products(is_featured);
create index products_visible_idx on public.products(is_visible);

alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  using (is_visible = true or public.is_admin());

create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =========================
-- Hero banners
-- =========================
create table public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  eyebrow text,
  cta_label text,
  cta_href text,
  image_url text not null,
  mobile_image_url text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hero_banners enable row level security;

create policy "Hero banners are public"
  on public.hero_banners for select using (true);
create policy "Admins manage hero banners insert"
  on public.hero_banners for insert with check (public.is_admin());
create policy "Admins manage hero banners update"
  on public.hero_banners for update using (public.is_admin());
create policy "Admins manage hero banners delete"
  on public.hero_banners for delete using (public.is_admin());

create trigger hero_banners_set_updated_at
  before update on public.hero_banners
  for each row execute function public.set_updated_at();

-- =========================
-- Category banners
-- =========================
create table public.category_banners (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  title text,
  subtitle text,
  image_url text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.category_banners enable row level security;

create policy "Category banners are public"
  on public.category_banners for select using (true);
create policy "Admins insert category banners"
  on public.category_banners for insert with check (public.is_admin());
create policy "Admins update category banners"
  on public.category_banners for update using (public.is_admin());
create policy "Admins delete category banners"
  on public.category_banners for delete using (public.is_admin());

create trigger category_banners_set_updated_at
  before update on public.category_banners
  for each row execute function public.set_updated_at();

-- =========================
-- Storage bucket: product-images
-- =========================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- Allow admins to update orders (status workflow)
create policy "Admins can update orders"
  on public.orders for update using (public.is_admin());

create policy "Admins can view all orders"
  on public.orders for select using (public.is_admin());
