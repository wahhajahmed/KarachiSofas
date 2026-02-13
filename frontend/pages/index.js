import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton, CategoryCardSkeleton } from '../components/LoadingSkeleton';
import { useCart, useAuth } from './_app';

export default function HomePage({ initialCategories, initialFeatured }) {
  const [categories, setCategories] = useState(initialCategories || []);
  const [featured, setFeatured] = useState(initialFeatured || []);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth() || {};
  const router = useRouter();

  // Only re-fetch if initial data is empty
  useEffect(() => {
    if (!initialCategories || !initialFeatured) {
      async function loadData() {
        setLoading(true);
        const { data: cats } = await supabase.from('categories').select('*').order('created_at');
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .order('created_at', { ascending: false });
        setCategories(cats || []);
        setFeatured(prods || []);
        setLoading(false);
      }
      loadData();
    }
  }, [initialCategories, initialFeatured]);

  return (
    <div className="space-y-12 md:space-y-16 py-6 md:py-8 px-4 md:px-0">
      <section className="text-center py-8 sm:py-10 md:py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight px-2">
          Premium Sofas & Bedroom Furniture in Karachi
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
          AUF (Ali Usman Fatima) brings you handcrafted sofas, bed sheets, and bedroom sets
          with Karachi-style comfort and elegance. Cash on Delivery and Bank Transfer available.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="section-subtitle">Shop by Category</h2>
        </div>
        {loading && !categories.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="section-subtitle">Featured Products</h2>
        </div>
        {loading && !featured.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Server-side rendering for initial data load
export async function getServerSideProps() {
  try {
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('created_at');
    
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });

    return {
      props: {
        initialCategories: cats || [],
        initialFeatured: prods || [],
      },
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      props: {
        initialCategories: [],
        initialFeatured: [],
      },
    };
  }
}
