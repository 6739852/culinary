const RecipeModel = require("../models/Recipe");
const CategoryModel = require("../models/Category");
const { recipeSchema, recipeUpdateSchema } = require("../validations/recipeValidation");// 🆕 שליפת כל המתכונים עם search, limit, page (דרישה חסרה!)
exports.getAllRecipes = async (req, res) => {
  try {
    const { 
      search = "", 
      limit = 10, 
      page = 1 
    } = req.query;

    // בניית query לחיפוש
    let query = { isPrivate: false };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $elemMatch: { $regex: search, $options: 'i' } } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const recipes = await RecipeModel
      .find(query)
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await RecipeModel.countDocuments(query);

    res.json({
      recipes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecipes: total,
        hasNext: page < Math.ceil(total / parseInt(limit)),
        hasPrev: page > 1
      },
      searchTerm: search
    });
  } catch (err) {
    res.status(500).json({ error: { message: "Failed to fetch recipes", detail: err.message } });
  }
};

// 🆕 שליפת מתכונים של המשתמש המחובר (דרישה חסרה!)
exports.getMyRecipes = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    const recipes = await RecipeModel
      .find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await RecipeModel.countDocuments({ createdBy: req.user._id });

    res.json({
      recipes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecipes: total
      }
    });
  } catch (err) {
    res.status(500).json({ error: { message: "Failed to fetch user's recipes", detail: err.message } });
  }
};

// יצירת מתכון חדש עם validation ועדכון קטגוריה
exports.createRecipe = async (req, res) => {
  // 🆕 Validation
  const { error } = recipeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: { message: error.details[0].message } 
    });
  }

  try {
    const { category } = req.body;

    // טיפול בקטגוריה
    let categoryDoc = await CategoryModel.findOne({ name: category });

    if (!categoryDoc) {
      categoryDoc = new CategoryModel({
        code: category.toUpperCase().replace(/\s/g, "_"),
        name: category,
        description: `קטגוריה אוטומטית עבור מתכוני ${category}`,
        recipeCount: 0,
        recipes: []
      });
      await categoryDoc.save();
    }

    const recipe = new RecipeModel({
      ...req.body,
      createdBy: req.user._id
    });

    await recipe.save();

    // עדכון הקטגוריה
    await CategoryModel.updateOne(
      { _id: categoryDoc._id },
      { 
        $inc: { recipeCount: 1 },
        $push: { recipes: recipe._id }
      }
    );

    await recipe.populate("createdBy", "username");
    
    res.status(201).json({
      message: "Recipe created successfully",
      recipe
    });
  } catch (err) {
    res.status(500).json({ error: { message: "Failed to create recipe", detail: err.message } });
  }
};

// שליפת מתכונים לפי קטגוריה
exports.getRecipesByCategory = async (req, res) => {
  const { categoryName } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const query = { 
      category: categoryName,
      isPrivate: false 
    };

    const recipes = await RecipeModel
      .find(query)
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await RecipeModel.countDocuments(query);

    if (recipes.length === 0) {
      return res.status(404).json({
        error: { message: `No recipes found in category '${categoryName}'` }
      });
    }

    res.json({
      recipes,
      category: categoryName,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecipes: total
      }
    });
  } catch (err) {
    res.status(500).json({
      error: { message: "Failed to fetch recipes by category", detail: err.message }
    });
  }
};

// שליפת מתכון לפי ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await RecipeModel.findById(req.params.id).populate("createdBy", "username");
    if (!recipe) return res.status(404).json({ error: { message: "Recipe not found" } });
    
    // בדיקה אם המתכון פרטי ולא שייך למשתמש הנוכחי
    if (recipe.isPrivate && recipe.createdBy._id.toString() !== req.user?._id) {
      return res.status(403).json({ error: { message: "Access denied" } });
    }
    
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: { message: "Error fetching recipe", detail: err.message } });
  }
};

// שליפת מתכונים לפי זמן הכנה
exports.getRecipesByPrepTime = async (req, res) => {
  const maxMinutes = parseInt(req.query.maxMinutes);
  if (isNaN(maxMinutes)) {
    return res.status(400).json({ error: { message: "Missing or invalid maxMinutes query parameter" } });
  }

  try {
    const recipes = await RecipeModel
      .find({ 
        preparationTime: { $lte: maxMinutes },
        isPrivate: false 
      })
      .populate("createdBy", "username")
      .sort({ preparationTime: 1 });
      
    res.json({
      recipes,
      maxMinutes,
      count: recipes.length
    });
  } catch (err) {
    res.status(500).json({ error: { message: "Error fetching recipes", detail: err.message } });
  }
};

// עדכון מתכון עם validation
exports.updateRecipe = async (req, res) => {
  // 🆕 Validation
  const { error } = recipeUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: { message: error.details[0].message } 
    });
  }

  try {
    const recipe = await RecipeModel.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: { message: "Recipe not found" } });

    if (recipe.createdBy.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ error: { message: "Unauthorized to update this recipe" } });
    }

    const updated = await RecipeModel.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate("createdBy", "username");

    res.json({
      message: "Recipe updated successfully",
      recipe: updated
    });
  } catch (err) {
    res.status(500).json({ error: { message: "Failed to update recipe", detail: err.message } });
  }
};

// מחיקת מתכון
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await RecipeModel.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: { message: "Recipe not found" } });

    if (recipe.createdBy.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ error: { message: "Unauthorized to delete this recipe" } });
    }

    // עדכון הקטגוריה
    await CategoryModel.updateOne(
      { name: recipe.category },
      { 
        $inc: { recipeCount: -1 },
        $pull: { recipes: recipe._id }
      }
    );

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted successfully", recipeId: recipe._id });
  } catch (err) {
    res.status(500).json({ error: { message: "Failed to delete recipe", detail: err.message } });
  }
};

// הוסיפי את הפונקציה הזו לסוף recipeController.js

// 🆕 העלאת תמונה למתכון
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: "לא נבחר קובץ להעלאה" }
      });
    }

    // בניית URL לתמונה
    const imageUrl = `/uploads/recipes/${req.file.filename}`;
    
    res.status(200).json({
      message: "התמונה הועלתה בהצלחה",
      imageUrl: imageUrl,
      fileName: req.file.filename,
      fileSize: req.file.size,
      uploadedBy: req.user.username
    });
    
  } catch (err) {
    res.status(500).json({
      error: { message: "שגיאה בהעלאת התמונה", detail: err.message }
    });
  }
};

// 🆕 קבלת כל התמונות שהמשתמש העלה
exports.getUserImages = async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(__dirname, '../uploads/recipes');
    
    // קריאת כל הקבצים בתיקייה
    const files = fs.readdirSync(uploadsDir);
    
    const images = files
      .filter(file => file.includes('-')) // רק קבצים עם הפורמט שלנו
      .map(file => ({
        filename: file,
        url: `/uploads/recipes/${file}`,
        uploadDate: new Date(parseInt(file.split('-')[0]))
      }))
      .sort((a, b) => b.uploadDate - a.uploadDate); // החדשים ראשון
    
    res.json({
      images,
      count: images.length
    });
    
  } catch (err) {
    res.status(500).json({
      error: { message: "שגיאה בקבלת התמונות", detail: err.message }
    });
  }
};