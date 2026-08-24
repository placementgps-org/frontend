import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes — verify JWT from Authorization header.
 * Attaches the authenticated user (without password) to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

/**
 * Optional auth — attaches req.user if a valid token is present,
 * but allows the request to proceed even without a token.
 * Used for public routes that can show richer data for logged-in users.
 */
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Invalid token — just don't set req.user, continue as guest
      req.user = null;
    }
  }
  next();
};

export { protect, optionalProtect };
