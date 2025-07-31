const mongoose = require("mongoose");

const layerSchema = new mongoose.Schema({
  description: { type: String, required: true },
  ingredients: [{ type: String, required: true }]
});

const recipeSchema = new mongoose.Schema({
  /**
   * The title of the recipe.
   * @type {String}
   * @required
   * @minlength 2
   */
  title: { type: String, required: true, minlength: 2 },

  /**
   * A detailed description of the recipe.
   * @type {String}
   * @required
   */
  description: { type: String, required: true },

  /**
   * List of ingredients required for the recipe.
   * @type {String[]}
   */
  ingredients: [{ type: String }],

  /**
   * Step-by-step instructions for preparing the recipe.
   * @type {String[]}
   */
  steps: [{ type: String }],

  /**
   * Preparation time in minutes.
   * @type {Number}
   * @required
   * @min 1
   */
  preparationTime: { type: Number, required: true, min: 1 },

  /**
   * Difficulty level of the recipe (1 to 5).
   * @type {Number}
   * @required
   * @min 1
   * @max 5
   */
  difficulty: { type: Number, required: true, min: 1, max: 5 },

  /**
   * URL of the recipe image.
   * @type {String}
   */
  imageUrl: { type: String },

  /**
   * Indicates if the recipe is private.
   * @type {Boolean}
   * @default false
   */
  isPrivate: { type: Boolean, default: false },

  /**
   * Category of the recipe (e.g., dessert, main course).
   * @type {String}
   * @required
   */
  category: { type: String, required: true },

  /**
   * Array of layers for layered recipes.
   * @type {layerSchema[]}
   */
  layers: [layerSchema],

  /**
   * Reference to the user who created the recipe.
   * @type {mongoose.Schema.Types.ObjectId}
   * @ref User
   * @required
   */
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  /**
   * Tags for searching and categorizing recipes.
   * @type {String[]}
   */
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);
