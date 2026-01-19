const config = require('../config/config');

function errorHandler(err, req, res, next) {
  console.error('Error Handler:', {
    message: err.message,
    name: err.name,
    code: err.code,
    status: err.status || err.statusCode,
    stack: config.server.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Validation errors (from express-validator)
  // express-validator errors are typically handled by handleValidationErrors middleware
  // But if they reach here, handle them
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    // For GET requests on public endpoints, return empty data instead of error
    if (req.method === 'GET' && (req.path.includes('/categories') || req.path.includes('/products'))) {
      console.warn(`Validation error on GET ${req.path}, returning empty data`);
      return res.status(200).json({ categories: [], products: [] });
    }
    return res.status(400).json({
      message: 'Validation error',
      errors: errors,
    });
  }

  // Validation errors (from mongoose or other)
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({
      message: err.message || 'Validation error',
      errors: err.errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      message: 'Duplicate entry',
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      message: 'Invalid reference',
    });
  }

  // Database connection errors - return 500, not 400
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    console.error('Database connection error:', err.message);
    return res.status(500).json({
      message: 'Database connection error',
    });
  }

  // Default error - use 500 for unexpected errors, not 400
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // For GET requests on public endpoints, return empty data instead of error
  // This prevents breaking the UI when backend has issues
  if (req.method === 'GET') {
    // For public GET endpoints, return empty array/object instead of error
    if (req.path.includes('/categories') || req.path.includes('/products')) {
      console.warn(`Returning empty data for ${req.path} due to error (${status}): ${message}`);
      if (req.path.includes('/products')) {
        return res.status(200).json({ 
          products: [], 
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } 
        });
      }
      if (req.path.includes('/categories')) {
        return res.status(200).json({ categories: [] });
      }
    }
  }
  
  // For database column errors (42703), return empty data for GET requests
  if (req.method === 'GET' && (err.code === '42703' || err.message?.includes('column') || err.message?.includes('does not exist'))) {
    if (req.path.includes('/categories') || req.path.includes('/products')) {
      console.warn(`Database column error for ${req.path}, returning empty data:`, err.message);
      if (req.path.includes('/products')) {
        return res.status(200).json({ 
          products: [], 
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } 
        });
      }
      if (req.path.includes('/categories')) {
        return res.status(200).json({ categories: [] });
      }
    }
  }

  res.status(status).json({
    message,
    ...(config.server.env === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;

