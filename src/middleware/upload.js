/**
 * File Upload Middleware - Professional Media Management
 * 
 * Advanced file upload handling with validation, optimization,
 * and security features using Multer.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Storage configuration for different file types
 */
const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../public/uploads', destination));
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp and random number
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
  });
};

/**
 * File filter for images
 */
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400), false);
  }
};

/**
 * File filter for videos
 */
const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only MP4, MPEG, MOV, and WebM videos are allowed', 400), false);
  }
};

/**
 * Recipe image upload configuration
 */
const uploadRecipeImages = multer({
  storage: createStorage('recipes'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});

/**
 * Profile image upload configuration
 */
const uploadProfileImage = multer({
  storage: createStorage('profiles'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 1 // Single file only
  }
});

/**
 * Category image upload configuration
 */
const uploadCategoryImage = multer({
  storage: createStorage('categories'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
    files: 1 // Single file only
  }
});

/**
 * Video upload configuration
 */
const uploadVideo = multer({
  storage: createStorage('videos'),
  fileFilter: videoFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1 // Single file only
  }
});

/**
 * Middleware to handle upload errors
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Please check the size limits.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Please check the file count limits.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field. Please check your form data.';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in the form data.';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long.';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long.';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields in the form data.';
        break;
    }
    
    logger.warn('File upload error', {
      error: error.code,
      message,
      userId: req.user?._id,
      ip: req.ip
    });
    
    return next(new AppError(message, 400));
  }
  
  next(error);
};

/**
 * Middleware to process uploaded files
 */
const processUploadedFiles = (req, res, next) => {
  if (req.files || req.file) {
    const files = req.files || [req.file];
    const processedFiles = [];
    
    files.forEach(file => {
      if (file) {
        processedFiles.push({
          fieldname: file.fieldname,
          originalname: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${path.dirname(file.path).split(path.sep).pop()}/${file.filename}`
        });
      }
    });
    
    req.uploadedFiles = processedFiles;
    
    logger.info('Files uploaded successfully', {
      count: processedFiles.length,
      files: processedFiles.map(f => ({ name: f.filename, size: f.size })),
      userId: req.user?._id
    });
  }
  
  next();
};

/**
 * Recipe image upload middleware
 */
const uploadRecipeImagesMiddleware = [
  uploadRecipeImages.array('images', 5),
  handleUploadError,
  processUploadedFiles
];

/**
 * Profile image upload middleware
 */
const uploadProfileImageMiddleware = [
  uploadProfileImage.single('profileImage'),
  handleUploadError,
  processUploadedFiles
];

/**
 * Category image upload middleware
 */
const uploadCategoryImageMiddleware = [
  uploadCategoryImage.single('image'),
  handleUploadError,
  processUploadedFiles
];

/**
 * Video upload middleware
 */
const uploadVideoMiddleware = [
  uploadVideo.single('video'),
  handleUploadError,
  processUploadedFiles
];

module.exports = {
  uploadRecipeImages: uploadRecipeImagesMiddleware,
  uploadProfileImage: uploadProfileImageMiddleware,
  uploadCategoryImage: uploadCategoryImageMiddleware,
  uploadVideo: uploadVideoMiddleware,
  handleUploadError,
  processUploadedFiles
};