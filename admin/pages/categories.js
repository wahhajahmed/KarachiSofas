import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CategoryForm from '../components/CategoryForm';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('created_at');
    setCategories(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');
    try {
      const payload = { name: current.name };
      let query = supabase.from('categories');
      if (current.id) {
        query = query.update(payload).eq('id', current.id);
      } else {
        query = query.insert(payload);
      }
      const { error } = await query;
      if (error) {
        setErrorMessage(error.message || 'Failed to save category.');
        throw error;
      }
      setCurrent({});
      setMessage('Category saved successfully.');
      load();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category?')) return;
    setMessage('');
    setErrorMessage('');
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      setErrorMessage(error.message || 'Failed to delete category.');
    } else {
      setMessage('Category deleted.');
      load();
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-xl font-semibold text-primary mb-4">Categories</h1>
        {message && (
          <p className="text-xs text-emerald-300 mb-2">{message}</p>
        )}
        {errorMessage && (
          <p className="text-xs text-red-300 mb-2">Error: {errorMessage}</p>
        )}
        <div className="space-y-2 text-sm">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between bg-secondary/60 border border-primary/30 rounded-md px-3 py-2"
            >
              <span>{c.name}</span>
              <div className="space-x-3 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrent(c)}
                  className="text-primary hover:text-primary-dark"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!categories.length && (
            <p className="text-sm text-gray-300">No categories yet.</p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">
          {current.id ? 'Edit Category' : 'Add Category'}
        </h2>
        <CategoryForm
          category={current}
          onChange={setCurrent}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
