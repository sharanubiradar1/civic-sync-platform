const { body, param, query, validationResult } = require('express-validator');

/**
 * Validate request and return errors if any
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User Registration Validation
 */
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number')
];

/**
 * User Login Validation
 */
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Issue Creation Validation
 */
exports.createIssueValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn([
      'Road & Transportation',
      'Water & Sanitation',
      'Electricity',
      'Garbage & Waste',
      'Street Lights',
      'Parks & Recreation',
      'Public Safety',
      'Building & Infrastructure',
      'Pollution',
      'Other'
    ]).withMessage('Invalid category'),
  
  body('location.address')
    .trim()
    .notEmpty().withMessage('Location address is required'),
  
  body('location.coordinates.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((value) => {
      const [lng, lat] = value;
      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    })
];

/**
 * Issue Update Validation
 */
exports.updateIssueValidation = [
  param('id')
    .isMongoId().withMessage('Invalid issue ID'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'resolved', 'rejected']).withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
];

/**
 * Comment Validation
 */
exports.commentValidation = [
  param('id')
    .isMongoId().withMessage('Invalid issue ID'),
  
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
];

/**
 * MongoDB ID Validation
 */
exports.mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];