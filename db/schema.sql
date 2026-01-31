-- Supabase schema for AUF Karachi Sofas

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Users table - id matches Supabase Auth user ID
create table public.users (
  id uuid primary key, -- This will match auth.users.id from Supabase Auth
  name text,
  email text unique not null,
  phone text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamp with time zone default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  total_price numeric not null,
  payment_method text check (payment_method in ('COD', 'Bank Transfer')),
  status text default 'pending' check (status in ('pending', 'completed', 'rejected')),
  created_at timestamp with time zone default now()
);

-- Cart table - stores user-specific cart items
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, product_id) -- One product per user in cart
);

-- Sample categories seed
insert into public.categories (name) values
  ('Sofa'),
  ('Bed Sheet'),
  ('Bedroom Set');
