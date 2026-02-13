import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ImageUpload({ onImagesChange, existingCover, existingImages = [] }) {
  const [coverPreview, setCoverPreview] = useState(existingCover || null);
  const [imagePreviews, setImagePreviews] = useState(existingImages || []);
  const [uploading, setUploading] = useState(false);

  async function handleCoverUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);

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

      onImagesChange({ cover_image: publicUrl, coverImage: publicUrl });
    } catch (error) {
      alert('Error uploading cover image: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleImagesUpload(e) {
    try {
      setUploading(true);
      const files = Array.from(e.target.files).slice(0, 4); // Max 4 images
      if (files.length === 0) return;

      const uploadedUrls = [];
      const newPreviews = [];

      for (const file of files) {
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setImagePreviews([...imagePreviews, ...newPreviews].slice(0, 4));
          }
        };
        reader.readAsDataURL(file);

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

      onImagesChange({ images: [...imagePreviews, ...uploadedUrls].slice(0, 4) });
    } catch (error) {
      alert('Error uploading images: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    const newImages = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newImages);
    onImagesChange({ images: newImages });
  }

  return (
    <div className="space-y-4">
      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cover Photo (Main Image)
        </label>
        <div className="space-y-2">
          {coverPreview && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-black/40 border border-primary/20">
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setCoverPreview(null);
                  onImagesChange({ coverImage: null });
                }}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            disabled={uploading}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-secondary hover:file:bg-primary/90 cursor-pointer"
          />
        </div>
      </div>

      {/* Additional Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Additional Images (Up to 4)
        </label>
        <div className="space-y-2">
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border border-primary/20">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {imagePreviews.length < 4 && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesUpload}
              disabled={uploading}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/80 file:text-secondary hover:file:bg-primary cursor-pointer"
            />
          )}
          <p className="text-xs text-gray-400">
            {imagePreviews.length} of 4 images uploaded
          </p>
        </div>
      </div>

      {uploading && (
        <p className="text-sm text-primary animate-pulse">Uploading images...</p>
      )}
    </div>
  );
}
