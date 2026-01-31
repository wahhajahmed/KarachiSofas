import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

      // Don't auto-login - show success message and redirect to login
      setSuccess(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto card p-8 shadow-2xl">
      <h1 className="text-3xl font-bold text-primary mb-6">Create Your AUF Account</h1>
      {error && <p className="text-sm text-red-300 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">{error}</p>}
      {success && (
        <div className="text-sm text-green-300 mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          ✓ Account created successfully! Redirecting to login page...
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5 text-base">
        <div>
          <label className="block mb-2 text-gray-200 font-medium">Full Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={success}
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-200 font-medium">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={success}
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
              disabled={success}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-sm text-gray-300 hover:text-primary whitespace-nowrap transition-colors"
              disabled={success}
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
          disabled={loading || success}
          className="w-full btn-primary mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : success ? 'Account Created!' : 'Sign Up'}
        </button>
        <p className="text-sm text-gray-300 mt-4 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:text-primary-dark transition-colors font-semibold">Login</a>
        </p>
      </form>
    </div>
  );
}
