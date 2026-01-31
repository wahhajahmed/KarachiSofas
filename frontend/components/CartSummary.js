export default function CartSummary({ items, onRemove, onIncrease, onDecrease }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!items.length) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-300 text-xl mb-2">Your cart is empty.</p>
        <p className="text-gray-400 text-base">Add some products to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="card p-4 md:p-5"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Product Image and Details */}
            <div className="flex items-center space-x-3 flex-1 w-full sm:w-auto">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border border-primary/40 flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg border border-primary/20 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                  No image
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base sm:text-lg truncate">{item.name}</p>
                <p className="text-sm text-gray-300">
                  Rs {Number(item.price).toLocaleString()} each
                </p>
              </div>
            </div>
            
            {/* Quantity Controls and Price */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center border-2 border-primary/40 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => onDecrease?.(item.id)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-base bg-black/40 hover:bg-primary hover:text-secondary transition-colors"
                >
                  −
                </button>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-base min-w-[2.5rem] sm:min-w-[3rem] text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onIncrease?.(item.id)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-base bg-black/40 hover:bg-primary hover:text-secondary transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <p className="font-bold text-primary text-lg sm:text-xl">
                  Rs {(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between border-t-2 border-primary/40 pt-4 sm:pt-5 mt-4 text-base sm:text-lg px-2">
        <span className="font-bold text-lg sm:text-xl">Total Amount</span>
        <span className="font-bold text-primary text-xl sm:text-2xl">Rs {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
