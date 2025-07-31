/**
 * Category Routes - Professional Category Management Endpoints
 * 
 * Comprehensive category routing with validation, authentication,
 * and administrative controls.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const { handleValidationError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Validation middleware for category creation/update
 */
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-&']+$/)
    .withMessage('Category name can only contain letters, numbers, spaces, hyphens, ampersands, and apostrophes'),
    
  body('code')
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Category code must be between 2 and 10 characters')
    .matches(/^[A-Z0-9_]+$/)
    .withMessage('Category code can only contain uppercase letters, numbers, and underscores')
    .customSanitizer(value => value.toUpperCase()),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Parent must be a valid category ID'),
    
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
    
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
    
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
    
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
    
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'restricted'])
    .withMessage('Visibility must be one of: public, private, restricted'),
    
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived', 'draft'])
    .withMessage('Status must be one of: active, inactive, archived, draft'),
    
  body('seo.metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
    
  body('seo.metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters'),
    
  body('seo.keywords')
    .optional()
    .isArray()
    .withMessage('SEO keywords must be an array'),
    
  body('seo.keywords.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each keyword must be between 1 and 30 characters'),
    
  body('translations')
    .optional()
    .isArray()
    .withMessage('Translations must be an array'),
    
  body('translations.*.language')
    .optional()
    .isIn(['en', 'he', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
    .withMessage('Invalid language code'),
    
  body('translations.*.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Translation name must be between 2 and 50 characters'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

/**
 * Validation middleware for category reordering
 */
const validateReorder = [
  body('categoryOrders')
    .isArray({ min: 1 })
    .withMessage('Category orders must be a non-empty array'),
    
  body('categoryOrders.*.id')
    .isMongoId()
    .withMessage('Each category ID must be valid'),
    
  body('categoryOrders.*.displayOrder')
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
    
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
    .withMessage('Invalid category ID'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

/**
 * Validation middleware for slug parameters
 */
const validateSlug = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    
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
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sort')
    .optional()
    .matches(/^[a-zA-Z0-9_\s\-]+$/)
    .withMessage('Invalid sort parameter'),
    
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value'),
    
  query('hierarchy')
    .optional()
    .isBoolean()
    .withMessage('Hierarchy must be a boolean value'),
    
  query('includeStats')
    .optional()
    .isBoolean()
    .withMessage('Include stats must be a boolean value'),
    
  query('populate')
    .optional()
    .isBoolean()
    .withMessage('Populate must be a boolean value'),
    
  query('parent')
    .optional()
    .isMongoId()
    .withMessage('Parent must be a valid category ID'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

// Public routes - accessible to everyone
router.get('/', validateQuery, categoryController.getAllCategories);
router.get('/slug/:slug', validateSlug, categoryController.getCategoryBySlug);
router.get('/:id', validateObjectId, categoryController.getCategory);

// Protected routes - require authentication
router.use(protect);

// Admin-only routes - require admin role
router.use(restrictTo('admin', 'moderator'));

// Category management routes
router.post('/', validateCategory, categoryController.createCategory);
router.patch('/:id', validateObjectId, validateCategory, categoryController.updateCategory);
router.delete('/:id', validateObjectId, categoryController.deleteCategory);

// Administrative utility routes
router.patch('/admin/update-recipe-counts', categoryController.updateRecipeCounts);
router.get('/admin/statistics', categoryController.getCategoryStats);
router.patch('/admin/reorder', validateReorder, categoryController.reorderCategories);

module.exports = router;