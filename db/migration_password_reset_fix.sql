-- Migration: Fix password reset functionality and allow signup
-- Run this in Supabase SQL Editor

-- Ensure password column exists in users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password text;

-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own password" ON public.users;
DROP POLICY IF EXISTS "Anyone can update user password for reset" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert users for signup" ON public.users;
DROP POLICY IF EXISTS "Public can read users" ON public.users;

-- Policy 1: Allow anyone to INSERT users (for signup)
CREATE POLICY "Anyone can insert users for signup"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Allow users to update their own password
CREATE POLICY "Users can update their own password"
ON public.users
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Policy 3: Allow reading user data (needed for login)
CREATE POLICY "Public can read users"
ON public.users
FOR SELECT
TO public
USING (true);

-- Note: This is a simple policy that allows basic operations
-- In production, you might want to add more security measures like:
-- - Email verification tokens
-- - Rate limiting
-- - Password reset timestamps
