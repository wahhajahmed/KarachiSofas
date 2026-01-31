import Link from 'next/link';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card overflow-hidden flex flex-col hover:scale-105 transition-transform duration-300">
      <div className="relative h-64 bg-gradient-to-br from-black via-secondary to-primary/30">
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
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-white">{product.name}</h3>
        <p className="text-base text-gray-300 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-primary font-bold text-2xl">Rs {Number(product.price).toLocaleString()}</span>
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => onAddToCart?.(product)}
          >
            Add to Cart
          </button>
          <Link
            href={`/product/${product.id}`}
            className="block text-center text-sm text-gray-300 hover:text-primary transition-colors"
          >
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
