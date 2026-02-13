import Link from 'next/link';
import CartSummary from '../components/CartSummary';
import { useCart } from './_app';

export default function CartPage() {
  const { cart, removeFromCart, increaseQty, decreaseQty } = useCart();

  const hasItems = cart.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 px-4 md:px-0">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 sm:mb-6">Your Shopping Cart</h1>
      <CartSummary
        items={cart}
        onRemove={removeFromCart}
        onIncrease={increaseQty}
        onDecrease={decreaseQty}
      />
      {hasItems && (
        <div className="flex justify-end">
          <Link 
            href="/checkout" 
            className="btn-primary w-full sm:w-auto text-center px-6 py-3 sm:px-8 sm:py-3"
          >
            Proceed to Checkout
          </Link>
        </div>
      )}
    </div>
  );
}
