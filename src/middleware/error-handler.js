/**
 * Centralized error handling middleware.
 * Must be registered after all routes.
 */
function errorHandler(err, req, res, next) {
  console.error('[error-handler]', err.message || err);

  // Avoid leaking internal details in production
  const isProduction = process.env.NODE_ENV === 'production';

  const status = err.status || err.statusCode || 500;
  const message = status === 500 && isProduction
    ? 'Internal server error'
    : (err.message || 'Internal server error');

  res.status(status).json({
    success: false,
    error: message
  });
}

/**
 * 404 handler for unknown routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};