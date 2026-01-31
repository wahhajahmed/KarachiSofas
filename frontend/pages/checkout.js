import { useEffect, useState } from 'react';
import { useCart, useAuth } from './_app';
import CartSummary from '../components/CartSummary';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutPage() {
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

  // Prefill name and email from logged-in user
  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name || '');
    setEmail((prev) => prev || user.email || '');
  }, [user]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!cart.length) return;
    if (!name || !email || !phone || !address || !area || !landmark) {
      setMessage('Please fill in all required details: name, email, phone, full address, area, and nearest landmark.');
      return;
    }

    setPlacing(true);
    setMessage('');
    try {
      // Create or find a simple user record (regular user role).
      let { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (!user) {
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({ name, email, password: 'placeholder', role: 'user' })
          .select('*')
          .single();
        if (userError) throw userError;
        user = newUser;
      }

      const orderPayload = cart.map((item) => ({
        user_id: user.id,
        product_id: item.id,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        payment_method: paymentMethod,
        status: 'pending',
      }));

      const { error: orderError } = await supabase.from('orders').insert(orderPayload);
      if (orderError) throw orderError;

      clearCart();
      setMessage('Thank you! Your order has been placed. Our team will contact you for confirmation.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // Show the actual Supabase error message to help diagnose issues like RLS or schema mismatch
      setMessage(`Something went wrong while placing your order: ${err.message || 'Unknown error'}`);
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

        {message && <p className="text-xs text-yellow-300">{message}</p>}

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
