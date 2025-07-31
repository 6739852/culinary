const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const { verifyToken } = require("../middleware/auth");
const { upload, handleMulterError } = require("../middleware/upload"); // 🆕

// ✅ Routes ציבוריים
router.get("/", recipeController.getAllRecipes);
router.get("/prep-time", recipeController.getRecipesByPrepTime);
router.get("/by-category/:categoryName", recipeController.getRecipesByCategory);

// 🆕 Route להעלאת תמונה (צריך אימות)
router.post("/upload-image", verifyToken, upload.single('image'), recipeController.uploadImage, handleMulterError);

// ✅ Routes שדורשים אימות
router.post("/", verifyToken, recipeController.createRecipe);
router.get("/my-recipes", verifyToken, recipeController.getMyRecipes);

// ✅ Routes עם :id אחרונים
router.get("/:id", recipeController.getRecipeById);
router.put("/:id", verifyToken, recipeController.updateRecipe);
router.delete("/:id", verifyToken, recipeController.deleteRecipe);

module.exports = router;