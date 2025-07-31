const Joi = require("joi");

/**
 * סכמה לשכבת מתכון בודדת (layer)
 * כוללת:
 * - description: תיאור של השכבה (שדה טקסט חובה באורך 1–200 תווים)
 * - ingredients: מערך מרכיבים (לפחות אחד, כל אחד מחרוזת באורך מינימלי 1)
 */
const layerSchema = Joi.object({
  description: Joi.string().min(1).max(200).required(),
  ingredients: Joi.array().items(Joi.string().min(1)).min(1).required()
});

/**
 * סכמה מלאה למתכון חדש (recipe)
 * כוללת:
 * - title: כותרת המתכון (2–100 תווים)
 * - description: תיאור ארוך של המתכון (10–500 תווים)
 * - ingredients: רשימת מרכיבים (לפחות מרכיב אחד)
 * - steps: שלבי הכנה (לפחות שלב אחד)
 * - preparationTime: זמן הכנה בדקות (בין 1 ל־1440)
 * - difficulty: רמת קושי בין 1 ל־5
 * - imageUrl: כתובת URL לתמונה (לא חובה)
 * - isPrivate: האם המתכון פרטי (לא חובה)
 * - category: קטגוריה (2–50 תווים)
 * - layers: רשימת שכבות (אופציונלי), כל שכבה לפי layerSchema
 * - tags: תגיות (מילים באורך 1–30 תווים כל אחת, אופציונלי)
 */
const recipeSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  ingredients: Joi.array().items(Joi.string().min(1)).min(1).required(),
  steps: Joi.array().items(Joi.string().min(1)).min(1).required(),
  preparationTime: Joi.number().min(1).max(1440).required(), // עד 24 שעות
  difficulty: Joi.number().min(1).max(5).required(),
  imageUrl: Joi.string().uri().optional(),
  isPrivate: Joi.boolean().optional(),
  category: Joi.string().min(2).max(50).required(),
  layers: Joi.array().items(layerSchema).optional(),
  tags: Joi.array().items(Joi.string().min(1).max(30)).optional()
});

/**
 * סכמה לעדכון מתכון קיים (recipe update)
 * כמו recipeSchema אך כל השדות החשובים הם אופציונליים:
 * - מאפשר לעדכן כל שדה בנפרד מבלי לשלוח את כולם
 */
const recipeUpdateSchema = recipeSchema.fork(
  ['title', 'description', 'ingredients', 'steps', 'preparationTime', 'difficulty', 'category'],
  (schema) => schema.optional()
);

module.exports = {
  recipeSchema,
  recipeUpdateSchema
};
