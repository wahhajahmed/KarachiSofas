import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCart, useAuth } from './_app';
import CartSummary from '../components/CartSummary';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth() || {};
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Prefill name, email, and phone from logged-in user
  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name || '');
    setEmail((prev) => prev || user.email || '');
    setPhone((prev) => prev || user.phone || '');
  }, [user]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    
    // Ensure user is logged in
    if (!user) {
      setMessage('Please login to place an order.');
      router.push('/login');
      return;
    }
    
    if (!cart.length) {
      setMessage('Your cart is empty. Please add items before checking out.');
      return;
    }
    
    // Validate name field
    if (!name || name.trim().length === 0) {
      setMessage('Full name is required.');
      return;
    }

    if (name.trim().length < 3) {
      setMessage('Name must be at least 3 characters long.');
      return;
    }

    // Validate email field
    if (!email) {
      setMessage('Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    // Validate phone field
    if (!phone) {
      setMessage('Phone number is required.');
      return;
    }

    if (phone.length < 10) {
      setMessage('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    // Validate address field
    if (!address || address.trim().length === 0) {
      setMessage('Full address is required.');
      return;
    }

    if (address.trim().length < 10) {
      setMessage('Please enter a complete address (at least 10 characters).');
      return;
    }

    // Validate area field
    if (!area || area.trim().length === 0) {
      setMessage('Area/City is required.');
      return;
    }

    // Validate landmark field
    if (!landmark || landmark.trim().length === 0) {
      setMessage('Nearest landmark is required for delivery.');
      return;
    }

    setPlacing(true);
    setMessage('');
    try {
      const userId = user.id;

      const orderPayload = cart.map((item) => ({
        user_id: userId,
        product_id: item.id,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        payment_method: paymentMethod,
        status: 'pending',
      }));

      const { error: orderError } = await supabase.from('orders').insert(orderPayload);
      
      if (orderError) {
        if (orderError.message.includes('violates foreign key constraint')) {
          setMessage('Invalid product or user data. Please try again or contact support.');
        } else {
          setMessage(`Failed to place order: ${orderError.message}`);
        }
        return;
      }

      clearCart();
      setMessage('✓ Thank you! Your order has been placed successfully. Our team will contact you for confirmation.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setMessage(`Something went wrong: ${err.message || 'Please try again or contact support.'}`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-4">Checkout</h1>
        <CartSummary items={cart} onRemove={() => {}} />
      </div>
      <form onSubmit={handlePlaceOrder} className="bg-secondary/60 border border-primary/40 rounded-xl p-5 space-y-4 text-sm">
        <h2 className="text-lg font-semibold text-primary">Customer Details</h2>
        <div className="space-y-1">
          <label className="block text-xs text-gray-300">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-gray-300">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XX-XXXXXXX"
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-gray-300">Full Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            placeholder="House / Flat, Street, Building, etc."
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs text-gray-300">Area</label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Gulshan-e-Iqbal, DHA"
              className="w-full rounded-md bg-black/40 border border-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-300">Nearest Landmark</label>
            <input
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. near XYZ Mall"
              className="w-full rounded-md bg-black/40 border border-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-300">Payment Method</p>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              <span>Cash on Delivery (Karachi only)</span>
            </label>
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="radio"
                name="payment"
                value="Bank Transfer"
                checked={paymentMethod === 'Bank Transfer'}
                onChange={() => setPaymentMethod('Bank Transfer')}
              />
              <span>Bank Transfer</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'Bank Transfer' && (
          <div className="p-3 rounded-md bg-black/40 border border-primary/40 text-xs text-gray-200">
            <p className="font-semibold text-primary mb-1">Bank Details (Sample)</p>
            <p>Bank: HBL</p>
            <p>Account Name: AUF Karachi Sofas</p>
            <p>Account Number: 001234567890</p>
            <p>IBAN: PK00HABB0000001234567890</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-primary/40 pt-3 mt-2 text-sm">
          <span>Total</span>
          <span className="font-bold text-primary">Rs {total.toLocaleString()}</span>
        </div>

        {message && (
          <div className={`text-sm p-3 rounded-lg ${
            message.startsWith('✓') 
              ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={!cart.length || placing}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {placing ? 'Placing order…' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
