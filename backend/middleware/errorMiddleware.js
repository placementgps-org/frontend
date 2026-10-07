/**
 * Global error handling middleware.
 * Catches errors thrown by controllers and sends a formatted JSON response.
 */

// Handle 404 — Route not found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Generic error handler
const errorHandler = (err, req, res, _next) => {
  // Default to 500 if status code is still 200 (unexpected error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };
