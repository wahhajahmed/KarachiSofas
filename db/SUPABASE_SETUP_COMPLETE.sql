-- COMPLETE SUPABASE SETUP QUERY
-- Copy and paste this entire query in Supabase SQL Editor and click RUN

-- Step 1: Create pending admins table
CREATE TABLE IF NOT EXISTS public.pending_admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  phone text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.users(id),
  created_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone
);

-- Step 2: Add approved columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS approved boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.users(id);

-- Step 3: Enable RLS for pending admins
ALTER TABLE public.pending_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert pending admin" ON public.pending_admins;
CREATE POLICY "Anyone can insert pending admin" ON public.pending_admins
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read pending admins" ON public.pending_admins;
CREATE POLICY "Admins can read pending admins" ON public.pending_admins
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update pending admins" ON public.pending_admins;
CREATE POLICY "Admins can update pending admins" ON public.pending_admins
  FOR UPDATE USING (true);

-- Step 4: Delete all related data first, then users, then insert only 2 admins
DELETE FROM public.cart_items;
DELETE FROM public.orders;
DELETE FROM public.pending_admins;
DELETE FROM public.users;

INSERT INTO public.users (name, email, password, phone, role, approved)
VALUES 
  ('Ahsan Rauf', 'ahsanrauf2@gmail.com', '@AhsanRauf2026', NULL, 'admin', true),
  ('Faiza Ahsan', 'faizaahsan2@gmail.com', '@FaizaAhsan2026', NULL, 'admin', true);
