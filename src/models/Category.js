/**
 * Category Model - Professional Recipe Category Management
 * 
 * Comprehensive category system with hierarchical structure,
 * statistics tracking, and advanced features.
 * 
 * @author Professional Development Team
 * @version 2.1.0
 */

const mongoose = require('mongoose');

/**
 * Category Schema Definition
 * 
 * Professional category management with hierarchical support,
 * SEO optimization, and comprehensive metadata.
 */
const categorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  
  code: {
    type: String,
    required: [true, 'Category code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [2, 'Category code must be at least 2 characters long'],
    maxlength: [10, 'Category code cannot exceed 10 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Visual Elements
  icon: {
    type: String,
    trim: true
  },
  
  color: {
    type: String,
    trim: true,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
  },
  
  image: {
    url: { type: String, trim: true },
    alt: { type: String, trim: true },
    caption: { type: String, trim: true }
  },
  
  // Hierarchical Structure
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  level: {
    type: Number,
    default: 0,
    min: [0, 'Level cannot be negative'],
    max: [5, 'Maximum category depth is 5 levels']
  },
  
  path: {
    type: String,
    trim: true
  },
  
  // Statistics
  stats: {
    recipeCount: {
      type: Number,
      default: 0,
      min: [0, 'Recipe count cannot be negative']
    },
    totalViews: {
      type: Number,
      default: 0,
      min: [0, 'Views count cannot be negative']
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Average rating cannot be negative'],
      max: [5, 'Average rating cannot exceed 5']
    },
    popularityScore: {
      type: Number,
      default: 0,
      min: [0, 'Popularity score cannot be negative']
    }
  },
  
  // SEO and Metadata
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  
  // Content Management
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'archived', 'draft'],
      message: 'Status must be one of: active, inactive, archived, draft'
    },
    default: 'active'
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Localization
  translations: [{
    language: {
      type: String,
      required: true,
      enum: ['en', 'he', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true }
    }
  }],
  
  // Access Control
  visibility: {
    type: String,
    enum: {
      values: ['public', 'private', 'restricted'],
      message: 'Visibility must be one of: public, private, restricted'
    },
    default: 'public'
  },
  
  permissions: {
    canCreateRecipes: {
      type: Boolean,
      default: true
    },
    requiredRole: {
      type: String,
      enum: ['user', 'chef', 'admin', 'moderator'],
      default: 'user'
    }
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
categorySchema.index({ slug: 1 });
categorySchema.index({ code: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ status: 1, visibility: 1 });
categorySchema.index({ featured: 1, displayOrder: 1 });
categorySchema.index({ 'stats.recipeCount': -1 });
categorySchema.index({ 'stats.popularityScore': -1 });
categorySchema.index({ name: 'text', description: 'text' });

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  return this.path || this.slug;
});

// Virtual for recipe count including subcategories
categorySchema.virtual('totalRecipeCount').get(function() {
  // This would be populated by aggregation in practice
  return this.stats.recipeCount;
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Pre-save middleware to calculate path and level
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    if (this.parent) {
      try {
        const parent = await this.constructor.findById(this.parent);
        if (parent) {
          this.level = parent.level + 1;
          this.path = parent.path ? `${parent.path}/${this.slug}` : this.slug;
        }
      } catch (error) {
        return next(error);
      }
    } else {
      this.level = 0;
      this.path = this.slug;
    }
  }
  next();
});

// Post-save middleware to update parent's children array
categorySchema.post('save', async function(doc) {
  if (doc.parent) {
    await this.constructor.findByIdAndUpdate(
      doc.parent,
      { $addToSet: { children: doc._id } }
    );
  }
});

// Static method to find categories with recipe counts
categorySchema.statics.findWithRecipeCounts = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'recipes',
        localField: '_id',
        foreignField: 'category',
        as: 'recipes'
      }
    },
    {
      $addFields: {
        'stats.recipeCount': { $size: '$recipes' }
      }
    },
    {
      $project: {
        recipes: 0
      }
    },
    {
      $sort: { 'stats.recipeCount': -1, name: 1 }
    }
  ]);
};

// Static method to find category hierarchy
categorySchema.statics.findHierarchy = function() {
  return this.aggregate([
    {
      $match: { parent: null, status: 'active' }
    },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'descendants',
        maxDepth: 4
      }
    },
    {
      $sort: { displayOrder: 1, name: 1 }
    }
  ]);
};

// Instance method to update recipe count
categorySchema.methods.updateRecipeCount = async function() {
  const Recipe = mongoose.model('Recipe');
  const count = await Recipe.countDocuments({ 
    category: this._id, 
    status: 'published' 
  });
  
  this.stats.recipeCount = count;
  return this.save();
};

// Instance method to get ancestors
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      ancestors.unshift(current);
    } else {
      break;
    }
  }
  
  return ancestors;
};

// Instance method to get descendants
categorySchema.methods.getDescendants = async function() {
  return this.constructor.find({
    path: new RegExp(`^${this.path}/`)
  }).sort({ level: 1, name: 1 });
};

module.exports = mongoose.model('Category', categorySchema);