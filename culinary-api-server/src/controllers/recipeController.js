/**
 * Recipe Controller - Professional Recipe Management System
 * 
 * Comprehensive recipe management with advanced features including
 * search, filtering, ratings, and media handling.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const Recipe = require('../models/Recipe');
const Category = require('../models/Category');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all recipes with advanced filtering and pagination
 */
const getAllRecipes = catchAsync(async (req, res, next) => {
  // Build query object
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  let query = Recipe.find(JSON.parse(queryStr));

  // Only show published and public recipes for non-owners
  if (!req.user || req.user.role !== 'admin') {
    query = query.find({ status: 'published', visibility: 'public' });
  }

  // Text search
  if (req.query.search) {
    query = query.find({
      $text: { $search: req.query.search }
    });
  }

  // Dietary restrictions filter
  if (req.query.dietary) {
    const dietaryRestrictions = req.query.dietary.split(',');
    query = query.find({ dietaryRestrictions: { $in: dietaryRestrictions } });
  }

  // Cuisine filter
  if (req.query.cuisine) {
    query = query.find({ cuisine: req.query.cuisine });
  }

  // Difficulty filter
  if (req.query.difficulty) {
    query = query.find({ difficulty: req.query.difficulty });
  }

  // Preparation time filter
  if (req.query.maxPrepTime) {
    query = query.find({ prepTime: { $lte: parseInt(req.query.maxPrepTime) } });
  }

  // Category filter
  if (req.query.category) {
    query = query.find({ category: req.query.category });
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sort by newest
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Populate references
  query = query
    .populate('author', 'firstName lastName username profileImage')
    .populate('category', 'name slug code');

  // Execute query
  const recipes = await query;

  // Get total count for pagination
  const total = await Recipe.countDocuments(JSON.parse(queryStr));

  logger.info('Recipes retrieved', {
    count: recipes.length,
    total,
    page,
    filters: req.query
  });

  res.status(200).json({
    success: true,
    results: recipes.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      recipes
    }
  });
});

/**
 * Get single recipe by ID
 */
const getRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('author', 'firstName lastName username profileImage bio')
    .populate('category', 'name slug code description')
    .populate('ratings.user', 'firstName lastName username profileImage');

  if (!recipe) {
    return next(new AppError('No recipe found with that ID', 404));
  }

  // Check if user can view this recipe
  if (recipe.visibility === 'private' && 
      (!req.user || (!recipe.author.equals(req.user._id) && req.user.role !== 'admin'))) {
    return next(new AppError('You do not have permission to view this recipe', 403));
  }

  // Increment views (only if not the author)
  if (!req.user || !recipe.author.equals(req.user._id)) {
    await recipe.incrementViews();
  }

  logger.info('Recipe viewed', {
    recipeId: recipe._id,
    title: recipe.title,
    viewerId: req.user?._id,
    views: recipe.views
  });

  res.status(200).json({
    success: true,
    data: {
      recipe
    }
  });
});

/**
 * Create new recipe
 */
const createRecipe = catchAsync(async (req, res, next) => {
  // Verify category exists
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new AppError('Invalid category ID', 400));
    }
  }

  // Add author to recipe data
  const recipeData = {
    ...req.body,
    author: req.user._id
  };

  const newRecipe = await Recipe.create(recipeData);

  // Populate the created recipe
  await newRecipe.populate('author', 'firstName lastName username profileImage');
  await newRecipe.populate('category', 'name slug code');

  // Update category recipe count
  if (newRecipe.category) {
    await Category.findByIdAndUpdate(
      newRecipe.category,
      { $inc: { 'stats.recipeCount': 1 } }
    );
  }

  logger.info('Recipe created', {
    recipeId: newRecipe._id,
    title: newRecipe.title,
    authorId: req.user._id,
    category: newRecipe.category?.name
  });

  res.status(201).json({
    success: true,
    message: 'Recipe created successfully',
    data: {
      recipe: newRecipe
    }
  });
});

/**
 * Update recipe
 */
const updateRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError('No recipe found with that ID', 404));
  }

  // Check ownership
  if (!recipe.author.equals(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own recipes', 403));
  }

  // Verify category if being updated
  if (req.body.category && req.body.category !== recipe.category.toString()) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new AppError('Invalid category ID', 400));
    }

    // Update category counts
    await Category.findByIdAndUpdate(
      recipe.category,
      { $inc: { 'stats.recipeCount': -1 } }
    );
    await Category.findByIdAndUpdate(
      req.body.category,
      { $inc: { 'stats.recipeCount': 1 } }
    );
  }

  const updatedRecipe = await Recipe.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('author', 'firstName lastName username profileImage')
    .populate('category', 'name slug code');

  logger.info('Recipe updated', {
    recipeId: updatedRecipe._id,
    title: updatedRecipe.title,
    updatedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Recipe updated successfully',
    data: {
      recipe: updatedRecipe
    }
  });
});

/**
 * Delete recipe
 */
const deleteRecipe = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError('No recipe found with that ID', 404));
  }

  // Check ownership
  if (!recipe.author.equals(req.user._id) && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own recipes', 403));
  }

  // Update category recipe count
  if (recipe.category) {
    await Category.findByIdAndUpdate(
      recipe.category,
      { $inc: { 'stats.recipeCount': -1 } }
    );
  }

  await Recipe.findByIdAndDelete(req.params.id);

  logger.info('Recipe deleted', {
    recipeId: req.params.id,
    title: recipe.title,
    deletedBy: req.user._id
  });

  res.status(204).json({
    success: true,
    message: 'Recipe deleted successfully'
  });
});

/**
 * Get user's recipes
 */
const getMyRecipes = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const recipes = await Recipe.find({ author: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('category', 'name slug code')
    .select('-__v');

  const total = await Recipe.countDocuments({ author: req.user._id });

  res.status(200).json({
    success: true,
    results: recipes.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      recipes
    }
  });
});

/**
 * Rate a recipe
 */
const rateRecipe = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError('No recipe found with that ID', 404));
  }

  // Users cannot rate their own recipes
  if (recipe.author.equals(req.user._id)) {
    return next(new AppError('You cannot rate your own recipe', 400));
  }

  await recipe.addRating(req.user._id, rating, review);

  logger.info('Recipe rated', {
    recipeId: recipe._id,
    rating,
    userId: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Recipe rated successfully',
    data: {
      averageRating: recipe.averageRating,
      totalRatings: recipe.totalRatings
    }
  });
});

/**
 * Bookmark/unbookmark recipe
 */
const toggleBookmark = catchAsync(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new AppError('No recipe found with that ID', 404));
  }

  const isBookmarked = recipe.bookmarks.includes(req.user._id);

  if (isBookmarked) {
    recipe.bookmarks.pull(req.user._id);
  } else {
    recipe.bookmarks.push(req.user._id);
  }

  await recipe.save();

  logger.info('Recipe bookmark toggled', {
    recipeId: recipe._id,
    userId: req.user._id,
    action: isBookmarked ? 'removed' : 'added'
  });

  res.status(200).json({
    success: true,
    message: `Recipe ${isBookmarked ? 'removed from' : 'added to'} bookmarks`,
    data: {
      bookmarked: !isBookmarked,
      bookmarkCount: recipe.bookmarks.length
    }
  });
});

/**
 * Get popular recipes
 */
const getPopularRecipes = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const recipes = await Recipe.findPopular(limit);

  res.status(200).json({
    success: true,
    results: recipes.length,
    data: {
      recipes
    }
  });
});

/**
 * Get recipes by category
 */
const getRecipesByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const recipes = await Recipe.find({
    category: categoryId,
    status: 'published',
    visibility: 'public'
  })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('author', 'firstName lastName username profileImage')
    .populate('category', 'name slug code');

  const total = await Recipe.countDocuments({
    category: categoryId,
    status: 'published',
    visibility: 'public'
  });

  res.status(200).json({
    success: true,
    results: recipes.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      category,
      recipes
    }
  });
});

module.exports = {
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getMyRecipes,
  rateRecipe,
  toggleBookmark,
  getPopularRecipes,
  getRecipesByCategory
};