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
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-secondary/70 border border-primary/40 rounded-xl p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-2">Login to AUF Admin</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Manage your store</p>
        </div>
        
        {error && (
          <p className="text-sm text-red-300 mb-4 p-3 bg-red-500/20 rounded">{error}</p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-200 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg bg-black/40 border border-primary/30 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="admin@aufkarachisofas.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-200 text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-lg bg-black/40 border border-primary/30 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
