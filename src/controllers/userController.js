/**
 * User Controller - Professional User Management System
 * 
 * Comprehensive user management with profile handling, activity tracking,
 * and administrative features.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get current user's profile
 */
const getMyProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('-password -passwordChangedAt -loginAttempts -lockUntil')
    .populate('stats');

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * Update current user's profile
 */
const updateProfile = catchAsync(async (req, res, next) => {
  // Fields that users can update themselves
  const allowedFields = [
    'firstName', 'lastName', 'bio', 'phoneNumber', 'location',
    'preferences', 'profileImage'
  ];

  // Filter out fields that shouldn't be updated
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -passwordChangedAt -loginAttempts -lockUntil');

  logger.info('User profile updated', {
    userId: updatedUser._id,
    username: updatedUser.username,
    updatedFields: Object.keys(filteredBody)
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Delete current user's account
 */
const deleteAccount = catchAsync(async (req, res, next) => {
  // Instead of deleting, we'll deactivate the account
  await User.findByIdAndUpdate(req.user._id, {
    accountStatus: 'inactive',
    email: `deleted_${Date.now()}_${req.user.email}`,
    username: `deleted_${Date.now()}_${req.user.username}`
  });

  // Also set all user's recipes to private
  await Recipe.updateMany(
    { author: req.user._id },
    { visibility: 'private', status: 'archived' }
  );

  logger.info('User account deactivated', {
    userId: req.user._id,
    username: req.user.username
  });

  res.status(204).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

/**
 * Get user's bookmarked recipes
 */
const getBookmarkedRecipes = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const recipes = await Recipe.find({
    bookmarks: req.user._id,
    status: 'published',
    visibility: { $in: ['public', 'friends_only'] }
  })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('author', 'firstName lastName username profileImage')
    .populate('category', 'name slug code')
    .select('-bookmarks -ratings');

  const total = await Recipe.countDocuments({
    bookmarks: req.user._id,
    status: 'published',
    visibility: { $in: ['public', 'friends_only'] }
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
 * Get user's recipes (can be own recipes or another user's public recipes)
 */
const getUserRecipes = catchAsync(async (req, res, next) => {
  const userId = req.params.id || req.user._id;
  const isOwnProfile = userId === req.user._id.toString();
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  // Build query based on ownership and visibility
  let query = { author: userId };
  
  if (!isOwnProfile && req.user.role !== 'admin') {
    query.status = 'published';
    query.visibility = 'public';
  }

  const recipes = await Recipe.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('category', 'name slug code')
    .select(isOwnProfile ? '' : '-bookmarks -ratings.user');

  const total = await Recipe.countDocuments(query);

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
 * Get user's activity summary
 */
const getUserActivity = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Get recipe statistics
  const recipeStats = await Recipe.aggregate([
    { $match: { author: userId } },
    {
      $group: {
        _id: null,
        totalRecipes: { $sum: 1 },
        publishedRecipes: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: { $size: '$likes' } },
        totalBookmarks: { $sum: { $size: '$bookmarks' } },
        averageRating: { $avg: '$averageRating' }
      }
    }
  ]);

  // Get recent activity
  const recentRecipes = await Recipe.find({ author: userId })
    .sort('-createdAt')
    .limit(5)
    .select('title createdAt status views averageRating')
    .populate('category', 'name');

  const activity = {
    stats: recipeStats[0] || {
      totalRecipes: 0,
      publishedRecipes: 0,
      totalViews: 0,
      totalLikes: 0,
      totalBookmarks: 0,
      averageRating: 0
    },
    recentRecipes
  };

  res.status(200).json({
    success: true,
    data: {
      activity
    }
  });
});

/**
 * Get public user profile
 */
const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('firstName lastName username profileImage bio location stats createdAt preferences.privacy');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check privacy settings
  if (user.preferences?.privacy?.profileVisibility === 'private') {
    return next(new AppError('This profile is private', 403));
  }

  // Get user's public recipe count
  const recipeCount = await Recipe.countDocuments({
    author: user._id,
    status: 'published',
    visibility: 'public'
  });

  const profileData = {
    ...user.toObject(),
    stats: {
      ...user.stats,
      publicRecipes: recipeCount
    }
  };

  res.status(200).json({
    success: true,
    data: {
      user: profileData
    }
  });
});

/**
 * Get all users (Admin only)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  // Build query
  let query = User.find();

  // Filtering
  if (req.query.role) {
    query = query.find({ role: req.query.role });
  }

  if (req.query.accountStatus) {
    query = query.find({ accountStatus: req.query.accountStatus });
  }

  if (req.query.search) {
    query = query.find({
      $or: [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]
    });
  }

  // Sorting
  const sortBy = req.query.sort || '-createdAt';
  query = query.sort(sortBy);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  query = query
    .skip(skip)
    .limit(limit)
    .select('-password -passwordChangedAt -loginAttempts -lockUntil -emailVerificationToken -passwordResetToken');

  const users = await query;
  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    results: users.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      users
    }
  });
});

/**
 * Update user role (Admin only)
 */
const updateUserRole = catchAsync(async (req, res, next) => {
  const { role, accountStatus } = req.body;

  // Prevent admin from changing their own role
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot change your own role', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const updateData = {};
  if (role) updateData.role = role;
  if (accountStatus) updateData.accountStatus = accountStatus;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -passwordChangedAt -loginAttempts -lockUntil');

  logger.info('User role updated by admin', {
    targetUserId: updatedUser._id,
    targetUsername: updatedUser.username,
    newRole: updatedUser.role,
    newStatus: updatedUser.accountStatus,
    adminId: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Delete user (Admin only)
 */
const deleteUser = catchAsync(async (req, res, next) => {
  // Prevent admin from deleting themselves
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Archive user's recipes instead of deleting them
  await Recipe.updateMany(
    { author: req.params.id },
    { status: 'archived', visibility: 'private' }
  );

  await User.findByIdAndDelete(req.params.id);

  logger.info('User deleted by admin', {
    deletedUserId: req.params.id,
    deletedUsername: user.username,
    adminId: req.user._id
  });

  res.status(204).json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * Get user statistics (Admin only)
 */
const getUserStatistics = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$accountStatus', 'active'] }, 1, 0] }
        },
        pendingUsers: {
          $sum: { $cond: [{ $eq: ['$accountStatus', 'pending'] }, 1, 0] }
        },
        suspendedUsers: {
          $sum: { $cond: [{ $eq: ['$accountStatus', 'suspended'] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
        }
      }
    }
  ]);

  const roleStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const recentUsers = await User.find()
    .sort('-createdAt')
    .limit(10)
    .select('firstName lastName username email createdAt accountStatus role');

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        suspendedUsers: 0,
        verifiedUsers: 0
      },
      roleDistribution: roleStats,
      recentUsers
    }
  });
});

module.exports = {
  getMyProfile,
  updateProfile,
  deleteAccount,
  getBookmarkedRecipes,
  getUserRecipes,
  getUserActivity,
  getUserProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserStatistics
};