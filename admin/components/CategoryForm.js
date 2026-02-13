export default function CategoryForm({ current, setCurrent, onSubmit, loading }) {
  const handleChange = (e) => {
    setCurrent({ ...current, name: e.target.value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Category Name</label>
        <input
          value={current.name || ''}
          onChange={handleChange}
          required
          placeholder="Enter category name"
          className="w-full bg-black/40 border border-primary/40 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving…' : current.id ? 'Update Category' : 'Add Category'}
      </button>
    </form>
  );
}
