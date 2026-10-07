import rateLimit from 'express-rate-limit';

/**
 * Standard Express IP rate limiter middleware using 'express-rate-limit'.
 * Prevents automated scripts and brute-force attempts on sensitive endpoints.
 * 
 * @param {number} limit - Maximum number of requests allowed in the time window.
 * @param {number} windowMs - Time window in milliseconds (default: 1 minute).
 */
export const rateLimiter = (limit = 5, windowMs = 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: limit,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again in a minute.',
    },
    handler: (req, res, next, options) => {
      console.warn(`[Rate Limiter] Blocked IP ${req.ip || req.headers['x-forwarded-for']} on route ${req.path}`);
      res.status(options.statusCode).json(options.message);
    },
  });
};
