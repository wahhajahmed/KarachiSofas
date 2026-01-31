import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAuth, useCart } from './_app';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { addToCart } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!email || !password) {
        setError('Please enter email and password.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'user')
        .limit(1)
        .single();

      if (fetchError || !data) {
        setError('Account not found. Please sign up first.');
        return;
      }

      if (data.password !== password) {
        setError('Incorrect password.');
        return;
      }

      setUser(data);

      // If the user came from an Add to Cart action, automatically add that item now
      if (typeof window !== 'undefined') {
        const pendingItemRaw = window.localStorage.getItem('auf-pending-cart-item');
        if (pendingItemRaw) {
          try {
            const pendingItem = JSON.parse(pendingItemRaw);
            if (pendingItem && pendingItem.id) {
              addToCart(pendingItem);
            }
          } catch {
            // ignore JSON errors
          }
          window.localStorage.removeItem('auf-pending-cart-item');
        }
      }

      router.push('/cart');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto card p-8 shadow-2xl">
      <h1 className="text-3xl font-bold text-primary mb-6">Login to AUF</h1>
      {error && <p className="text-sm text-red-300 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5 text-base">
        <div>
          <label className="block mb-2 text-gray-200 font-medium">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-200 font-medium">Password</label>
          <div className="flex items-center space-x-3">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-sm text-gray-300 hover:text-primary whitespace-nowrap transition-colors"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Password must be at least 8 characters.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
          <a href="/signup" className="text-primary hover:text-primary-dark transition-colors">Create Account</a>
          <a href="/forgot-password" className="text-primary hover:text-primary-dark transition-colors">Forgot password?</a>
        </div>
      </form>
    </div>
  );
}
