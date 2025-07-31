const Joi = require("joi");

/**
 * סכמת ולידציה לרישום משתמש חדש.
 * 
 * שדות:
 * - username: שם משתמש (מחרוזת באורך 2–30 תווים, חובה)
 * - email: כתובת מייל תקינה (חובה)
 * - password: סיסמה (לפחות 6 תווים, חייבת לכלול אות קטנה, אות גדולה ומספר – חובה)
 * - address: כתובת מגורים (מחרוזת באורך 5–100 תווים, חובה)
 * - role: תפקיד המשתמש (יכול להיות "user", "admin", או "guest", לא חובה)
 */
const userRegisterSchema = Joi.object({
  username: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }),
  address: Joi.string().min(5).max(100).required(), // 🆕 חסר!
  role: Joi.string().valid("user", "admin", "guest").optional()
});

/**
 * סכמת ולידציה להתחברות משתמש.
 * 
 * שדות:
 * - email: כתובת מייל תקינה (חובה)
 * - password: סיסמה (חובה)
 */
const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * סכמת ולידציה לעדכון סיסמה.
 * 
 * שדות:
 * - newPassword: סיסמה חדשה (לפחות 6 תווים, כוללת אות קטנה, אות גדולה ומספר – חובה)
 */
const passwordUpdateSchema = Joi.object({
  newPassword: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    })
});

module.exports = {
  userRegisterSchema,
  userLoginSchema,
  passwordUpdateSchema
};
