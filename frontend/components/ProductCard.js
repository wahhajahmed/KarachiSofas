import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../pages/_app';

export default function ProductCard({ product, onAddToCart }) {
  const router = useRouter();
  const { user } = useAuth() || {};

  const handleAddToCart = () => {
    if (!user) {
      // Store product info and redirect to login
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('auf-pending-cart-item', JSON.stringify(product));
      }
      router.push('/login');
    } else {
      onAddToCart?.(product);
    }
  };

  return (
    <div className="card overflow-hidden flex flex-col hover:scale-105 transition-transform duration-300">
      <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-black via-secondary to-primary/30">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm md:text-base">
            AUF Sofa Image
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <h3 className="text-lg md:text-xl font-bold mb-2 text-white">{product.name}</h3>
        <p className="text-sm md:text-base text-gray-300 line-clamp-2 mb-3 md:mb-4 leading-relaxed">{product.description}</p>
        <div className="mt-auto space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-primary font-bold text-xl md:text-2xl">Rs {Number(product.price).toLocaleString()}</span>
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <Link
            href={`/product/${product.id}`}
            className="block text-center text-xs md:text-sm text-gray-300 hover:text-primary transition-colors"
          >
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
