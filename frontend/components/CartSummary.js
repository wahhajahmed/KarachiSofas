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
          className="card flex items-center justify-between p-5 space-x-6"
        >
          <div className="flex items-center space-x-4 flex-1">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.name}
                className="h-20 w-20 object-cover rounded-lg border border-primary/40"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg border border-primary/20 flex items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}
            <div>
              <p className="font-bold text-lg">{item.name}</p>
              <p className="text-sm text-gray-300">
                Rs {Number(item.price).toLocaleString()} each
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center border-2 border-primary/40 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => onDecrease?.(item.id)}
                className="px-3 py-2 text-base bg-black/40 hover:bg-primary hover:text-secondary transition-colors"
              >
                −
              </button>
              <span className="px-4 py-2 text-base min-w-[3rem] text-center font-semibold">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrease?.(item.id)}
                className="px-3 py-2 text-base bg-black/40 hover:bg-primary hover:text-secondary transition-colors"
              >
                +
              </button>
            </div>
            <p className="font-bold text-primary text-xl min-w-[8rem] text-right">
              Rs {(item.price * item.quantity).toLocaleString()}
            </p>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors px-3"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between border-t-2 border-primary/40 pt-5 mt-4 text-lg">
        <span className="font-bold text-xl">Total Amount</span>
        <span className="font-bold text-primary text-2xl">Rs {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
