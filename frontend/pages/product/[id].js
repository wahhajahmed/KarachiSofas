import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useCart, useAuth } from '../_app';
import ImageSlider from '../../components/ImageSlider';

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
    <div className="grid md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0 py-6">
      <div className="bg-secondary/60 border border-primary/40 rounded-xl overflow-hidden p-4">
        <ImageSlider
          coverImage={product.cover_image || product.image_url}
          images={product.images || []}
          productName={product.name}
        />
      </div>
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">{product.name}</h1>
        <p className="text-sm md:text-base text-gray-200 whitespace-pre-line leading-relaxed">{product.description}</p>
        <p className="text-2xl md:text-3xl font-extrabold text-primary">
          Rs {Number(product.price).toLocaleString()}
        </p>
        <button
          type="button"
          className="btn-primary w-full md:w-auto"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
