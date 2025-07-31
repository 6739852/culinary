const Recipe = require("../models/Recipe");
const Category = require("../models/Category");

exports.syncCategoryRecipeCounts = async () => {
  const categories = await Category.find();

  for (const category of categories) {
    const count = await Recipe.countDocuments({ category: category.name });
    await Category.findByIdAndUpdate(category._id, { recipeCount: count });
  }
};
