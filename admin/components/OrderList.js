export default function OrderList({ orders, onUpdateStatus }) {
  if (!orders.length) {
    return <p className="text-sm text-gray-300">No orders yet.</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-secondary/60 border border-primary/30 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center space-x-3">
            {order.products?.image_url && (
              <div className="h-16 w-16 rounded-md overflow-hidden bg-black/40 border border-primary/30 flex-shrink-0">
                <img
                  src={order.products.image_url}
                  alt={order.products?.name || 'Product image'}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="space-y-1">
              <p className="font-semibold">{order.products?.name || 'Product'}</p>
              <p className="text-xs text-gray-300">
                Customer: {order.users?.name || 'N/A'} · {order.users?.email}
              </p>
              <p className="text-xs text-gray-300">
                Qty: {order.quantity} · Payment: {order.payment_method}
              </p>
            </div>
          </div>
          <div className="mt-2 md:mt-0 flex items-center space-x-4">
            <p className="font-bold text-primary">
              Rs {Number(order.total_price).toLocaleString()}
            </p>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value)}
              className={
                `rounded-md px-2 py-1 text-xs font-semibold shadow ` +
                (order.status === 'pending'
                  ? 'bg-yellow-400 text-black border-yellow-300'
                  : order.status === 'completed'
                  ? 'bg-emerald-500 text-black border-emerald-300'
                  : 'bg-red-500 text-white border-red-300')
              }
            >
              <option value="pending">Pending</option>
              <option value="completed">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
