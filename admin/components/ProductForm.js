export default function ProductForm({ product, categories, onChange, onSubmit, loading }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...product, [name]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-sm">
      <div>
        <label className="block text-xs text-gray-300 mb-1">Name</label>
        <input
          name="name"
          value={product.name || ''}
          onChange={handleChange}
          required
          className="w-full bg-black/40 border border-primary/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-300 mb-1">Description</label>
        <textarea
          name="description"
          value={product.description || ''}
          onChange={handleChange}
          rows={3}
          className="w-full bg-black/40 border border-primary/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-300 mb-1">Price (PKR)</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={product.price || ''}
            onChange={handleChange}
            required
            className="w-full bg-black/40 border border-primary/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-300 mb-1">Category</label>
          <select
            name="category_id"
            value={product.category_id || ''}
            onChange={handleChange}
            className="w-full bg-black/40 border border-primary/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-300 mb-1">Image URL</label>
        <input
          name="image_url"
          value={product.image_url || ''}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full bg-black/40 border border-primary/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          For production, you can integrate Supabase Storage or another image service.
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary mt-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving…' : 'Save Product'}
      </button>
    </form>
  );
}
