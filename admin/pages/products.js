import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';
import Sidebar from '../components/Sidebar';
import ProductForm from '../components/ProductForm';

export default function ProductsPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const [products, setProducts] = useState([]);
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
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('created_at'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');
    try {
      const payload = {
        name: current.name,
        description: current.description,
        price: Number(current.price || 0),
        category_id: current.category_id || null,
        image_url: current.image_url || null,
      };
      let query = supabase.from('products');
      if (current.id) {
        query = query.update(payload).eq('id', current.id);
      } else {
        query = query.insert(payload);
      }
      const { error } = await query;
      if (error) {
        setErrorMessage(error.message || 'Failed to save product.');
        throw error;
      }
      setCurrent({});
      setMessage('Product saved successfully.');
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    setMessage('');
    setErrorMessage('');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setErrorMessage(error.message || 'Failed to delete product.');
    } else {
      setMessage('Product deleted.');
      load();
    }
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-secondary to-black">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
              <h1 className="text-xl md:text-2xl font-semibold text-primary mb-4">
                {current.id ? 'Edit Product' : 'Add Product'}
              </h1>
              {message && (
                <p className="text-sm text-emerald-300 mb-3 p-2 bg-emerald-500/20 rounded">{message}</p>
              )}
              {errorMessage && (
                <p className="text-sm text-red-300 mb-3 p-2 bg-red-500/20 rounded">{errorMessage}</p>
              )}
              <ProductForm
                current={current}
                setCurrent={setCurrent}
                categories={categories}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>

            <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
              <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">All Products</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-gray-400 text-sm">No products yet</p>
                ) : (
                  products.map((prod) => {
                    const cat = categories.find((c) => c.id === prod.category_id);
                    return (
                      <div
                        key={prod.id}
                        className="p-3 bg-secondary border border-primary/30 rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm md:text-base truncate">
                              {prod.name}
                            </h3>
                            <p className="text-gray-400 text-xs">{cat?.name || 'Uncategorized'}</p>
                            <p className="text-primary font-semibold text-sm">
                              Rs {Number(prod.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrent(prod)}
                            className="flex-1 btn-primary text-sm px-3 py-1.5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="flex-1 bg-red-500/20 text-red-300 px-3 py-1.5 rounded hover:bg-red-500/30 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
        {errorMessage && (
          <p className="text-xs text-red-300 mb-2">Error: {errorMessage}</p>
        )}
        <div className="space-y-2 text-sm">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-secondary/60 border border-primary/30 rounded-md px-3 py-2"
            >
              <div className="flex items-center space-x-3">
                {p.image_url && (
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-black/40 border border-primary/30 flex-shrink-0">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[11px] text-gray-300">
                    Rs {Number(p.price).toLocaleString()} · {p.category_id || 'No category'}
                  </p>
                </div>
              </div>
              <div className="space-x-3 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrent(p)}
                  className="text-primary hover:text-primary-dark"
                >
                  Edit
                </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="flex-1 bg-red-500/20 text-red-300 px-3 py-1.5 rounded hover:bg-red-500/30 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
