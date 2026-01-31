import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function DashboardPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('created_at');

      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      setCategories(cats || []);
      setProducts(prods || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-primary">AUF Admin Dashboard</h1>
        <p className="text-sm text-gray-300 max-w-xl">
          Professional preview of your storefront, grouped by category just like the home page.
        </p>
      </div>

      {/* Category overview like user home page */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary">Categories</h2>
        {loading && !categories.length ? (
          <p className="text-sm text-gray-300">Loading categories…</p>
        ) : !categories.length ? (
          <p className="text-sm text-gray-300">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((c) => (
              <Link key={c.id} href="/categories" className="block group">
                <div className="bg-secondary/60 border border-primary/40 rounded-xl p-4 shadow-lg group-hover:border-primary group-hover:-translate-y-1 transition-transform">
                  <h3 className="text-base font-semibold text-primary mb-1">{c.name}</h3>
                  <p className="text-[11px] text-gray-300">
                    Click to manage this category and its products.
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Products grouped by category, similar to storefront sections */}
      <section className="space-y-6">
        {loading && !products.length && (
          <p className="text-sm text-gray-300">Loading products…</p>
        )}
        {!loading && !products.length && (
          <p className="text-sm text-gray-300">No products yet. Add products to see the preview.</p>
        )}

        {categories.map((category) => {
          const items = products.filter((p) => p.category_id === category.id);
          if (!items.length) return null;
          return (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">
                  {category.name} <span className="text-xs text-gray-400">(Admin preview)</span>
                </h3>
                <span className="text-[11px] text-gray-400">{items.length} product(s)</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="bg-secondary/60 border border-primary/40 rounded-xl overflow-hidden flex flex-col shadow-xl"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-black via-secondary to-primary/30">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                          AUF Sofa Image
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="text-base font-semibold mb-1">{product.name}</h4>
                      <p className="text-[11px] text-gray-300 line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-primary font-bold text-base">
                          Rs {Number(product.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400">Preview only</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
