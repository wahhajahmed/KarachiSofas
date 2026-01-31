import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSignupPage() {
  const router = useRouter();
  const { setAdminUser } = useAdminAuth();
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
        setError(existingError.message || 'Something went wrong. Please try again.');
        return;
      }

      // If any account already exists with this email, block signup
      if (existing) {
        setError('Admin account already exists. Please login.');
        return;
      }

      // Email is new – create a fresh admin account
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({ name: formattedName, email, password, role: 'admin' })
        .select('*')
        .single();

      if (insertError) {
        setError(insertError.message || 'Failed to create admin account.');
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
      <h1 className="text-xl font-semibold text-primary mb-4">Create Admin Account</h1>
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
          Already have an admin account?{' '}
          <a href="/login" className="text-primary hover:text-primary-dark">Login</a>
        </p>
      </form>
    </div>
  );
}
