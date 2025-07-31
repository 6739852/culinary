/**
 * Category Controller - Professional Category Management System
 * 
 * Comprehensive category management with hierarchical structure,
 * statistics tracking, and advanced administrative features.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all categories with optional hierarchy and statistics
 */
const getAllCategories = catchAsync(async (req, res, next) => {
  let query = Category.find({ status: 'active' });

  // Include recipe counts if requested
  if (req.query.includeStats === 'true') {
    const categories = await Category.findWithRecipeCounts();
    
    return res.status(200).json({
      success: true,
      results: categories.length,
      data: {
        categories
      }
    });
  }

  // Get hierarchy if requested
  if (req.query.hierarchy === 'true') {
    const categories = await Category.findHierarchy();
    
    return res.status(200).json({
      success: true,
      results: categories.length,
      data: {
        categories
      }
    });
  }

  // Standard query with optional filtering
  if (req.query.featured === 'true') {
    query = query.find({ featured: true });
  }

  if (req.query.parent) {
    query = query.find({ parent: req.query.parent });
  }

  // Sorting
  const sortBy = req.query.sort || 'displayOrder name';
  query = query.sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Populate parent and children if requested
  if (req.query.populate === 'true') {
    query = query
      .populate('parent', 'name slug code')
      .populate('children', 'name slug code displayOrder')
      .populate('createdBy', 'firstName lastName username');
  }

  const categories = await query;
  const total = await Category.countDocuments({ status: 'active' });

  logger.info('Categories retrieved', {
    count: categories.length,
    total,
    filters: req.query
  });

  res.status(200).json({
    success: true,
    results: categories.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      categories
    }
  });
});

/**
 * Get single category by ID with full details
 */
const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug code path')
    .populate('children', 'name slug code displayOrder stats.recipeCount')
    .populate('createdBy', 'firstName lastName username')
    .populate('lastModifiedBy', 'firstName lastName username');

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  // Get recent recipes in this category
  const recentRecipes = await Recipe.find({
    category: category._id,
    status: 'published',
    visibility: 'public'
  })
    .sort('-createdAt')
    .limit(5)
    .populate('author', 'firstName lastName username profileImage')
    .select('title slug images averageRating totalRatings prepTime difficulty');

  logger.info('Category viewed', {
    categoryId: category._id,
    name: category.name,
    viewerId: req.user?._id
  });

  res.status(200).json({
    success: true,
    data: {
      category,
      recentRecipes
    }
  });
});

/**
 * Get category by slug
 */
const getCategoryBySlug = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ 
    slug: req.params.slug,
    status: 'active'
  })
    .populate('parent', 'name slug code')
    .populate('children', 'name slug code displayOrder stats.recipeCount');

  if (!category) {
    return next(new AppError('No category found with that slug', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      category
    }
  });
});

/**
 * Create new category (Admin only)
 */
const createCategory = catchAsync(async (req, res, next) => {
  // Check if category with same code or slug exists
  const existingCategory = await Category.findOne({
    $or: [
      { code: req.body.code?.toUpperCase() },
      { slug: req.body.slug }
    ]
  });

  if (existingCategory) {
    const field = existingCategory.code === req.body.code?.toUpperCase() ? 'code' : 'slug';
    return next(new AppError(`Category with this ${field} already exists`, 409));
  }

  // Add creator information
  const categoryData = {
    ...req.body,
    createdBy: req.user._id,
    lastModifiedBy: req.user._id
  };

  const newCategory = await Category.create(categoryData);

  // Populate the created category
  await newCategory.populate('createdBy', 'firstName lastName username');
  await newCategory.populate('parent', 'name slug code');

  logger.info('Category created', {
    categoryId: newCategory._id,
    name: newCategory.name,
    code: newCategory.code,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: {
      category: newCategory
    }
  });
});

/**
 * Update category (Admin only)
 */
const updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  // Check for duplicate code or slug if being updated
  if (req.body.code || req.body.slug) {
    const duplicateQuery = {
      _id: { $ne: req.params.id }
    };

    if (req.body.code) {
      duplicateQuery.code = req.body.code.toUpperCase();
    }
    if (req.body.slug) {
      duplicateQuery.slug = req.body.slug;
    }

    const existingCategory = await Category.findOne(duplicateQuery);
    if (existingCategory) {
      const field = existingCategory.code === req.body.code?.toUpperCase() ? 'code' : 'slug';
      return next(new AppError(`Category with this ${field} already exists`, 409));
    }
  }

  // Add last modified information
  req.body.lastModifiedBy = req.user._id;

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('parent', 'name slug code')
    .populate('children', 'name slug code displayOrder')
    .populate('lastModifiedBy', 'firstName lastName username');

  logger.info('Category updated', {
    categoryId: updatedCategory._id,
    name: updatedCategory.name,
    updatedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: {
      category: updatedCategory
    }
  });
});

/**
 * Delete category (Admin only)
 */
const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  // Check if category has recipes
  const recipeCount = await Recipe.countDocuments({ category: req.params.id });
  if (recipeCount > 0) {
    return next(new AppError(
      `Cannot delete category with ${recipeCount} recipes. Please move or delete the recipes first.`, 
      400
    ));
  }

  // Check if category has children
  if (category.children && category.children.length > 0) {
    return next(new AppError(
      'Cannot delete category with subcategories. Please delete or move the subcategories first.', 
      400
    ));
  }

  // Remove from parent's children array if it has a parent
  if (category.parent) {
    await Category.findByIdAndUpdate(
      category.parent,
      { $pull: { children: category._id } }
    );
  }

  await Category.findByIdAndDelete(req.params.id);

  logger.info('Category deleted', {
    categoryId: req.params.id,
    name: category.name,
    deletedBy: req.user._id
  });

  res.status(204).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * Update category recipe counts (Admin utility)
 */
const updateRecipeCounts = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ status: 'active' });
  const updatePromises = categories.map(category => category.updateRecipeCount());
  
  await Promise.all(updatePromises);

  logger.info('Category recipe counts updated', {
    updatedBy: req.user._id,
    categoriesCount: categories.length
  });

  res.status(200).json({
    success: true,
    message: `Updated recipe counts for ${categories.length} categories`
  });
});

/**
 * Get category statistics (Admin only)
 */
const getCategoryStats = catchAsync(async (req, res, next) => {
  const stats = await Category.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        featuredCategories: {
          $sum: { $cond: [{ $eq: ['$featured', true] }, 1, 0] }
        },
        totalRecipes: { $sum: '$stats.recipeCount' },
        averageRecipesPerCategory: { $avg: '$stats.recipeCount' }
      }
    }
  ]);

  const topCategories = await Category.find({ status: 'active' })
    .sort({ 'stats.recipeCount': -1 })
    .limit(10)
    .select('name code stats.recipeCount');

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalCategories: 0,
        featuredCategories: 0,
        totalRecipes: 0,
        averageRecipesPerCategory: 0
      },
      topCategories
    }
  });
});

/**
 * Reorder categories (Admin only)
 */
const reorderCategories = catchAsync(async (req, res, next) => {
  const { categoryOrders } = req.body; // Array of { id, displayOrder }

  if (!Array.isArray(categoryOrders)) {
    return next(new AppError('Category orders must be an array', 400));
  }

  const updatePromises = categoryOrders.map(({ id, displayOrder }) =>
    Category.findByIdAndUpdate(id, { displayOrder })
  );

  await Promise.all(updatePromises);

  logger.info('Categories reordered', {
    updatedBy: req.user._id,
    categoriesCount: categoryOrders.length
  });

  res.status(200).json({
    success: true,
    message: 'Categories reordered successfully'
  });
});

module.exports = {
  getAllCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  updateRecipeCounts,
  getCategoryStats,
  reorderCategories
};