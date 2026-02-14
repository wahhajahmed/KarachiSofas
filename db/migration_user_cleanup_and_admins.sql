-- Migration: User cleanup and admin setup
-- Run this in Supabase SQL Editor

-- Step 1: Delete all related data first, then users (clean slate)
DELETE FROM public.cart_items;
DELETE FROM public.orders;
DELETE FROM public.users;

-- Step 2: Add approved status column to users table for admin approval system
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS approved boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.users(id);

-- For existing users (non-admin), set approved to true
-- For new admin signups, they will be pending (approved=false)
UPDATE public.users SET approved = true WHERE role = 'user';

-- Step 3: Insert the two admin accounts
INSERT INTO public.users (name, email, password, phone, role, approved)
VALUES 
  ('Ahsan Rauf', 'ahsanrauf2@gmail.com', '@AhsanRauf2026', NULL, 'admin', true),
  ('Faiza Ahsan', 'faizaahsan2@gmail.com', '@FaizaAhsan2026', NULL, 'admin', true);

-- Step 4: Create OTP verification table for user signups
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_code text not null,
  expires_at timestamp with time zone not null,
  verified boolean default false,
  created_at timestamp with time zone default now(),
  -- Store pending user data
  name text not null,
  email text not null,
  password text not null
);

-- Add index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_verifications(phone, verified);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.otp_verifications(expires_at);

-- Step 5: Create pending admins table for approval workflow
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

-- Add RLS policies for OTP verification
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert OTP" ON public.otp_verifications;
CREATE POLICY "Anyone can insert OTP" ON public.otp_verifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read their OTP" ON public.otp_verifications;
CREATE POLICY "Anyone can read their OTP" ON public.otp_verifications
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update their OTP" ON public.otp_verifications;
CREATE POLICY "Anyone can update their OTP" ON public.otp_verifications
  FOR UPDATE USING (true);

-- Add RLS policies for pending admins
ALTER TABLE public.pending_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert pending admin" ON public.pending_admins;
CREATE POLICY "Anyone can insert pending admin" ON public.pending_admins
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read pending admins" ON public.pending_admins;
CREATE POLICY "Admins can read pending admins" ON public.pending_admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.approved = true
    )
  );

DROP POLICY IF EXISTS "Admins can update pending admins" ON public.pending_admins;
CREATE POLICY "Admins can update pending admins" ON public.pending_admins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin' 
      AND users.approved = true
    )
  );

-- Update RLS policy for users table to handle approved field
DROP POLICY IF EXISTS "Users can update their own password" ON public.users;
CREATE POLICY "Users can update their own password" ON public.users
  FOR UPDATE USING (
    id = auth.uid() 
    OR (role = 'user' AND NOT approved) -- Allow pending users to be approved
  );
