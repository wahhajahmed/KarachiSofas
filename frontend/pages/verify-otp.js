import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabaseClient';

export default function VerifyOTPPage() {
  const router = useRouter();
  const { phone } = router.query;
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Redirect if no phone number
  useEffect(() => {
    if (!phone && router.isReady) {
      router.push('/signup');
    }
  }, [phone, router]);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!otpCode || otpCode.length !== 6) {
        setError('Please enter the 6-digit verification code.');
        return;
      }

      // Get OTP record
      const { data: otpRecord, error: fetchError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !otpRecord) {
        setError('Verification code not found. Please request a new code.');
        return;
      }

      // Check if expired
      if (new Date(otpRecord.expires_at) < new Date()) {
        setError('Verification code has expired. Please request a new code.');
        return;
      }

      // Verify OTP
      if (otpRecord.otp_code !== otpCode) {
        setError('Invalid verification code. Please try again.');
        return;
      }

      // Create user account using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: otpRecord.email,
        password: otpRecord.password,
        options: {
          data: {
            name: otpRecord.name,
            phone: otpRecord.phone,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please login instead.');
        } else {
          setError(authError.message || 'Failed to create account. Please try again.');
        }
        return;
      }

      // Store user data in users table
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name: otpRecord.name,
            email: otpRecord.email,
            phone: otpRecord.phone,
            role: 'user',
          });

        if (dbError && dbError.code !== '23505') {
          console.error('Error saving user data:', dbError);
        }
      }

      // Mark OTP as verified
      await supabase
        .from('otp_verifications')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');

    try {
      // Get the original signup data
      const { data: lastOtp } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastOtp) {
        setError('Session expired. Please sign up again.');
        setTimeout(() => router.push('/signup'), 2000);
        return;
      }

      // Generate new OTP
      const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 60000).toISOString();

      const { error: otpError } = await supabase
        .from('otp_verifications')
        .insert({
          phone: lastOtp.phone,
          otp_code: newOtpCode,
          expires_at: expiresAt,
          name: lastOtp.name,
          email: lastOtp.email,
          password: lastOtp.password
        });

      if (otpError) {
        setError('Failed to resend code. Please try again.');
        return;
      }

      // NOTE: Send WhatsApp message here in production
      console.log(`New WhatsApp OTP for ${phone}: ${newOtpCode}`);

      // Reset timer
      setTimeLeft(60);
      setCanResend(false);
      setError('');
    } finally {
      setResending(false);
    }
  }

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md card p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Verify Your Phone Number</h1>
            <p className="text-gray-400 text-sm">
              We sent a 6-digit verification code to
            </p>
            <p className="text-primary font-semibold mt-1">{phone}</p>
          </div>

          {error && (
            <div className="text-sm text-red-300 mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-300 mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              ✓ Account verified successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block mb-3 text-gray-200 font-medium text-center">
                Enter Verification Code
              </label>
              <input
                type="text"
                maxLength="6"
                pattern="\d{6}"
                className="input-field text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                disabled={success || loading}
                autoFocus
              />
            </div>

            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-400">
                  Code expires in{' '}
                  <span className="font-bold text-primary">{timeLeft}s</span>
                </p>
              ) : (
                <p className="text-sm text-red-300">Code has expired</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success || otpCode.length !== 6}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : success ? 'Verified!' : 'Verify Code'}
            </button>

            {canResend && !success && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 px-4 bg-secondary border border-primary/40 text-primary rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </form>

          <p className="text-xs text-gray-400 mt-6 text-center">
            Didn't receive the code? Check your WhatsApp or wait for the resend option.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
