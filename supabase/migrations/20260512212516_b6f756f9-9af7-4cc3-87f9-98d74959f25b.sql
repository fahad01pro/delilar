
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ORDERS
create type public.order_status as enum ('warehouse','packaging','transit','delivered','cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  shipping_address jsonb,
  payment_method text not null default 'cod',
  status public.order_status not null default 'warehouse',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- WISHLIST
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product_data jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
alter table public.wishlist enable row level security;

create policy "Users can view own wishlist" on public.wishlist
  for select using (auth.uid() = user_id);
create policy "Users can insert own wishlist" on public.wishlist
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own wishlist" on public.wishlist
  for delete using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- new user trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
