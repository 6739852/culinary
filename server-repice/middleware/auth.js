const jwt = require("jsonwebtoken");

/**
 * Middleware function to verify JWT token from the Authorization header.
 * 
 * @param {import('express').Request} req - The incoming request object.
 * @param {import('express').Response} res - The outgoing response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * 
 * בתוך הפונקציה:
 * - בודק אם יש Authorization header בבקשה. אם לא, מחזיר סטטוס 401 עם הודעת שגיאה.
 * - אם יש, מפצל את ה-header כדי להוציא את הטוקן (החלק השני אחרי ה-"Bearer").
 * - מנסה לאמת את הטוקן בעזרת jwt.verify וה-secret שנמצא ב-JWT_SECRET.
 * - אם האימות מצליח, שומר את המידע של המשתמש (decoded) ב-request וממשיך למידלוור הבא.
 * - אם האימות נכשל, מחזיר סטטוס 403 עם הודעת שגיאה.
 */
exports.verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: { message: "No token provided" } });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: { message: "Invalid token" } });
  }
};
