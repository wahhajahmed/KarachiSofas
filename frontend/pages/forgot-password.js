import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (!email || !newPassword) {
        setError('Please enter email and new password.');
        return;
      }

      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1)
        .single();

      if (fetchError || !data) {
        setError('Account not found. Please sign up first.');
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', data.id);

      if (updateError) {
        setError(updateError.message || 'Failed to reset password.');
        return;
      }

      setMessage('Password updated successfully. You can now login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-secondary/70 border border-primary/40 rounded-xl p-5 sm:p-6 shadow-xl">
      <h1 className="text-lg sm:text-xl font-semibold text-primary mb-3 sm:mb-4">Reset Password</h1>
      {message && <p className="text-xs sm:text-sm text-emerald-300 mb-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded">{message}</p>}
      {error && <p className="text-xs sm:text-sm text-red-300 mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
        <div>
          <label className="block mb-1 text-gray-200">Email</label>
          <input
            type="email"
            className="w-full rounded-md bg-black/40 border border-primary/30 px-2 sm:px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-200">New Password</label>
          <div className="flex items-center gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-md bg-black/40 border border-primary/30 px-2 sm:px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-[10px] sm:text-[11px] text-gray-300 hover:text-primary whitespace-nowrap px-2"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-1 text-[10px] sm:text-[11px] text-gray-400">
            Password must be at least 8 characters.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
