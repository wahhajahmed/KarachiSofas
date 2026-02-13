-- Storage Policies for product-images bucket
-- Run this in Supabase SQL Editor to fix "row-level security policy" error
-- IMPORTANT: Copy and paste this entire file into Supabase SQL Editor and click RUN

-- First, remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

-- 1. Allow public READ access (so customers can see images)
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 2. Allow ANYONE (anon + authenticated) to UPLOAD images
-- This is needed because admin users use custom auth, not Supabase Auth
CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

-- 3. Allow ANYONE to UPDATE images
CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'product-images');

-- 4. Allow ANYONE to DELETE images
CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'product-images');
