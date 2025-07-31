/**
 * Authentication Controller - Professional User Authentication Management
 * 
 * Comprehensive authentication system with registration, login, password reset,
 * email verification, and advanced security features.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { createSendToken } = require('../middleware/auth');
const EmailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * User Registration
 * Creates a new user account with email verification
 */
const register = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    phoneNumber,
    location
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    logger.warn('Registration attempt with existing credentials', {
      field,
      value: existingUser[field],
      ip: req.ip
    });
    
    return next(new AppError(`User with this ${field} already exists`, 409));
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    phoneNumber,
    location,
    emailVerificationToken,
    emailVerificationExpires,
    accountStatus: 'pending'
  });

  // Send welcome email with verification link
  try {
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
    
    await EmailService.sendWelcomeEmail({
      email: newUser.email,
      firstName: newUser.firstName,
      verificationUrl
    });

    logger.info('User registered successfully', {
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email
    });

  } catch (emailError) {
    logger.error('Failed to send welcome email', {
      userId: newUser._id,
      error: emailError.message
    });
    
    // Don't fail registration if email fails
  }

  // Send response without password
  newUser.password = undefined;
  newUser.emailVerificationToken = undefined;

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
    data: {
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        accountStatus: newUser.accountStatus,
        isEmailVerified: newUser.isEmailVerified
      }
    }
  });
});

/**
 * User Login
 * Authenticates user and returns JWT token
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exists and password is correct
  let user;
  try {
    user = await User.findByCredentials(email, password);
  } catch (error) {
    logger.warn('Failed login attempt', {
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error.message
    });
    
    return next(new AppError('Invalid email or password', 401));
  }

  // 3) Check if email is verified
  if (!user.isEmailVerified) {
    logger.warn('Login attempt with unverified email', {
      userId: user._id,
      email: user.email
    });
    
    return next(new AppError('Please verify your email address before logging in', 401));
  }

  // 4) If everything ok, send token to client
  logger.info('User logged in successfully', {
    userId: user._id,
    username: user.username,
    ip: req.ip
  });

  createSendToken(user, 200, res, 'Login successful');
});

/**
 * User Logout
 * Invalidates JWT token
 */
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  logger.info('User logged out', {
    userId: req.user?._id,
    username: req.user?.username
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Verify Email Address
 * Activates user account after email verification
 */
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // Find user with this token and check if token hasn't expired
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Email verification token is invalid or has expired', 400));
  }

  // Update user verification status
  user.isEmailVerified = true;
  user.accountStatus = 'active';
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info('Email verified successfully', {
    userId: user._id,
    email: user.email
  });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! Your account is now active.',
    data: {
      user: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus
      }
    }
  });
});

/**
 * Resend Email Verification
 * Sends a new verification email
 */
const resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
    
    await EmailService.sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationUrl
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Failed to send verification email', {
      userId: user._id,
      error: error.message
    });

    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

/**
 * Forgot Password
 * Sends password reset email
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2) Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    await EmailService.sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      resetUrl: resetURL
    });

    logger.info('Password reset email sent', {
      userId: user._id,
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });

  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Failed to send password reset email', {
      userId: user._id,
      error: err.message
    });

    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

/**
 * Reset Password
 * Resets user password using reset token
 */
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info('Password reset successfully', {
    userId: user._id,
    email: user.email
  });

  // 3) Log the user in, send JWT
  createSendToken(user, 200, res, 'Password reset successful');
});

/**
 * Update Password
 * Updates password for authenticated user
 */
const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.comparePassword(req.body.passwordCurrent))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  await user.save();

  logger.info('Password updated successfully', {
    userId: user._id,
    username: user.username
  });

  // 4) Log user in, send JWT
  createSendToken(user, 200, res, 'Password updated successfully');
});

/**
 * Get Current User
 * Returns current authenticated user data
 */
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('stats')
    .select('-__v');

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * Refresh Token
 * Issues a new JWT token
 */
const refreshToken = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User no longer exists', 401));
  }

  createSendToken(user, 200, res, 'Token refreshed successfully');
});

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updatePassword,
  getMe,
  refreshToken
};