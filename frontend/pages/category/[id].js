import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ProductCard from '../../components/ProductCard';
import { useCart, useAuth } from '../_app';

export default function CategoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth() || {};

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const { data: cat } = await supabase.from('categories').select('*').eq('id', id).single();
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', id)
        .order('created_at', { ascending: false });
      setCategory(cat || null);
      setProducts(prods || []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (!id) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">
        {category ? category.name : 'Category'}
      </h1>
      {loading && !products.length ? (
        <p className="text-sm text-gray-300">Loading products…</p>
      ) : products.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
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
      ) : (
        <p className="text-sm text-gray-300">No products found in this category yet.</p>
      )}
    </div>
  );
}
