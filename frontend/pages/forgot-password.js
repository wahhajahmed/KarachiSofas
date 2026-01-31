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
    <div className="max-w-md mx-auto bg-secondary/70 border border-primary/40 rounded-xl p-6 shadow-xl">
      <h1 className="text-xl font-semibold text-primary mb-4">Reset Password</h1>
      {message && <p className="text-xs text-emerald-300 mb-2">{message}</p>}
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
          <label className="block mb-1 text-gray-200">New Password</label>
          <div className="flex items-center space-x-2">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-md bg-black/40 border border-primary/30 px-3 py-2 text-sm outline-none focus:border-primary"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
