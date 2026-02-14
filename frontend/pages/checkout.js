import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useCart, useAuth } from './_app';
import CartSummary from '../components/CartSummary';
import { supabase } from '../lib/supabaseClient';
import { karachiAreas } from '../lib/karachiAreas';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth() || {};
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [landmark, setLandmark] = useState('');
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState(0);

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

  // Fetch delivery charges when area and block change
  useEffect(() => {
    async function fetchDeliveryCharges() {
      if (!selectedArea || !selectedBlock) {
        setDeliveryCharges(0);
        return;
      }

      try {
        const fullAreaName = `${selectedArea} - ${selectedBlock}`;
        
        // Try to find exact match
        const { data, error } = await supabase
          .from('delivery_charges')
          .select('charges')
          .eq('area', fullAreaName)
          .maybeSingle();

        if (error) {
          console.error('Error fetching delivery charges:', error);
        }

        if (data) {
          setDeliveryCharges(Number(data.charges));
        } else {
          // If no exact match, set to 0 or you can set a default
          setDeliveryCharges(0);
        }
      } catch (err) {
        console.error('Error:', err);
        setDeliveryCharges(0);
      }
    }

    fetchDeliveryCharges();
  }, [selectedArea, selectedBlock]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = total + deliveryCharges;

  // Show loading state while checking user
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-400">Loading...</p>
      </div>
    );
  }

  // Show empty cart message if no items
  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-2xl text-gray-400">Your cart is empty</p>
        <Link href="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

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
    if (!selectedArea || selectedArea.trim().length === 0) {
      setMessage('Please select your area.');
      return;
    }

    // Validate block field
    if (!selectedBlock || selectedBlock.trim().length === 0) {
      setMessage('Please select your block.');
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start px-4 md:px-6 lg:px-8 xl:px-0 py-6">
      <div className="order-2 lg:order-1">
        <h1 className="text-xl sm:text-2xl font-bold text-primary mb-4">Checkout</h1>
        {/* Cart items display - simplified for checkout */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="card flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 gap-4 sm:gap-6"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
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
                  <p className="text-xs sm:text-sm text-gray-300">
                    Rs {Number(item.price).toLocaleString()} each
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-bold text-primary text-lg sm:text-xl self-end sm:self-auto">
                Rs {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between border-t-2 border-primary/40 pt-4 sm:pt-5 mt-4 text-base sm:text-lg">
            <span className="font-bold text-lg sm:text-xl">Total Amount</span>
            <span className="font-bold text-primary text-xl sm:text-2xl">Rs {total.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between pt-3 text-sm sm:text-base border-b border-primary/20 pb-3">
            <span className="text-gray-300">Delivery Charges</span>
            <span className="font-semibold text-primary">
              {deliveryCharges > 0 ? `Rs ${deliveryCharges.toLocaleString()}` : 'Enter area to calculate'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 text-base sm:text-lg">
            <span className="font-bold text-lg sm:text-xl">Grand Total</span>
            <span className="font-bold text-primary text-xl sm:text-2xl">Rs {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <form onSubmit={handlePlaceOrder} className="bg-secondary/60 border border-primary/40 rounded-xl p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5 order-1 lg:order-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-3 sm:mb-4">Customer Details</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XX-XXXXXXX"
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Full Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="House / Flat, Street, Building, etc."
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Area *</label>
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedBlock(''); // Reset block when area changes
              }}
              className="w-full rounded-md bg-black/40 border border-primary/40 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Area</option>
              {karachiAreas.map((area) => (
                <option key={area.name} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Block *</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedArea}
              className="w-full rounded-md bg-black/40 border border-primary/40 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="">Select Block</option>
              {selectedArea &&
                karachiAreas
                  .find((area) => area.name === selectedArea)
                  ?.blocks.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Nearest Landmark</label>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. near XYZ Mall"
            className="w-full rounded-md bg-black/40 border border-primary/40 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-300">Payment Method</p>
          <div className="flex flex-col space-y-3">
            <label className="flex items-center space-x-3 text-sm">
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="w-4 h-4"
              />
              <span>Cash on Delivery (Karachi only)</span>
            </label>
            <label className="flex items-center space-x-3 text-sm">
              <input
                type="radio"
                name="payment"
                value="Bank Transfer"
                checked={paymentMethod === 'Bank Transfer'}
                onChange={() => setPaymentMethod('Bank Transfer')}
                className="w-4 h-4"
              />
              <span>Bank Transfer</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'Bank Transfer' && (
          <div className="p-4 rounded-md bg-black/40 border border-primary/40 text-sm text-gray-200">
            <p className="font-semibold text-primary mb-2">Bank Details (Sample)</p>
            <p>Bank: HBL</p>
            <p>Account Name: AUF Karachi Sofas</p>
            <p>Account Number: 001234567890</p>
            <p>IBAN: PK00HABB0000001234567890</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-primary/40 pt-4 mt-4 text-base">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary text-lg">Rs {grandTotal.toLocaleString()}</span>
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
