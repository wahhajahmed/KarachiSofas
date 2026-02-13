export default function ProductForm({ current, setCurrent, categories, onSubmit, loading }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrent({ ...current, [name]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Product Name</label>
        <input
          name="name"
          value={current.name || ''}
          onChange={handleChange}
          required
          placeholder="Enter product name"
          className="w-full bg-black/40 border border-primary/40 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
        <textarea
          name="description"
          value={current.description || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Product description..."
          className="w-full bg-black/40 border border-primary/40 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Price (PKR)</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={current.price || ''}
            onChange={handleChange}
            required
            placeholder="0"
            className="w-full bg-black/40 border border-primary/40 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Category</label>
          <select
            name="category_id"
            value={current.category_id || ''}
            onChange={handleChange}
            className="w-full bg-black/40 border border-primary/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Image URL</label>
        <input
          name="image_url"
          value={current.image_url || ''}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-black/40 border border-primary/40 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        <p className="text-xs text-gray-400 mt-2">
          Upload image to Supabase Storage or use external URL
        </p>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving…' : current.id ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
}
