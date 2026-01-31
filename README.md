# AUF Karachi Sofas

Full-stack e-commerce setup for AUF (Ali Usman Fatima) sofa business in Karachi, Pakistan.

This monorepo contains two Next.js apps:

- `frontend` – customer-facing storefront
- `admin` – admin panel for managing products, categories, and orders

## Tech Stack

- Next.js + React
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage)
- Hosting target: Vercel

## Supabase Setup

1. Create a new Supabase project and note your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
2. Run the SQL below in the Supabase SQL editor to create the required tables.

```sql
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

create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  password text not null,
  created_at timestamp with time zone default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  total_price numeric not null,
  payment_method text check (payment_method in ('COD', 'Bank Transfer')),
  status text default 'pending' check (status in ('pending', 'completed')),
  created_at timestamp with time zone default now()
);

-- Sample seed data
insert into public.categories (name) values
  ('Sofa'),
  ('Bed Sheet'),
  ('Bedroom Set');
```

> Note: In production you should hash passwords properly and add Row Level Security (RLS) policies.

## Environment Variables

Create `.env.local` files in both `frontend` and `admin` directories with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## Logo

Place the provided AUF logo image into:

- `frontend/public/auf-logo.png`
- `admin/public/auf-logo.png`

The UI already references `/auf-logo.png` in the header components.

## Install & Run

From the `KarachiSofas` directory:

```bash
npm install
npm run dev        # runs the frontend app on http://localhost:3000
# For admin panel (separate terminal):
npm run dev:admin  # runs the admin app on http://localhost:3001
```

Both apps are configured to be deployable to Vercel.
