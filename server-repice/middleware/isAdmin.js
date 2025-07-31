exports.isAdmin = (req, res, next) => {
  /**
   * בודק אם למשתמש יש הרשאת אדמין.
   * אם למשתמש אין תפקיד "admin", מוחזר קוד שגיאה 403 עם הודעה מתאימה.
   * אחרת, ממשיך למידלוור הבא.
   *
   * @param {Object} req - אובייקט הבקשה של אקספרס, מצופה להכיל את המשתמש ב-req.user.
   * @param {Object} res - אובייקט התגובה של אקספרס.
   * @param {Function} next - פונקציה שמעבירה את הבקשה למידלוור הבא.
   */
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: { message: "Admin access only" } });
  }
  next();
};
