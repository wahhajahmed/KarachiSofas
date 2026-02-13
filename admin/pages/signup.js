import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase, checkSupabaseConnection } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSignupPage() {
  const router = useRouter();
  const { setAdminUser } = useAdminAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
    setLoading(true);
    try {
      // Check Supabase connection first
      try {
        checkSupabaseConnection();
      } catch (err) {
        setError('Database connection failed. Please contact administrator.');
        console.error('Supabase connection error: - signup.js:35', err);
        return;
      }

      if (!name || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      const formattedName = formatName(name);

      // Check if there are already 2 admins (maximum limit)
      const { data: adminCount, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: false })
        .eq('role', 'admin');

      if (countError) {
        setError('Failed to check admin limit. Please try again.');
        return;
      }

      if (adminCount && adminCount.length >= 2) {
        setError('Admin access is full. Maximum 2 admin accounts allowed. Please contact existing admins (Ahsan Rauf or Faiza Ahsan) for assistance.');
        return;
      }

      // Check if email already exists in users or pending_admins
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

      if (existing) {
        setError('An account with this email already exists. Please login.');
        return;
      }

      // Check pending admins
      const { data: pending } = await supabase
        .from('pending_admins')
        .select('*')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (pending) {
        setError('A request with this email is already pending approval.');
        return;
      }

      // Create pending admin request (requires approval)
      const { error: insertError } = await supabase
        .from('pending_admins')
        .insert({ 
          name: formattedName, 
          email, 
          password,
          phone: phone || null,
          status: 'pending'
        });

      if (insertError) {
        setError(insertError.message || 'Failed to submit admin request.');
        return;
      }

      setSuccess(true);
      // Don't auto-login, show success message
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-secondary/70 border border-primary/40 rounded-xl p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-2">Create Admin Account</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Sign up to manage AUF store</p>
        </div>
        
        {error && (
          <p className="text-sm text-red-300 mb-4 p-3 bg-red-500/20 rounded">{error}</p>
        )}
        
        {success && (
          <div className="text-sm text-green-300 mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded">
            ✓ Your admin request has been submitted successfully! Please wait for approval from existing admins (Ahsan Rauf or Faiza Ahsan). You will be able to login once your account is approved.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-200 text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="w-full rounded-lg bg-black/40 border border-primary/30 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={success}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-200 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg bg-black/40 border border-primary/30 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="admin@aufkarachisofas.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={success}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-200 text-sm font-medium">Phone Number (optional)</label>
            <input
              type="tel"
              className="w-full rounded-lg bg-black/40 border border-primary/30 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="03XX-XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={success}
            />
          </div>
          
          <div>
            <label className="block mb-2 text-gray-200 text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-lg bg-black/40 border border-primary/30 px-4 py-3 pr-12 text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
          </div>
          
          <button
            type="submit"
            disabled={loading || success}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting Request...' : success ? 'Request Submitted' : 'Submit Admin Request'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
