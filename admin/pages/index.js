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
    <div className="space-y-12">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-primary">AUF Admin Dashboard</h1>
        <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
          Professional preview of your storefront, grouped by category just like the home page.
        </p>
      </div>

      {/* Category overview like user home page */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary">Categories</h2>
        {loading && !categories.length ? (
          <p className="text-base text-gray-300">Loading categories…</p>
        ) : !categories.length ? (
          <p className="text-base text-gray-300">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <Link key={c.id} href="/categories" className="block group">
                <div className="card p-6 group-hover:border-primary group-hover:scale-105 transition-all duration-300">
                  <h3 className="text-xl font-bold text-primary mb-2">{c.name}</h3>
                  <p className="text-sm text-gray-300">
                    Click to manage this category and its products.
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Products grouped by category, similar to storefront sections */}
      <section className="space-y-8">
        {loading && !products.length && (
          <p className="text-base text-gray-300">Loading products…</p>
        )}
        {!loading && !products.length && (
          <p className="text-base text-gray-300">No products yet. Add products to see the preview.</p>
        )}

        {categories.map((category) => {
          const items = products.filter((p) => p.category_id === category.id);
          if (!items.length) return null;
          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-primary">
                  {category.name} <span className="text-sm text-gray-400">(Admin preview)</span>
                </h3>
                <span className="text-sm text-gray-400">{items.length} product(s)</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="card overflow-hidden flex flex-col"
                  >
                    <div className="relative h-52 bg-gradient-to-br from-black via-secondary to-primary/30">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-base">
                          AUF Sofa Image
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="text-lg font-bold mb-2">{product.name}</h4>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-primary font-bold text-xl">
                          Rs {Number(product.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">Preview only</span>
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
