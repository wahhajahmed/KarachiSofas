# Image Upload Setup Guide

## Supabase Storage Setup

Before using the image upload feature, you need to set up Supabase Storage:

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **New Bucket**
4. Configure:
   - **Name**: `product-images`
   - **Public**: ✅ Enable (make bucket public)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/*`

### 2. Run Database Migration

Execute the migration SQL in Supabase SQL Editor:

```sql
-- Add new columns for multiple images
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Update existing products to use cover_image from image_url
UPDATE public.products 
SET cover_image = image_url 
WHERE cover_image IS NULL AND image_url IS NOT NULL;
```

### 3. Set Storage Policies (Optional - for security)

If you want to restrict uploads to admin users only:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

## Features

### Admin Dashboard
- **Cover Photo**: Upload 1 main product image
- **Additional Images**: Upload up to 4 extra images
- **File Upload**: Direct upload from device (no URL needed)
- **Preview**: See uploaded images before saving
- **Remove**: Delete unwanted images

### Frontend Display
- **Product Cards**: Show cover image
- **Product Detail**: Auto-playing image slider with:
  - ⏯️ Auto-play (3 seconds per image)
  - ⏸️ Pause on hover/touch
  - ◀️ ▶️ Navigation arrows
  - 🔘 Dot indicators
  - 🔢 Image counter

## Usage

### Uploading Images (Admin)

1. Go to **Products** page in admin dashboard
2. Click **Add Product** or **Edit** existing product
3. Upload **Cover Photo** (required - main image)
4. Upload **Additional Images** (optional - up to 4 images)
5. Click **Add Product** / **Update Product**

### Viewing Images (User)

1. Browse products on homepage/category pages
2. Click on any product to view details
3. Image slider automatically plays
4. Hover over slider to pause
5. Use arrows or dots to navigate manually

## Database Schema

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category_id uuid REFERENCES categories(id),
  image_url text,          -- Legacy field (backward compatible)
  cover_image text,        -- Main cover photo URL
  images jsonb DEFAULT '[]'::jsonb,  -- Array of additional image URLs
  created_at timestamp with time zone DEFAULT now()
);
```

## File Structure

```
admin/
  components/
    ImageUpload.js       - Image upload component
    ProductForm.js       - Updated with ImageUpload
  pages/
    products.js          - Handles image upload logic

frontend/
  components/
    ImageSlider.js       - Auto-playing image carousel
    ProductCard.js       - Shows cover image
  pages/
    product/[id].js      - Product detail with slider

db/
  schema.sql                      - Updated schema
  migration_add_multiple_images.sql - Migration file
```

## Troubleshooting

### Images not uploading?
- ✅ Check if `product-images` bucket exists in Supabase Storage
- ✅ Verify bucket is set to **Public**
- ✅ Check file size (max 5MB)
- ✅ Ensure file is an image format (jpg, png, gif, webp)

### Images not displaying?
- ✅ Run the database migration to add new columns
- ✅ Check browser console for errors
- ✅ Verify image URLs are accessible (public bucket)

### Slider not working?
- ✅ Ensure product has multiple images uploaded
- ✅ Check if JavaScript is enabled
- ✅ Verify images array is not empty in database

## Support

For issues, check:
1. Supabase Storage dashboard
2. Browser developer console
3. Network tab for failed requests
4. Database table structure
