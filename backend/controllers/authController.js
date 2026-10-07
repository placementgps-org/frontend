import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';

/**
 * Generate a 6-digit numeric OTP.
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash an OTP before storing in the database.
 */
const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  const t0 = Date.now();
  const elapsed = () => `${Date.now() - t0}ms`;

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[Register] Request received                      [+${elapsed()}]`);
    console.log('[Register] Body:', JSON.stringify(req.body, null, 2));
    console.log('[Register] Database status:', User.db.readyState === 1 ? 'Connected' : 'Disconnected');

    const { name, email, phone, password } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      console.log('[Register] Validation failed: Name is required');
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    // Must provide either email or phone, but not necessarily both
    if (!email && !phone) {
      console.log('[Register] Validation failed: Double null on contact fields');
      return res.status(400).json({ success: false, message: 'Please provide either email or phone number' });
    }

    // If email is provided, validate email format
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      console.log('[Register] Validation failed: Invalid email format');
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    // If phone is provided, validate phone format (10-15 digits)
    if (phone && !/^\d{10,15}$/.test(phone)) {
      console.log('[Register] Validation failed: Invalid phone format');
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number (10-15 digits)' });
    }

    // Validate password length
    if (!password || password.length < 8) {
      console.log('[Register] Validation failed: Password must be at least 8 characters');
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    console.log(`[Register] Input validation successful            [+${elapsed()}]`);

    // Check for duplicate email if provided
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        if (emailExists.emailVerified || emailExists.phoneVerified) {
          console.log('[Register] User already exists with email:', email);
          return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        } else {
          // If existing user is unverified, delete them so we can re-create them
          console.log('[Register] Found unverified duplicate email. Deleting stale user:', emailExists._id);
          await User.deleteOne({ _id: emailExists._id });
        }
      }
    }

    // Check for duplicate phone if provided
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        if (phoneExists.emailVerified || phoneExists.phoneVerified) {
          console.log('[Register] User already exists with phone:', phone);
          return res.status(409).json({ success: false, message: 'An account with this phone number already exists' });
        } else {
          console.log('[Register] Found unverified duplicate phone. Deleting stale user:', phoneExists._id);
          await User.deleteOne({ _id: phoneExists._id });
        }
      }
    }

    console.log(`[Register] Duplicate check complete               [+${elapsed()}]`);

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    console.log(`[Register] OTP generated and hashed               [+${elapsed()}]`);

    // Create user (unverified)
    const user = await User.create({
      name: name.trim(),
      email: email ? email.toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      password,
      otp: hashedOTP,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      otpPurpose: 'registration',
    });
    console.log(`[Register] User document created in DB: ${user._id}  [+${elapsed()}]`);

    // Send OTP (email or SMS) — respond to user FIRST, then send asynchronously
    const verificationMessage = email
      ? 'Registration successful. Please verify your email with the OTP sent.'
      : 'Registration successful. Please verify your phone number with the OTP sent.';

    // Send the response immediately so the user doesn't wait for SMTP
    res.status(201).json({
      success: true,
      message: verificationMessage,
      userId: user._id,
      email: user.email,
      phone: user.phone,
    });

    console.log(`[Register] Response sent to client                [+${elapsed()}]`);

    // Now send the OTP in the background (after response is already sent)
    if (email) {
      try {
        console.log(`[Register] Sending Email OTP to ${email}...`);
        await sendEmail({
          to: email.toLowerCase(),
          subject: 'Verify Your Placement GPS Account',
          otp,
        });
        console.log(`[Register] ✅ Email OTP delivered                 [+${elapsed()}]`);
      } catch (emailError) {
        console.error(`[Register] ❌ Email send failed:`, emailError.message);
        // User already has the response; mark user for resend
      }
    } else if (phone) {
      try {
        console.log(`[Register] Sending SMS OTP to ${phone}...`);
        await sendSMS({ phone, otp });
        console.log(`[Register] ✅ SMS OTP delivered                   [+${elapsed()}]`);
      } catch (smsError) {
        console.error(`[Register] ❌ SMS send failed:`, smsError.message);
      }
    }

    console.log(`[Register] Registration pipeline complete         [+${elapsed()}]`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('[register] Error in server/controllers/authController.js -> register:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message || 'Server error during registration. Please try again.', error: error.message });
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Login] Request received');
    console.log('[Login] Body:', JSON.stringify({ ...req.body, password: '***' }, null, 2));

    const { email, phone, password } = req.body;

    // Must provide either email or phone
    if (!email && !phone) {
      console.log('[Login] Validation failed: Eeither email or phone is required');
      return res.status(400).json({ success: false, message: 'Please provide email or phone number' });
    }

    if (!password) {
      console.log('[Login] Validation failed: Password is required');
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Find user by email or phone
    const query = email ? { email: email.toLowerCase() } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      console.log('[Login] Authentication failed: User not found');
      return res.status(401).json({ success: false, message: 'Account not found. Please check your credentials.' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('[Login] Authentication failed: Password mismatch');
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    // Enforce verification checks
    if (email && !user.emailVerified) {
      console.log('[Login] Authentication blocked: Email unverified');
      return res.status(401).json({
        success: false,
        message: 'Your email address is not verified. Please verify your account first.',
        unverified: true,
        email: user.email,
      });
    }

    if (phone && !user.phoneVerified) {
      console.log('[Login] Authentication blocked: Phone number unverified');
      return res.status(401).json({
        success: false,
        message: 'Your phone number is not verified. Please verify your account first.',
        unverified: true,
        phone: user.phone,
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    console.log('[Login] Successful login for user:', user._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('[login] Error in server/controllers/authController.js -> login:', error.stack);
    res.status(500).json({ success: false, message: 'Server error during login. Please try again.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/send-email-otp
// ─────────────────────────────────────────────────────────────────────────────
export const sendEmailOTP = async (req, res) => {
  try {
    console.log('[Send Email OTP] Request received:', req.body);
    const { email, purpose } = req.body;

    if (!email) {
      console.log('[Send Email OTP] Validation failed: Email missing');
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('[Send Email OTP] User not found for email:', email);
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    user.otp = hashedOTP;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = purpose || 'registration';
    user.otpAttempts = 0; // Reset attempts for new OTP
    await user.save({ validateModifiedOnly: true });

    console.log('[Send Email OTP] OTP generated and saved in DB');

    // Send OTP
    await sendEmail({
      to: email.toLowerCase(),
      subject: 'Your Placement GPS Verification Code',
      otp,
    });
    console.log('[Send Email OTP] OTP successfully sent/logged');

    res.json({ success: true, message: 'OTP sent to your email address' });
  } catch (error) {
    console.error('[sendEmailOTP] Error in server/controllers/authController.js -> sendEmailOTP:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/send-phone-otp
// ─────────────────────────────────────────────────────────────────────────────
export const sendPhoneOTP = async (req, res) => {
  try {
    console.log('[Send Phone OTP] Request received:', req.body);
    const { phone, purpose } = req.body;

    if (!phone) {
      console.log('[Send Phone OTP] Validation failed: Phone missing');
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      console.log('[Send Phone OTP] User not found for phone:', phone);
      return res.status(404).json({ success: false, message: 'No account found with this phone number' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    user.otp = hashedOTP;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = purpose || 'registration';
    user.otpAttempts = 0; // Reset attempts for new OTP
    await user.save({ validateModifiedOnly: true });

    console.log('[Send Phone OTP] OTP generated and saved in DB');

    // Send OTP via SMS
    await sendSMS({ phone, otp });
    console.log('[Send Phone OTP] OTP successfully sent/logged');

    res.json({ success: true, message: 'OTP sent to your phone number' });
  } catch (error) {
    console.error('[sendPhoneOTP] Error in server/controllers/authController.js -> sendPhoneOTP:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[Verify OTP] Request received:', req.body);
    const { email, phone, otp } = req.body;

    if (!otp) {
      console.log('[Verify OTP] Validation failed: OTP missing');
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    if (!email && !phone) {
      console.log('[Verify OTP] Validation failed: Email and Phone both missing');
      return res.status(400).json({ success: false, message: 'Email or phone number is required' });
    }

    // Find user and include OTP fields (and attempts)
    const query = email ? { email: email.toLowerCase() } : { phone };
    const user = await User.findOne(query).select('+otp +otpExpires +otpPurpose +otpAttempts');

    if (!user) {
      console.log('[Verify OTP] User not found');
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check if OTP exists
    if (!user.otp || !user.otpExpires) {
      console.log('[Verify OTP] Verification failed: No active OTP record in database');
      return res.status(400).json({ success: false, message: 'No active OTP verification session found. Please request a new one.' });
    }

    // Check if OTP has expired
    if (user.otpExpires < new Date()) {
      console.log('[Verify OTP] Verification failed: OTP expired');
      // Clear expired OTP
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpPurpose = '';
      user.otpAttempts = 0;
      await user.save({ validateModifiedOnly: true });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Increment and track attempts
    user.otpAttempts = (user.otpAttempts || 0) + 1;

    // Check if attempts exceed the limit of 3
    if (user.otpAttempts > 3) {
      console.log(`[Verify OTP] Verification blocked: Too many attempts (${user.otpAttempts})`);
      // Wipe OTP session completely to prevent brute force
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpPurpose = '';
      user.otpAttempts = 0;
      await user.save({ validateModifiedOnly: true });
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect OTP attempts. This verification session has been locked. Please request a new OTP.',
      });
    }

    // Compare OTP
    const isOTPValid = await bcrypt.compare(otp, user.otp);
    if (!isOTPValid) {
      console.log(`[Verify OTP] Verification failed: Incorrect OTP value (Attempts: ${user.otpAttempts}/3)`);
      await user.save({ validateModifiedOnly: true });
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. Please try again. Attempts remaining: ${3 - user.otpAttempts}`,
        attemptsRemaining: 3 - user.otpAttempts
      });
    }

    const purpose = user.otpPurpose;
    console.log('[Verify OTP] OTP matched successfully. Purpose:', purpose);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpPurpose = '';
    user.otpAttempts = 0; // Reset attempts on success

    // If registration flow, mark as verified
    if (purpose === 'registration') {
      if (email) {
        user.emailVerified = true;
        console.log('[Verify OTP] Marking emailVerified = true');
      }
      if (phone) {
        user.phoneVerified = true;
        console.log('[Verify OTP] Marking phoneVerified = true');
      }
    }

    await user.save({ validateModifiedOnly: true });
    console.log('[Verify OTP] User document updated in DB');

    // For registration: auto-login with token
    if (purpose === 'registration') {
      const token = generateToken(user._id);
      console.log('[Verify OTP] Registration auto-login successful');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return res.json({
        success: true,
        message: 'Verification successful. Account activated.',
        verified: true,
        purpose,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          role: user.role,
          profileImage: user.profileImage,
        },
      });
    }

    // For forgot-password: return success without token
    console.log('[Verify OTP] Verification successful (Forgot Password flow)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    res.json({
      success: true,
      message: 'OTP verified successfully',
      verified: true,
      purpose,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error('[verifyOTP] Error in server/controllers/authController.js -> verifyOTP:', error.stack);
    res.status(500).json({ success: false, message: 'Server error during OTP verification. Please try again.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Please provide email or phone number' });
    }

    const query = email ? { email: email.toLowerCase() } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this credential' });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    user.otp = hashedOTP;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'forgot-password';
    await user.save({ validateModifiedOnly: true });

    // Send OTP via appropriate channel
    if (email) {
      await sendEmail({
        to: email,
        subject: 'Reset Your Placement GPS Password',
        otp,
      });
      return res.json({ success: true, message: 'OTP sent to your email address', method: 'email' });
    }

    await sendSMS({ phone, otp });
    res.json({ success: true, message: 'OTP sent to your phone number', method: 'phone' });
  } catch (error) {
    console.error('[forgotPassword] Error in server/controllers/authController.js -> forgotPassword:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to process request. Please try again.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone number is required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const query = email ? { email: email.toLowerCase() } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error('[resetPassword] Error in server/controllers/authController.js -> resetPassword:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  // JWT is stateless — client handles token removal.
  // This endpoint exists for API completeness and future token blacklisting.
  res.json({ success: true, message: 'Logged out successfully' });
};
