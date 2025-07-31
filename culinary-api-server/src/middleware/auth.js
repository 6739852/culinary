/**
 * Authentication Middleware - Professional JWT Authentication
 * 
 * Comprehensive authentication system with token validation,
 * user verification, and role-based access control.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const { AppError, catchAsync } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Generate JWT Token
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'culinary-api',
    audience: 'culinary-app'
  });
};

/**
 * Create and send JWT token response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.passwordChangedAt = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        lastLoginAt: user.lastLoginAt
      }
    }
  });
};

/**
 * Protect routes - Verify JWT token
 */
const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    logger.warn('Access attempt without token', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });
    
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    return next(new AppError('Token verification failed', 401));
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
  if (!currentUser) {
    logger.warn('Token used for non-existent user', {
      userId: decoded.id,
      ip: req.ip
    });
    
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user account is active
  if (currentUser.accountStatus !== 'active') {
    logger.warn('Access attempt with inactive account', {
      userId: currentUser._id,
      accountStatus: currentUser.accountStatus,
      ip: req.ip
    });
    
    return next(new AppError('Your account is not active. Please contact support.', 403));
  }

  // 5) Check if user is locked
  if (currentUser.isLocked) {
    logger.warn('Access attempt with locked account', {
      userId: currentUser._id,
      ip: req.ip
    });
    
    return next(new AppError('Your account is temporarily locked. Please try again later.', 423));
  }

  // 6) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    logger.warn('Token used after password change', {
      userId: currentUser._id,
      tokenIat: decoded.iat,
      passwordChangedAt: currentUser.passwordChangedAt
    });
    
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  
  logger.info('User authenticated successfully', {
    userId: currentUser._id,
    username: currentUser.username,
    role: currentUser.role
  });
  
  next();
});

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl
      });
      
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};

/**
 * Check if user is logged in (for rendered pages)
 */
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

/**
 * Verify email token
 */
const verifyEmailToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  
  if (!token) {
    return next(new AppError('Email verification token is required', 400));
  }

  // Find user with this token and check if token hasn't expired
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Email verification token is invalid or has expired', 400));
  }

  req.user = user;
  next();
});

/**
 * Check resource ownership
 */
const checkOwnership = (Model, paramName = 'id') => {
  return catchAsync(async (req, res, next) => {
    const resource = await Model.findById(req.params[paramName]);
    
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      req.resource = resource;
      return next();
    }

    // Check if user owns the resource
    const ownerField = resource.author || resource.createdBy || resource.user;
    if (!ownerField || !ownerField.equals(req.user._id)) {
      logger.warn('Access denied - resource ownership', {
        userId: req.user._id,
        resourceId: resource._id,
        resourceOwner: ownerField
      });
      
      return next(new AppError('You can only access your own resources', 403));
    }

    req.resource = resource;
    next();
  });
};

/**
 * Rate limiting for authentication endpoints
 */
const authRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for auth endpoint', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
        retryAfter: '15 minutes'
      }
    });
  }
});

module.exports = {
  signToken,
  createSendToken,
  protect,
  restrictTo,
  isLoggedIn,
  verifyEmailToken,
  checkOwnership,
  authRateLimit
};