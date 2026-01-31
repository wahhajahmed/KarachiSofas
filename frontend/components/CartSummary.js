export default function CartSummary({ items, onRemove, onIncrease, onDecrease }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!items.length) {
    return <p className="text-gray-300 text-sm">Your cart is empty.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between bg-secondary/60 border border-primary/30 rounded-lg p-3 text-sm space-x-4"
        >
          <div className="flex items-center space-x-3 flex-1">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.name}
                className="h-14 w-14 object-cover rounded-md border border-primary/40"
              />
            ) : (
              <div className="h-14 w-14 rounded-md border border-primary/20 flex items-center justify-center text-[10px] text-gray-400">
                No image
              </div>
            )}
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-gray-300">
                Rs {Number(item.price).toLocaleString()} each
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center border border-primary/40 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => onDecrease?.(item.id)}
                className="px-2 py-1 text-xs bg-black/40 hover:bg-black/60"
              >
                -
              </button>
              <span className="px-3 py-1 text-xs min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrease?.(item.id)}
                className="px-2 py-1 text-xs bg-black/40 hover:bg-black/60"
              >
                +
              </button>
            </div>
            <p className="font-bold text-primary min-w-[6rem] text-right">
              Rs {(item.price * item.quantity).toLocaleString()}
            </p>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-primary/40 pt-3 mt-3 text-sm">
        <span className="font-semibold">Total</span>
        <span className="font-bold text-primary">Rs {total.toLocaleString()}</span>
      </div>
    </div>
  );
}
