import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
      // Validate email field
      if (!email) {
        setError('Email is required.');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      // Validate password field
      if (!password) {
        setError('Password is required.');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      // Use Supabase Auth for login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Provide specific error messages
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.');
        } else if (authError.message.includes('User not found')) {
          setError('No account found with this email. Please sign up first.');
        } else {
          setError(authError.message || 'Login failed. Please try again.');
        }
        return;
      }

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (userError || !userData) {
        // User exists in auth but not in users table - try to create record
        const { data: newUserData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || '',
            phone: authData.user.user_metadata?.phone || '',
            role: 'user',
          })
          .select()
          .maybeSingle();
        
        if (insertError && insertError.code !== '23505') {
          // Log error but allow login to continue with auth user data
          console.error('Error creating user record:', insertError);
          console.log('Proceeding with auth user data only');
        }
        
        // Use the created user data if available, otherwise use auth user
        setUser(newUserData || {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || '',
          phone: authData.user.user_metadata?.phone || '',
          role: 'user'
        });
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
              // Add to cart silently (no alerts) but WAIT for it to complete
              await addToCart(pendingItem, true); // true = silent mode
            }
          } catch (err) {
            console.error('Error adding pending cart item:', err);
          }
          window.localStorage.removeItem('auf-pending-cart-item');
        }
      }

      // Redirect to home page after cart is updated
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-block">
          <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent mb-2">
            AUF
          </div>
          <div className="text-xs sm:text-sm text-gray-400 tracking-wider">
            Ali Usman Fatima
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="card p-6 sm:p-8 shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-6">Welcome Back</h1>
        {error && (
          <p className="text-sm text-red-300 mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm text-gray-200 font-medium">Email</label>
            <input
              type="email"
              className="input-field text-sm sm:text-base"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-200 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-12 text-sm sm:text-base"
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
          <p className="mt-2 text-xs text-gray-400">
            Password must be at least 8 characters.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 text-sm text-gray-300">
          <Link href="/signup" className="text-primary hover:text-primary-dark transition-colors">
            Create Account
          </Link>
          <Link href="/forgot-password" className="text-primary hover:text-primary-dark transition-colors">
            Forgot password?
          </Link>
        </div>
      </form>
      </div>
    </div>
  );
}
