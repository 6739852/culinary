// middleware/errorHandler.js

// Error handler middleware - פורמט נדרש: { error: { message: '...' } }
/**
 * Handles errors thrown in the application.
 * @param {Error} err - The error object thrown.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * 
 * מדפיס את הודעת השגיאה ל-console.
 * בודק אם מדובר בשגיאת ולידציה של Mongoose, ומחזיר הודעה מתאימה עם קוד 400.
 * בודק אם מדובר בשגיאת מפתח כפול (duplicate key) של MongoDB, ומחזיר הודעה מתאימה עם קוד 409.
 * בודק אם מדובר בשגיאת JWT (טוקן לא תקין או שפג תוקף), ומחזיר הודעה מתאימה עם קוד 401.
 * אם לא זוהתה שגיאה מיוחדת, מחזיר שגיאה כללית עם קוד 500 או קוד מותאם מהשגיאה.
 * במצב פיתוח (development) מחזיר גם את ה-stack של השגיאה.
 */
exports.errorHandler = (err, req, res, next) => {
  // ...
};

// 404 handler for routes not found
/**
 * Handles requests to routes that do not exist.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * 
 * מחזיר קוד 404 עם הודעה שהנתיב לא נמצא, ורשימה של נתיבים זמינים במערכת.
 */
exports.notFoundHandler = (req, res) => {
  // ...
};
