import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase, checkSupabaseConnection } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAdminUser } = useAdminAuth();
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
      // Check Supabase connection first
      try {
        checkSupabaseConnection();
      } catch (err) {
        setError('Database connection failed. Please contact administrator.');
        console.error('Supabase connection error:', err);
        return;
      }

      if (!email || !password) {
        setError('Please enter email and password.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (fetchError || !data) {
        setError('Admin account not found. Please sign up.');
        return;
      }

      if (data.password !== password) {
        setError('Incorrect password.');
        return;
      }

      setAdminUser(data);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-secondary/70 border border-primary/40 rounded-xl p-6 shadow-xl mt-10">
      <h1 className="text-xl font-semibold text-primary mb-4">Login to AUF Admin</h1>
      {error && <p className="text-xs text-red-300 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
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
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <div className="flex items-center justify-between mt-2 text-[11px] text-gray-300">
          <a href="/signup" className="text-primary hover:text-primary-dark">Sign up</a>
          <a href="/forgot-password" className="text-primary hover:text-primary-dark">Forgot password?</a>
        </div>
      </form>
    </div>
  );
}
