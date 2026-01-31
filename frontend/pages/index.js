import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { useCart, useAuth } from './_app';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth() || {};
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: cats } = await supabase.from('categories').select('*').order('created_at');
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .limit(8)
        .order('created_at', { ascending: false });
      setCategories(cats || []);
      setFeatured(prods || []);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-10">
      <section className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
          Premium Sofas & Bedroom Furniture in Karachi
        </h1>
        <p className="text-sm text-gray-300 max-w-2xl mx-auto">
          AUF (Ali Usman Fatima) brings you handcrafted sofas, bed sheets, and bedroom sets
          with Karachi-style comfort and elegance. Cash on Delivery and Bank Transfer available.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">Shop by Category</h2>
        </div>
        {loading && !categories.length ? (
          <p className="text-sm text-gray-300">Loading categories…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">Featured Products</h2>
        </div>
        {loading && !featured.length ? (
          <p className="text-sm text-gray-300">Loading products…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(product) => {
                  if (!user) {
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem('auf-pending-cart-item', JSON.stringify(product));
                    }
                    router.push('/login');
                    return;
                  }
                  addToCart(product);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
