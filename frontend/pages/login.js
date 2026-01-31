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

      // Use Supabase Auth for login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        // User exists in auth but not in users table - create record
        const { data: newUserData } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || '',
            phone: authData.user.user_metadata?.phone || '',
            role: 'user',
          })
          .select()
          .single();
        
        setUser(newUserData || authData.user);
      } else {
        setUser(userData);
      }

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
    <div className="w-full max-w-2xl mx-auto card p-10 shadow-2xl">
      <h1 className="text-4xl font-bold text-primary mb-8">Login to AUF</h1>
      {error && <p className="text-base text-red-300 mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6 text-base">
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-12"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-2"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
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
