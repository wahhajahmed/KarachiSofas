import Link from 'next/link';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="bg-secondary/60 border border-primary/40 rounded-xl overflow-hidden flex flex-col shadow-xl">
      <div className="relative h-48 bg-gradient-to-br from-black via-secondary to-primary/30">
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
        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
        <p className="text-xs text-gray-300 line-clamp-2 mb-3">{product.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-primary font-bold text-lg">Rs {Number(product.price).toLocaleString()}</span>
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => onAddToCart?.(product)}
          >
            Add to Cart
          </button>
        </div>
        <Link
          href={`/product/${product.id}`}
          className="mt-2 text-xs text-gray-300 hover:text-primary"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
