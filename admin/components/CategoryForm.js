export default function CategoryForm({ category, onChange, onSubmit, loading }) {
  const handleChange = (e) => {
    onChange({ ...category, name: e.target.value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-sm">
      <div>
        <label className="block text-xs text-gray-300 mb-1">Category Name</label>
        <input
          value={category.name || ''}
          onChange={handleChange}
          required
          className="w-full bg-black/40 border border-primary/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving…' : 'Save Category'}
      </button>
    </form>
  );
}
