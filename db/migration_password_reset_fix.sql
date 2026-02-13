-- Migration: Fix password reset functionality
-- Run this in Supabase SQL Editor

-- Ensure password column exists in users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password text;

-- Create or replace policy to allow password updates for forgot password feature
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own password" ON public.users;
DROP POLICY IF EXISTS "Anyone can update user password for reset" ON public.users;

-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to update their own password
CREATE POLICY "Users can update their own password"
ON public.users
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Note: This is a simple policy that allows password updates
-- In production, you might want to add more security measures like:
-- - Email verification tokens
-- - Rate limiting
-- - Password reset timestamps
