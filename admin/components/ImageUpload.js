import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ImageUpload({ onImagesChange, existingCover, existingImages = [] }) {
  const [coverImage, setCoverImage] = useState(existingCover || null);
  const [additionalImages, setAdditionalImages] = useState(existingImages || []);
  const [uploading, setUploading] = useState(false);

  // Update local state when props change (for editing existing products)
  useEffect(() => {
    setCoverImage(existingCover || null);
    setAdditionalImages(existingImages || []);
  }, [existingCover, existingImages]);

  async function handleCoverUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setCoverImage(publicUrl);
      onImagesChange({ cover_image: publicUrl });
    } catch (error) {
      alert('Error uploading cover image: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  }

  function removeCoverImage() {
    setCoverImage(null);
    onImagesChange({ cover_image: null });
  }

  async function handleImagesUpload(e) {
    try {
      setUploading(true);
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Calculate how many images can still be uploaded
      const remainingSlots = 4 - additionalImages.length;
      const filesToUpload = files.slice(0, remainingSlots);

      if (files.length > remainingSlots) {
        alert(`You can only upload ${remainingSlots} more image(s). Limit is 4 images.`);
      }

      const uploadedUrls = [];

      for (const file of filesToUpload) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const newImages = [...additionalImages, ...uploadedUrls];
      setAdditionalImages(newImages);
      onImagesChange({ images: newImages });
    } catch (error) {
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  }

  function removeAdditionalImage(index) {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
    onImagesChange({ images: newImages });
  }

  return (
    <div className="space-y-6">
      {/* Cover Image Upload */}
      <div className="bg-black/20 border border-primary/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-200 mb-3">
          📸 Cover Photo (Main Image)
        </label>
        
        {coverImage ? (
          <div className="space-y-3">
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-black/40 border-2 border-primary/40">
              <img
                src={coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={removeCoverImage}
                  disabled={uploading}
                  className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
            <p className="text-xs text-green-400">✓ Cover photo uploaded</p>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploading}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-secondary hover:file:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-400">Upload your main product image</p>
          </div>
        )}
      </div>

      {/* Additional Images Upload */}
      <div className="bg-black/20 border border-primary/30 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-200 mb-3">
          🖼️ Additional Images (Maximum 4)
        </label>
        
        {additionalImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {additionalImages.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border-2 border-primary/20 group">
                <img
                  src={imageUrl}
                  alt={`Additional ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAdditionalImage(index)}
                  disabled={uploading}
                  className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  ✕
                </button>
                <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-2">
          {additionalImages.length < 4 ? (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                disabled={uploading}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/80 file:text-secondary hover:file:bg-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">
                📊 {additionalImages.length} of 4 images uploaded • {4 - additionalImages.length} slot(s) remaining
              </p>
            </>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-sm text-amber-400 font-medium">
                ⚠️ Upload limit reached! You have uploaded 4 images. Delete an image to upload a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {uploading && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-sm text-blue-400 animate-pulse font-medium">
            ⏳ Uploading images, please wait...
          </p>
        </div>
      )}
    </div>
  );
}
