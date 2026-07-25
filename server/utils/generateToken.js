import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for the given user ID.
 * Token expires in 30 days to support "Remember Me" sessions.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;
