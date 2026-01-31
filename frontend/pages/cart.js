import Link from 'next/link';
import CartSummary from '../components/CartSummary';
import { useCart } from './_app';

export default function CartPage() {
  const { cart, removeFromCart, increaseQty, decreaseQty } = useCart();

  const hasItems = cart.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary mb-4">Your Cart</h1>
      <CartSummary
        items={cart}
        onRemove={removeFromCart}
        onIncrease={increaseQty}
        onDecrease={decreaseQty}
      />
      {hasItems && (
        <div className="flex justify-end">
          <Link href="/checkout" className="btn-primary">
            Go to Checkout
          </Link>
        </div>
      )}
    </div>
  );
}
