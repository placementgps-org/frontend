import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import { resetPassword as resetPasswordApi } from '../services/api';

/**
 * ResetPasswordPage — Set a new password after OTP verification.
 * Only accessible with verified route state.
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const { email, phone, verified } = location.state || {};

  // Redirect if not coming from OTP verification
  useEffect(() => {
    if (!verified || (!email && !phone)) {
      navigate('/forgot-password', { replace: true });
    }
  }, [verified, email, phone, navigate]);

  // Password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    // Validate
    const newErrors = {};
    if (!password) {
      newErrors.password = 'New password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const payload = { password };
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      await resetPasswordApi(payload);

      // Navigate to login with success message
      navigate('/login', {
        state: { message: 'Password reset successful! You can now login with your new password.' },
        replace: true,
      });
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!verified || (!email && !phone)) return null;

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a strong new password for your account"
      icon={Lock}
    >
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
        {/* New Password */}
        <div>
          <label
            htmlFor="reset-password"
            className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors({}); setError(''); }}
              placeholder="Min. 8 characters"
              className={`w-full bg-slate-950/60 border ${
                errors.password ? 'border-red-500/60' : 'border-slate-800 focus:border-blue-500'
              } rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
                errors.password ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Password Strength */}
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-medium ${
                passwordStrength.level <= 1 ? 'text-red-400' :
                passwordStrength.level <= 2 ? 'text-yellow-400' :
                passwordStrength.level <= 3 ? 'text-blue-400' : 'text-emerald-400'
              }`}>
                {passwordStrength.label}
              </span>
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="reset-confirm-password"
            className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); setError(''); }}
              placeholder="Re-enter new password"
              className={`w-full bg-slate-950/60 border ${
                errors.confirmPassword ? 'border-red-500/60' : 'border-slate-800 focus:border-blue-500'
              } rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
                errors.confirmPassword ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
              {errors.confirmPassword}
            </p>
          )}
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
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
