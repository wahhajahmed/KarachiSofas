import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';
import Sidebar from '../components/Sidebar';
import CategoryForm from '../components/CategoryForm';

export default function CategoriesPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!adminUser) {
      router.push('/login');
      return;
    }
    load();
  }, [adminUser, router]);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('created_at');
    setCategories(data || []);
  }

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

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-secondary to-black">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64 pt-16 md:pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
              <h1 className="text-xl md:text-2xl font-semibold text-primary mb-4">
                {current.id ? 'Edit Category' : 'Add Category'}
              </h1>
              {message && (
                <p className="text-sm text-emerald-300 mb-3 p-2 bg-emerald-500/20 rounded">{message}</p>
              )}
              {errorMessage && (
                <p className="text-sm text-red-300 mb-3 p-2 bg-red-500/20 rounded">{errorMessage}</p>
              )}
              <CategoryForm
                current={current}
                setCurrent={setCurrent}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>

            <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
              <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Existing Categories</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-gray-400 text-sm">No categories yet</p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-secondary border border-primary/30 rounded-lg gap-2"
                    >
                      <span className="text-white text-sm md:text-base">{cat.name}</span>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setCurrent(cat)}
                          className="flex-1 sm:flex-none btn-primary text-sm px-3 py-1.5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="flex-1 sm:flex-none bg-red-500/20 text-red-300 px-3 py-1.5 rounded hover:bg-red-500/30 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
