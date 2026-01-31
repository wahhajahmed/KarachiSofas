import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useCart, useAuth } from '../_app';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth() || {};

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(data || null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (!id) return null;

  if (loading && !product) {
    return <p className="text-sm text-gray-300">Loading product…</p>;
  }

  if (!product) {
    return <p className="text-sm text-gray-300">Product not found.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-secondary/60 border border-primary/40 rounded-xl overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-80 object-cover"
          />
        ) : (
          <div className="w-full h-80 flex items-center justify-center text-gray-500 text-xs">
            AUF Sofa Image
          </div>
        )}
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-primary">{product.name}</h1>
        <p className="text-sm text-gray-200 whitespace-pre-line">{product.description}</p>
        <p className="text-xl font-extrabold text-primary">
          Rs {Number(product.price).toLocaleString()}
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (!user) {
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('auf-pending-cart-item', JSON.stringify(product));
              }
              router.push('/login');
              return;
            }
            addToCart(product);
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
