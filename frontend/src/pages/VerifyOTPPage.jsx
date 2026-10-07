import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import OTPInput from '../components/auth/OTPInput';
import { useAuth } from '../context/AuthContext';
import { verifyOTP as verifyOTPApi, sendEmailOTP, sendPhoneOTP } from '../services/api';

/**
 * VerifyOTPPage — 6-digit OTP verification with resend functionality.
 * Handles both registration and forgot-password flows based on route state.
 */
export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(30); // 30 seconds
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get context from navigation state
  const { email, phone, purpose = 'registration', message = '' } = location.state || {};

  // Redirect if no context
  useEffect(() => {
    if (!email && !phone) {
      navigate('/login', { replace: true });
    }
  }, [email, phone, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);



  const handleVerify = async () => {
    setError('');
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { otp: otpString };
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      const data = await verifyOTPApi(payload);

      if (purpose === 'registration' && data.token) {
        // Auto-login after registration
        login(data.token, data.user);
        navigate('/dashboard', { replace: true });
      } else if (purpose === 'forgot-password') {
        // Navigate to reset password
        navigate('/reset-password', {
          state: { email, phone, verified: true },
          replace: true,
        });
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      if (email) {
        await sendEmailOTP({ email, purpose });
        setSuccess('OTP resent to your email address');
      } else if (phone) {
        await sendPhoneOTP({ phone, purpose });
        setSuccess('OTP resent to your phone number');
      }

      // Reset timer
      setCountdown(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (!email && !phone) return null;

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={
        email && email.trim()
          ? `Enter the 6-digit code sent to ${email}`
          : `Enter the 6-digit code sent to ${phone}`
      }
      icon={ShieldCheck}
    >
      {/* Status Messages */}
      <AnimatePresence>
        {message && !error && !success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-400 text-center"
          >
            {message}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 text-center"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Input */}
      <motion.div
        animate={error ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <OTPInput value={otp} onChange={setOtp} error="" />
      </motion.div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={isLoading || otp.join('').length !== 6}
        className="w-full py-3.5 px-4 btn-glow rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify OTP'
        )}
      </button>

      {/* Resend OTP Block */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isResending}
          className={`text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors focus:outline-none ${
            canResend
              ? 'text-[#4FA3FF] hover:text-blue-300 cursor-pointer'
              : 'text-slate-600 cursor-not-allowed'
          }`}
        >
          <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
          {isResending ? 'Resending...' : 'Resend OTP'}
        </button>
        {!canResend && countdown > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            Resend available in {countdown}s
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
