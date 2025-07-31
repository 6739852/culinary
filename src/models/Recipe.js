/**
 * Recipe Model - Professional Culinary Recipe Management Schema
 * 
 * Comprehensive recipe model with advanced features including
 * nutritional information, ratings, comments, and media management.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const mongoose = require('mongoose');

/**
 * Ingredient Schema - Detailed ingredient specification
 */
const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Ingredient quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Ingredient unit is required'],
    enum: {
      values: ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'clove', 'pinch', 'dash'],
      message: 'Please provide a valid unit of measurement'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Ingredient notes cannot exceed 200 characters']
  }
});

/**
 * Instruction Step Schema - Detailed cooking instructions
 */
const instructionSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: [true, 'Step number is required'],
    min: [1, 'Step number must be at least 1']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Step title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Step description is required'],
    trim: true,
    maxlength: [1000, 'Step description cannot exceed 1000 characters']
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  temperature: {
    value: { type: Number },
    unit: {
      type: String,
      enum: ['celsius', 'fahrenheit'],
      default: 'celsius'
    }
  },
  image: {
    type: String,
    trim: true
  },
  tips: [{
    type: String,
    trim: true,
    maxlength: [200, 'Tip cannot exceed 200 characters']
  }]
});

/**
 * Nutritional Information Schema
 */
const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, min: 0 },
  protein: { type: Number, min: 0 }, // grams
  carbohydrates: { type: Number, min: 0 }, // grams
  fat: { type: Number, min: 0 }, // grams
  fiber: { type: Number, min: 0 }, // grams
  sugar: { type: Number, min: 0 }, // grams
  sodium: { type: Number, min: 0 }, // milligrams
  cholesterol: { type: Number, min: 0 }, // milligrams
  vitamins: {
    vitaminA: { type: Number, min: 0 },
    vitaminC: { type: Number, min: 0 },
    vitaminD: { type: Number, min: 0 },
    vitaminE: { type: Number, min: 0 }
  },
  minerals: {
    calcium: { type: Number, min: 0 },
    iron: { type: Number, min: 0 },
    potassium: { type: Number, min: 0 },
    magnesium: { type: Number, min: 0 }
  }
});

/**
 * Rating Schema - User ratings and reviews
 */
const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Main Recipe Schema
 */
const recipeSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  summary: {
    type: String,
    trim: true,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },
  
  // Media
  images: [{
    url: { type: String, required: true },
    caption: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false }
  }],
  
  videoUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid video URL']
  },
  
  // Recipe Details
  ingredients: {
    type: [ingredientSchema],
    required: [true, 'At least one ingredient is required'],
    validate: {
      validator: function(ingredients) {
        return ingredients && ingredients.length > 0;
      },
      message: 'Recipe must have at least one ingredient'
    }
  },
  
  instructions: {
    type: [instructionSchema],
    required: [true, 'At least one instruction step is required'],
    validate: {
      validator: function(instructions) {
        return instructions && instructions.length > 0;
      },
      message: 'Recipe must have at least one instruction step'
    }
  },
  
  // Timing and Difficulty
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute']
  },
  
  cookTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [0, 'Cooking time cannot be negative']
  },
  
  totalTime: {
    type: Number,
    // Will be calculated automatically
  },
  
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: 'Difficulty must be one of: beginner, intermediate, advanced, expert'
    }
  },
  
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1']
  },
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Recipe category is required']
  },
  
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required'],
    trim: true,
    enum: {
      values: [
        'italian', 'french', 'chinese', 'japanese', 'indian', 'mexican', 
        'thai', 'mediterranean', 'american', 'british', 'german', 'spanish',
        'korean', 'vietnamese', 'greek', 'turkish', 'moroccan', 'lebanese',
        'fusion', 'international', 'other'
      ],
      message: 'Please select a valid cuisine type'
    }
  },
  
  mealType: [{
    type: String,
    enum: {
      values: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'beverage'],
      message: 'Please select valid meal types'
    }
  }],
  
  dietaryRestrictions: [{
    type: String,
    enum: {
      values: [
        'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free',
        'egg-free', 'soy-free', 'keto', 'paleo', 'low-carb', 'low-fat',
        'low-sodium', 'diabetic-friendly', 'heart-healthy'
      ],
      message: 'Please select valid dietary restrictions'
    }
  }],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Nutritional Information
  nutrition: nutritionSchema,
  
  // User Interaction
  ratings: [ratingSchema],
  
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Recipe Management
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipe author is required']
  },
  
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived', 'pending_review'],
      message: 'Status must be one of: draft, published, archived, pending_review'
    },
    default: 'draft'
  },
  
  visibility: {
    type: String,
    enum: {
      values: ['public', 'private', 'friends_only'],
      message: 'Visibility must be one of: public, private, friends_only'
    },
    default: 'public'
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  shares: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Source Information
  source: {
    type: {
      type: String,
      enum: ['original', 'adapted', 'traditional'],
      default: 'original'
    },
    attribution: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid source URL']
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ author: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ status: 1, visibility: 1 });
recipeSchema.index({ featured: 1 });
recipeSchema.index({ dietaryRestrictions: 1 });

// Virtual for total time calculation
recipeSchema.virtual('calculatedTotalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Pre-save middleware to calculate total time
recipeSchema.pre('save', function(next) {
  this.totalTime = this.prepTime + this.cookTime;
  next();
});

// Pre-save middleware to calculate average rating
recipeSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = Math.round((totalRating / this.ratings.length) * 10) / 10;
    this.totalRatings = this.ratings.length;
  }
  next();
});

// Static method to find recipes by dietary restrictions
recipeSchema.statics.findByDietaryRestrictions = function(restrictions) {
  return this.find({
    dietaryRestrictions: { $in: restrictions },
    status: 'published',
    visibility: 'public'
  });
};

// Static method to find popular recipes
recipeSchema.statics.findPopular = function(limit = 10) {
  return this.find({
    status: 'published',
    visibility: 'public'
  })
  .sort({ averageRating: -1, totalRatings: -1, views: -1 })
  .limit(limit)
  .populate('author', 'firstName lastName username profileImage')
  .populate('category', 'name code');
};

// Instance method to add rating
recipeSchema.methods.addRating = function(userId, rating, review) {
  // Remove existing rating from this user
  this.ratings = this.ratings.filter(r => !r.user.equals(userId));
  
  // Add new rating
  this.ratings.push({
    user: userId,
    rating: rating,
    review: review
  });
  
  return this.save();
};

// Instance method to increment views
recipeSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Recipe', recipeSchema);