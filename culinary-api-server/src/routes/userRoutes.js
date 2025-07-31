/**
 * User Routes - Professional User Management Endpoints
 * 
 * Comprehensive user routing with profile management, preferences,
 * and administrative controls.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const { handleValidationError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Validation middleware for profile updates
 */
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
    
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
    
  body('location.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
    
  body('location.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
    
  body('preferences.language')
    .optional()
    .isIn(['en', 'he', 'es', 'fr', 'de'])
    .withMessage('Invalid language preference'),
    
  body('preferences.timezone')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Invalid timezone'),
    
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
    
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be boolean'),
    
  body('preferences.privacy.profileVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Profile visibility must be one of: public, friends, private'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

/**
 * Validation middleware for user role updates (Admin only)
 */
const validateRoleUpdate = [
  body('role')
    .isIn(['user', 'chef', 'admin', 'moderator'])
    .withMessage('Role must be one of: user, chef, admin, moderator'),
    
  body('accountStatus')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Account status must be one of: active, inactive, suspended, pending'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

/**
 * Validation middleware for MongoDB ObjectId parameters
 */
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

/**
 * Validation middleware for query parameters
 */
const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
    
  query('sort')
    .optional()
    .matches(/^[a-zA-Z0-9_\s\-]+$/)
    .withMessage('Invalid sort parameter'),
    
  query('role')
    .optional()
    .isIn(['user', 'chef', 'admin', 'moderator'])
    .withMessage('Invalid role filter'),
    
  query('accountStatus')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'pending'])
    .withMessage('Invalid account status filter'),
    
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', userController.getMyProfile);
router.patch('/profile', validateProfileUpdate, userController.updateProfile);
router.delete('/profile', userController.deleteAccount);

// User activity routes
router.get('/bookmarks', validateQuery, userController.getBookmarkedRecipes);
router.get('/recipes', validateQuery, userController.getUserRecipes);
router.get('/activity', userController.getUserActivity);

// Public user profile routes
router.get('/:id/profile', validateObjectId, userController.getUserProfile);
router.get('/:id/recipes', validateObjectId, validateQuery, userController.getUserRecipes);

// Admin-only routes
router.use(restrictTo('admin', 'moderator'));

// User management routes
router.get('/', validateQuery, userController.getAllUsers);
router.get('/statistics', userController.getUserStatistics);
router.patch('/:id/role', validateObjectId, validateRoleUpdate, userController.updateUserRole);
router.delete('/:id', validateObjectId, userController.deleteUser);

module.exports = router;