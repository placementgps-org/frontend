import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, User, Mail, Phone, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { registerUser } from '../services/api';

/**
 * RegisterPage — Full registration form with validation.
 * On successful registration, navigates to OTP verification page.
 */
export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const navigate = useNavigate();

  const tabs = [
    { id: 'email', label: 'Email Register', icon: Mail },
    { id: 'phone', label: 'Phone Register', icon: Phone },
  ];

  // Update tab selection and clear errors/contact fields
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setErrors({});
    setServerError('');
    setForm((prev) => ({
      ...prev,
      email: '',
      phone: '',
    }));
  };

  // Update form field
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setServerError('');
  };

  // Validate all fields
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (activeTab === 'email') {
      if (!form.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (activeTab === 'phone') {
      if (!form.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10,15}$/.test(form.phone)) {
        newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
      }
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    const pw = form.password;
    if (!pw) return { level: 0, label: '', color: '' };

    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        password: form.password,
      };

      if (activeTab === 'email') {
        payload.email = form.email.trim().toLowerCase();
      } else {
        payload.phone = form.phone.trim();
      }

      const data = await registerUser(payload);

      // Navigate to OTP verification
      navigate('/verify-otp', {
        state: {
          email: activeTab === 'email' ? form.email.trim().toLowerCase() : undefined,
          phone: activeTab === 'phone' ? form.phone.trim() : undefined,
          purpose: 'registration',
          message: data.message,
        },
      });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Start your journey to your dream career"
      icon={UserPlus}
    >
      {/* Server Error */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 text-center"
          >
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

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
            onClick={() => handleTabChange(tab.id)}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.id ? 'text-[#4FA3FF]' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <AuthInput
          id="register-name"
          label="Full Name"
          icon={User}
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="John Doe"
          error={errors.name}
        />

        {/* Conditional Field (Email or Phone) */}
        <AnimatePresence mode="wait">
          {activeTab === 'email' ? (
            <motion.div
              key="email-field"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
            >
              <AuthInput
                id="register-email"
                label="Email Address"
                icon={Mail}
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="student@college.edu"
                error={errors.email}
              />
            </motion.div>
          ) : (
            <motion.div
              key="phone-field"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
            >
              <AuthInput
                id="register-phone"
                label="Phone Number"
                icon={Phone}
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="9876543210"
                error={errors.phone}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password */}
        <div>
          <label
            htmlFor="register-password"
            className="block text-xs font-medium text-[#4FA3FF] mb-1.5 uppercase tracking-wider font-semibold"
          >
            PlacementGPS Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Create a password for your account"
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
          {/* Password Strength Indicator */}
          {form.password && (
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
            htmlFor="register-confirm-password"
            className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider"
          >
            Confirm PlacementGPS Password
          </label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Re-enter your PlacementGPS password"
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

        {/* Terms & Conditions */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
              }}
              className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950/60 text-[#2F80FF] focus:ring-[#2F80FF]/30 focus:ring-2 cursor-pointer accent-[#2F80FF]"
            />
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
              I agree to the{' '}
              <span className="text-[#4FA3FF] hover:text-blue-300 underline underline-offset-2 cursor-pointer">
                Terms & Conditions
              </span>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1.5 ml-6 text-xs text-red-400 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
              {errors.terms}
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 ml-1"
        >
          Login
        </Link>
      </div>
    </AuthLayout>
  );
}
