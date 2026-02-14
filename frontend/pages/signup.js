import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
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
      // Validate name field
      if (!name || name.trim().length === 0) {
        setError('Full name is required.');
        return;
      }

      if (name.trim().length < 3) {
        setError('Name must be at least 3 characters long.');
        return;
      }

      // Validate email field
      if (!email) {
        setError('Email is required.');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address (e.g., name@example.com).');
        return;
      }

      // Validate phone field
      if (!phone) {
        setError('Phone number is required.');
        return;
      }

      if (phone.length < 10) {
        setError('Please enter a valid phone number (at least 10 digits).');
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

      // Check password strength
      if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
        setError('Password should contain at least one letter.');
        return;
      }

      const formattedName = formatName(name);

      // Use Supabase Auth for signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: formattedName,
            phone,
          }
        }
      });

      if (authError) {
        // Provide specific error messages
        if (authError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please login instead.');
        } else if (authError.message.includes('Password should be at least')) {
          setError('Password must be at least 8 characters long.');
        } else if (authError.message.includes('invalid email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(authError.message || 'Failed to create account. Please try again.');
        }
        return;
      }

      // Store additional user data in users table
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id, // Use the auth user ID
            name: formattedName,
            email,
            phone,
            role: 'user',
          });

        if (dbError) {
          if (dbError.code === '23505') {
            // Duplicate key error - user already exists, which is fine
            console.log('User record already exists');
          } else {
            console.error('Error saving user data:', dbError);
            setError('Account created but failed to save user details. Please contact support.');
            return;
          }
        }
      }

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

      {/* Signup Card */}
      <div className="card p-6 sm:p-8 shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-6">Create Your Account</h1>
        {error && (
          <p className="text-sm text-red-300 mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <div className="text-sm text-green-300 mb-5 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            ✓ Account created successfully! Redirecting to login page...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm text-gray-200 font-medium">Full Name</label>
            <input
              type="text"
              className="input-field text-sm sm:text-base"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={success}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-200 font-medium">Email</label>
            <input
              type="email"
              className="input-field text-sm sm:text-base"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={success}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-200 font-medium">Phone Number</label>
            <input
              type="tel"
              className="input-field text-sm sm:text-base"
              placeholder="03XX-XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={success}
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
              disabled={success}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-2 disabled:opacity-50"
              disabled={success}
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
          disabled={loading || success}
          className="w-full btn-primary py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : success ? 'Account Created!' : 'Sign Up'}
        </button>
        <p className="text-sm text-gray-300 mt-5 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-dark transition-colors font-semibold">
            Login
          </Link>
        </p>
      </form>
      </div>
    </div>
  );
}
