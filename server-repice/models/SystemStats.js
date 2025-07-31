const mongoose = require("mongoose");

/**
 * סכימת הנתונים של סטטיסטיקות מערכת.
 * totalCategories - מספר הקטגוריות הכולל במערכת, ברירת מחדל היא 0.
 */
const systemStatsSchema = new mongoose.Schema({
  /**
   * מספר הקטגוריות הכולל במערכת.
   * @type {Number}
   * @default 0
   */
  totalCategories: { type: Number, default: 0 }
});

module.exports = mongoose.model("SystemStats", systemStatsSchema);
