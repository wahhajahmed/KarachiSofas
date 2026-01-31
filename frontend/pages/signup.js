import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAuth, useCart } from './_app';

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { addToCart } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatName = (rawName) => {
    if (!rawName) return '';
    return rawName
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!name || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      const formattedName = formatName(name);

      // Check if a user already exists for this email.
      // Note: checkout can auto-create a user with password 'placeholder'.
      const {
        data: existing,
        error: existingError,
      } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') {
        // An unexpected error occurred while checking existing user
        setError(existingError.message || 'Something went wrong. Please try again.');
        return;
      }

      let createdOrUpdatedUser = existing || null;

      if (existing) {
        if (existing.password === 'placeholder') {
          // Upgrade a guest/checkout user to a full account
          const { data: updated, error: updateError } = await supabase
            .from('users')
            .update({ name: formattedName, password, role: 'user' })
            .eq('id', existing.id)
            .select('*')
            .single();

          if (updateError) {
            setError(updateError.message || 'Failed to update existing account.');
            return;
          }

          createdOrUpdatedUser = updated;
        } else {
          // Proper account already exists with this email
          setError('Account already exists. Please login instead.');
          return;
        }
      } else {
        // No existing user – create a brand new account
        const { data, error: insertError } = await supabase
          .from('users')
          .insert({ name: formattedName, email, password, role: 'user' })
          .select('*')
          .single();

        if (insertError) {
          setError(insertError.message || 'Failed to create account.');
          return;
        }

        createdOrUpdatedUser = data;
      }

      setUser(createdOrUpdatedUser);

      // If signup was triggered from an Add to Cart action, add that item now
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
    <div className="max-w-md mx-auto bg-secondary/70 border border-primary/40 rounded-xl p-6 shadow-xl">
      <h1 className="text-xl font-semibold text-primary mb-4">Create Your AUF Account</h1>
      {error && <p className="text-xs text-red-300 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="block mb-1 text-gray-200">Full Name</label>
          <input
            type="text"
            className="w-full rounded-md bg-black/40 border border-primary/30 px-3 py-2 text-sm outline-none focus:border-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-200">Email</label>
          <input
            type="email"
            className="w-full rounded-md bg-black/40 border border-primary/30 px-3 py-2 text-sm outline-none focus:border-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-200">Password</label>
          <div className="flex items-center space-x-2">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-md bg-black/40 border border-primary/30 px-3 py-2 text-sm outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[11px] text-gray-300 hover:text-primary"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            Password must be at least 8 characters.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
        <p className="text-[11px] text-gray-300 mt-2">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:text-primary-dark">Login</a>
        </p>
      </form>
    </div>
  );
}
