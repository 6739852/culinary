const mongoose = require("mongoose");

/**
 * @typedef {Object} Category
 * @property {string} code - קוד ייחודי לקטגוריה (חובה, ייחודי)
 * @property {string} name - שם הקטגוריה (חובה)
 * @property {string} [description] - תיאור הקטגוריה (אופציונלי)
 * @property {number} [recipeCount=0] - מספר המתכונים בקטגוריה (ברירת מחדל: 0)
 * @property {mongoose.Types.ObjectId[]} [recipes] - מערך מזהים של מתכונים (אופציונלי)
 * @property {Date} createdAt - תאריך יצירת הקטגוריה (נוצר אוטומטית)
 * @property {Date} updatedAt - תאריך עדכון אחרון (נוצר אוטומטית)
 */
const categorySchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, // קוד הקטגוריה הוא שדה חובה
    unique: true    // קוד הקטגוריה חייב להיות ייחודי
  },
  name: { 
    type: String, 
    required: true // שם הקטגוריה הוא שדה חובה
  },
  description: { 
    type: String   // תיאור הקטגוריה (לא חובה)
  },
  recipeCount: { 
    type: Number, 
    default: 0     // מספר המתכונים בקטגוריה (ברירת מחדל: 0)
  },
  recipes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Recipe" // מערך מזהים של מתכונים (קשר ל-Recipe)
  }]
}, { 
  timestamps: true // מוסיף createdAt ו-updatedAt אוטומטית
});

module.exports = mongoose.model("Category", categorySchema);