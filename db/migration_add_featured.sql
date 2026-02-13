-- Migration: Add featured flag to products table
-- Run this in Supabase SQL Editor

-- Add featured column (default false)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Add index for faster queries on featured products
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;

-- Optional: Mark some existing products as featured for testing
-- UPDATE public.products SET featured = true WHERE id IN (
--   SELECT id FROM public.products LIMIT 4
-- );
