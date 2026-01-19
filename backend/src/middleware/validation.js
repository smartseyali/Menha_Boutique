const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // For GET requests on public endpoints, return empty data instead of error
    // This prevents breaking the UI when validation fails (e.g., invalid UUID in URL)
    if (req.method === 'GET' && (req.path.includes('/categories') || req.path.includes('/products'))) {
      console.warn(`Validation error on GET ${req.path}, returning empty data`);
      // Check if it's a list endpoint (no ID) or detail endpoint (with ID)
      if (!req.params.id) {
        // List endpoint - return empty array
        return res.status(200).json({ categories: [], products: [] });
      } else {
        // Detail endpoint - return 404
        return res.status(404).json({ message: 'Resource not found' });
      }
    }
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

// Auth validation
const validateRegister = [
  body('phoneNumber').notEmpty().trim().isLength({ min: 10 }),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').optional().trim(),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').normalizeEmail(),
  handleValidationErrors,
];

const validateLogin = [
  body('password').notEmpty(),
  body('phoneNumber').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body().custom((value) => {
    if (!value.phoneNumber && !value.email) {
      throw new Error('Either phone number or email is required');
    }
    return true;
  }),
  handleValidationErrors,
];

// Product validation
const validateProduct = [
  body('title').notEmpty().trim(),
  body('sku').notEmpty().trim(),
  body('newPrice').isFloat({ min: 0 }),
  body('primaryImage').optional().isString(),
  handleValidationErrors,
];

// Order validation
const validateOrder = [
  body('shippingAddressId').isUUID(),
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').isFloat({ min: 0 }),
  handleValidationErrors,
];

// Review validation
const validateReview = [
  body('productId').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').notEmpty().trim(),
  handleValidationErrors,
];

// Address validation
const validateAddress = [
  body('firstName').notEmpty().trim(),
  body('lastName').optional().trim(),
  body('addressLine').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('postalCode').notEmpty().trim(),
  body('country').notEmpty().trim(),
  handleValidationErrors,
];

// UUID param validation
const validateUUID = [
  param('id').isUUID(),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder,
  validateReview,
  validateAddress,
  validateUUID,
};

