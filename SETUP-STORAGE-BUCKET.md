# 🚀 IMPORTANT: Setup Required Before Using Image Upload

## Step 1: Create Supabase Storage Bucket

Before the image upload feature works, you MUST create a storage bucket in Supabase:

### Quick Steps:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `bqifhhlnyovcqzhuggdo`
3. **Click "Storage"** in left sidebar
4. **Click "New Bucket"** button
5. **Fill in details**:
   ```
   Name: product-images
   Public: ✅ YES (check this box!)
   File size limit: 5242880 (5MB)
   Allowed MIME types: image/*
   ```
6. **Click "Create Bucket"**

## Step 2: Run Database Migration

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy and paste this SQL:

```sql
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

UPDATE public.products 
SET cover_image = image_url 
WHERE cover_image IS NULL AND image_url IS NOT NULL;
```

4. Click **Run** button

## Step 3: Test Image Upload

1. Go to your admin dashboard: https://your-admin-url.vercel.app
2. Navigate to **Products**
3. Try uploading a cover image
4. Upload should work now! ✅

---

## ⚠️ If Images Still Don't Upload:

### Check bucket settings:
- Bucket name MUST be exactly: `product-images`
- Bucket MUST be set to Public ✅
- File size limit should be at least 5MB

### Check browser console:
- Press F12
- Look for any red error messages
- Common error: "Bucket does not exist" = You need to create the bucket

---

## 📸 Features Now Available:

### Admin Side:
✅ Upload 1 cover photo (main image)
✅ Upload 4 additional images
✅ Direct file upload from computer
✅ Image preview before saving
✅ Remove unwanted images

### User Side:
✅ Beautiful auto-playing image slider
✅ Pauses on hover/touch
✅ Navigation arrows
✅ Dot indicators
✅ Image counter (1/5, 2/5, etc.)
✅ Smooth transitions

---

Need help? Check [IMAGE-UPLOAD-SETUP.md](IMAGE-UPLOAD-SETUP.md) for detailed documentation.
