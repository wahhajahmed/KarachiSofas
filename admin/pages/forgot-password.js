import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (!email) {
        setError('Please enter your email address.');
        return;
      }

      // For now, show a message to contact admin
      // In production, you would send a password reset email
      setMessage(
        'Password reset feature is available. Please contact the system administrator at admin@aufkarachisofas.com with your email address to reset your password.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-secondary/70 border border-primary/40 rounded-xl p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-2">Forgot Password</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Reset your admin password</p>
        </div>

        {error && (
          <div className="text-sm text-red-300 mb-4 p-3 bg-red-500/20 rounded border border-red-500/30">
            {error}
          </div>
        )}

        {message && (
          <div className="text-sm text-green-300 mb-4 p-3 bg-green-500/20 rounded border border-green-500/30">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-200 text-sm font-medium">Email Address</label>
            <input
              type="email"
              className="w-full rounded-lg bg-black/40 border border-primary/30 px-4 py-3 text-white placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="admin@aufkarachisofas.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter your admin email address to request a password reset
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Request Password Reset'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-400">
            Remember your password?{' '}
            <a href="/login" className="text-primary hover:underline">
              Back to Login
            </a>
          </p>
          <p className="text-sm text-gray-400">
            Need help?{' '}
            <a href="mailto:admin@aufkarachisofas.com" className="text-primary hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
