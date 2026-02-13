-- PERMANENTLY DELETE all users and create only 2 admin accounts
-- Copy and paste this in Supabase SQL Editor and click RUN

-- Step 1: Disable foreign key checks temporarily and delete ALL data
TRUNCATE TABLE public.cart_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.otp_verifications CASCADE;
TRUNCATE TABLE public.pending_admins CASCADE;

-- Step 2: PERMANENTLY DELETE ALL users
TRUNCATE TABLE public.users RESTART IDENTITY CASCADE;

-- Step 3: Insert only the 2 admin accounts
INSERT INTO public.users (name, email, password, phone, role)
VALUES 
  ('Ahsan Rauf', 'ahsanrauf2@gmail.com', '@AhsanRauf2026', NULL, 'admin'),
  ('Faiza Ahsan', 'faizaahsan2@gmail.com', '@FaizaAhsan2026', NULL, 'admin');

-- Step 4: Also delete from Supabase Auth (if any users exist there)
-- Go to Authentication > Users in Supabase Dashboard and manually delete all users
