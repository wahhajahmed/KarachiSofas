-- Migration: Add multiple image support to products table
-- Run this in Supabase SQL Editor

-- Add new columns for multiple images
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Update existing products to use cover_image from image_url
UPDATE public.products 
SET cover_image = image_url 
WHERE cover_image IS NULL AND image_url IS NOT NULL;

-- Create storage bucket for product images (if not exists)
-- Run this separately in Supabase Dashboard > Storage
-- Bucket name: product-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*
