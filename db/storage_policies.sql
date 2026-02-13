-- Storage Policies for product-images bucket
-- Run this in Supabase SQL Editor to fix "row-level security policy" error

-- 1. Allow public READ access to all images
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 2. Allow authenticated users to UPLOAD images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 3. Allow authenticated users to UPDATE images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- 4. Allow authenticated users to DELETE images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
