import express from 'express';
import {
  register,
  login,
  sendEmailOTP,
  sendPhoneOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/authController.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// ── Auth Routes ──────────────────────────────────────────────────────────────
router.post('/register', rateLimiter(5, 60 * 1000), register); // 5 registrations per minute
router.post('/login', rateLimiter(5, 60 * 1000), login);       // 5 logins per minute
router.post('/send-email-otp', rateLimiter(3, 60 * 1000), sendEmailOTP); // 3 requests per minute
router.post('/send-phone-otp', rateLimiter(3, 60 * 1000), sendPhoneOTP); // 3 requests per minute
router.post('/verify-otp', rateLimiter(10, 60 * 1000), verifyOTP);       // 10 attempts per minute
router.post('/forgot-password', rateLimiter(3, 60 * 1000), forgotPassword); // 3 attempts per minute
router.post('/reset-password', rateLimiter(5, 60 * 1000), resetPassword);  // 5 attempts per minute
router.post('/logout', logout);

export default router;
