import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProductForm from '../components/ProductForm';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function load() {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('created_at'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
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
      // eslint-disable-next-line no-console
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

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-xl font-semibold text-primary mb-4">Products</h1>
        {message && (
          <p className="text-xs text-emerald-300 mb-2">{message}</p>
        )}
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
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!products.length && (
            <p className="text-sm text-gray-300">No products yet.</p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">
          {current.id ? 'Edit Product' : 'Add Product'}
        </h2>
        <ProductForm
          product={current}
          categories={categories}
          onChange={setCurrent}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
