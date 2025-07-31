/**
 * Recipe Routes - Professional Recipe Management Endpoints
 * 
 * Comprehensive recipe routing with validation, authentication,
 * and advanced filtering capabilities.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const recipeController = require('../controllers/recipeController');
const { protect, restrictTo, checkOwnership } = require('../middleware/auth');
const { handleValidationError } = require('../middleware/errorHandler');
const Recipe = require('../models/Recipe');

const router = express.Router();

/**
 * Validation middleware for recipe creation
 */
const validateRecipeCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Recipe title must be between 3 and 100 characters'),
    
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Recipe description must be between 10 and 2000 characters'),
    
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Recipe must have at least one ingredient'),
    
  body('ingredients.*.name')
    .trim()
    .notEmpty()
    .withMessage('Ingredient name is required'),
    
  body('ingredients.*.quantity')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Ingredient quantity must be a positive number'),
    
  body('ingredients.*.unit')
    .isIn(['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'clove', 'pinch', 'dash'])
    .withMessage('Invalid ingredient unit'),
    
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('Recipe must have at least one instruction step'),
    
  body('instructions.*.stepNumber')
    .isInt({ min: 1 })
    .withMessage('Step number must be a positive integer'),
    
  body('instructions.*.description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Instruction description must be between 1 and 1000 characters'),
    
  body('prepTime')
    .isInt({ min: 1 })
    .withMessage('Preparation time must be at least 1 minute'),
    
  body('cookTime')
    .isInt({ min: 0 })
    .withMessage('Cooking time cannot be negative'),
    
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Difficulty must be one of: beginner, intermediate, advanced, expert'),
    
  body('servings')
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
    
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
    
  body('cuisine')
    .isIn([
      'italian', 'french', 'chinese', 'japanese', 'indian', 'mexican', 
      'thai', 'mediterranean', 'american', 'british', 'german', 'spanish',
      'korean', 'vietnamese', 'greek', 'turkish', 'moroccan', 'lebanese',
      'fusion', 'international', 'other'
    ])
    .withMessage('Invalid cuisine type'),
    
  body('mealType')
    .optional()
    .isArray()
    .custom((value) => {
      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'beverage'];
      return value.every(type => validMealTypes.includes(type));
    })
    .withMessage('Invalid meal type'),
    
  body('dietaryRestrictions')
    .optional()
    .isArray()
    .custom((value) => {
      const validRestrictions = [
        'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free',
        'egg-free', 'soy-free', 'keto', 'paleo', 'low-carb', 'low-fat',
        'low-sodium', 'diabetic-friendly', 'heart-healthy'
      ];
      return value.every(restriction => validRestrictions.includes(restriction));
    })
    .withMessage('Invalid dietary restriction'),
    
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'friends_only'])
    .withMessage('Visibility must be one of: public, private, friends_only'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

/**
 * Validation middleware for recipe rating
 */
const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
    
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
    
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
    .withMessage('Invalid recipe ID'),
    
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
    
  query('maxPrepTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max preparation time must be a positive integer'),
    
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),
    
  query('cuisine')
    .optional()
    .isIn([
      'italian', 'french', 'chinese', 'japanese', 'indian', 'mexican', 
      'thai', 'mediterranean', 'american', 'british', 'german', 'spanish',
      'korean', 'vietnamese', 'greek', 'turkish', 'moroccan', 'lebanese',
      'fusion', 'international', 'other'
    ])
    .withMessage('Invalid cuisine type'),
    
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'rating', 'popular', 'prepTime', 'title'])
    .withMessage('Invalid sort option'),
    
  (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return next(handleValidationError(errors));
    }
    next();
  }
];

// Public routes
router.get('/', validateQuery, recipeController.getAllRecipes);
router.get('/popular', validateQuery, recipeController.getPopularRecipes);
router.get('/category/:categoryId', 
  param('categoryId').isMongoId().withMessage('Invalid category ID'),
  validateQuery, 
  recipeController.getRecipesByCategory
);
router.get('/:id', validateObjectId, recipeController.getRecipe);

// Protected routes - require authentication
router.use(protect);

// User recipe management
router.get('/user/my-recipes', validateQuery, recipeController.getMyRecipes);
router.post('/', validateRecipeCreation, recipeController.createRecipe);

// Recipe interaction routes
router.post('/:id/rate', validateObjectId, validateRating, recipeController.rateRecipe);
router.post('/:id/bookmark', validateObjectId, recipeController.toggleBookmark);

// Recipe modification routes - require ownership or admin role
router.patch('/:id', 
  validateObjectId, 
  checkOwnership(Recipe), 
  validateRecipeCreation, 
  recipeController.updateRecipe
);

router.delete('/:id', 
  validateObjectId, 
  checkOwnership(Recipe), 
  recipeController.deleteRecipe
);

module.exports = router;