const SystemStats = require("../models/SystemStats");
const Category = require("../models/Category");

/**
 * @function
 * @description
 * פונקציה זו מחשבת את מספר הקטגוריות הקיימות במסד הנתונים
 * ושומרת את המספר הזה בשדה totalCategories במסמך SystemStats.
 * 
 * await Category.countDocuments();
 * // סופר את כל המסמכים (קטגוריות) במסד הנתונים
 * 
 * await SystemStats.findOneAndUpdate(
 *   {},
 *   { totalCategories: count },
 *   { upsert: true, new: true }
 * );
 * // מעדכן או יוצר (אם לא קיים) מסמך SystemStats עם המספר החדש של הקטגוריות
 */
exports.updateTotalCategories = async () => {
  const count = await Category.countDocuments();
  await SystemStats.findOneAndUpdate(
    {},
    { totalCategories: count },
    { upsert: true, new: true }
  );
};
