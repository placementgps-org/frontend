import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

/**
 * LoginPage — Full-page login with Email and Phone tabs.
 * Features: animated tab switching, remember me, forgot password link, error display.
 */
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Check for success message from reset password
  const successMessage = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (activeTab === 'email' && !email) {
      setError('Please enter your email address');
      return;
    }
    if (activeTab === 'phone' && !phone) {
      setError('Please enter your phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const credentials = activeTab === 'email'
        ? { email, password }
        : { phone, password };

      const data = await loginUser(credentials);

      // Store auth data
      login(data.token, data.user);

      // Navigate to dashboard or redirect URL
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      if (err.data && err.data.unverified) {
        // Redirect to OTP verification page after a 2 second delay so they can read the error message
        setTimeout(() => {
          navigate('/verify-otp', {
            state: {
              email: err.data.email,
              phone: err.data.phone,
              purpose: 'registration',
              message: err.message,
            },
          });
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'email', label: 'Email Login', icon: Mail },
    { id: 'phone', label: 'Phone Login', icon: Phone },
  ];

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back! Access your placement guide"
      icon={LogIn}
    >
      {/* Success message from password reset */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 text-center"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Tab Switcher */}
      <div className="relative flex rounded-xl bg-slate-950/60 border border-slate-800 p-1 mb-6">
        {/* Animated Tab Indicator */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-[#2F80FF]/20 border border-[#2F80FF]/30"
          style={{ width: 'calc(50% - 4px)' }}
          animate={{ x: activeTab === 'email' ? 2 : 'calc(100% + 6px)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setError(''); }}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.id ? 'text-[#4FA3FF]' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'email' ? (
            <motion.div
              key="email-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <AuthInput
                id="login-email"
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
              key="phone-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <AuthInput
                id="login-phone"
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

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-xs font-medium text-[#4FA3FF] mb-1.5 uppercase tracking-wider font-semibold"
          >
            PlacementGPS Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your PlacementGPS password"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950/60 text-[#2F80FF] focus:ring-[#2F80FF]/30 focus:ring-2 cursor-pointer accent-[#2F80FF]"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs text-[#4FA3FF] hover:text-blue-300 font-medium transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 btn-glow rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link
          to={`/register${location.search}`}
          className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 ml-1"
        >
          Create Account
        </Link>
      </div>
    </AuthLayout>
  );
}
