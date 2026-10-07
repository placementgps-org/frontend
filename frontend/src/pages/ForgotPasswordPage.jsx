import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, Phone, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { forgotPassword } from '../services/api';

/**
 * ForgotPasswordPage — Allows recovery via Email or Phone.
 * Sends OTP and navigates to verification page.
 */
export default function ForgotPasswordPage() {
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (method === 'email' && !email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (method === 'email' && !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (method === 'phone' && !phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (method === 'phone' && !/^\d{10,15}$/.test(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const payload = method === 'email'
        ? { email: email.trim().toLowerCase() }
        : { phone: phone.trim() };

      const data = await forgotPassword(payload);

      // Navigate to OTP verification
      navigate('/verify-otp', {
        state: {
          email: method === 'email' ? email.trim().toLowerCase() : undefined,
          phone: method === 'phone' ? phone.trim() : undefined,
          purpose: 'forgot-password',
          method,
          message: data.message,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const methods = [
    { id: 'email', label: 'Recover via Email', icon: Mail },
    { id: 'phone', label: 'Recover via Phone', icon: Phone },
  ];

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="No worries! We'll help you recover your account"
      icon={KeyRound}
    >
      {/* Method Switcher */}
      <div className="relative flex rounded-xl bg-slate-950/60 border border-slate-800 p-1 mb-6">
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-[#2F80FF]/20 border border-[#2F80FF]/30"
          style={{ width: 'calc(50% - 4px)' }}
          animate={{ x: method === 'email' ? 2 : 'calc(100% + 6px)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />

        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => { setMethod(m.id); setError(''); }}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              method === m.id ? 'text-[#4FA3FF]' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {method === 'email' ? (
            <motion.div
              key="forgot-email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <AuthInput
                id="forgot-email"
                label="Email Address"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
              />
            </motion.div>
          ) : (
            <motion.div
              key="forgot-phone"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <AuthInput
                id="forgot-phone"
                label="Phone Number"
                icon={Phone}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 btn-glow rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending OTP...
            </>
          ) : (
            'Send OTP'
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-xs text-slate-400 hover:text-slate-300 font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}
