// ייבוא ספריית express ליצירת ראוטרים
const express = require("express");
// יצירת ראוטר חדש
const router = express.Router();
// ייבוא קונטרולר המשתמשים שמכיל את הלוגיקה של הפעולות
const userController = require("../controllers/userController");
// ייבוא פונקציית אימות טוקן לבדיקה אם המשתמש מחובר
const { verifyToken } = require("../middleware/auth");
// ייבוא פונקציה שבודקת אם המשתמש הוא אדמין
const { isAdmin } = require("../middleware/isAdmin");


/**
 * בדיקת תקינות הראוטר - מחזיר תשובה לבדיקה שהראוטר עובד
 */
router.get("/test", userController.testRoute);

/**
 * רישום משתמש חדש למערכת
 */
router.post("/register", userController.registerUser);

/**
 * התחברות משתמש קיים למערכת
 */
router.post("/login", userController.loginUser);

// פעולות נוספות

/**
 * קבלת כל המשתמשים במערכת - רק למשתמשים עם הרשאת אדמין
 */
router.get("/", verifyToken, isAdmin, userController.getAllUsers);

/**
 * מחיקת משתמש לפי מזהה - רק למשתמשים עם הרשאת אדמין
 */
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);

/**
 * עדכון סיסמה למשתמש מחובר
 */
router.patch("/update-password", verifyToken, userController.updatePassword);

module.exports = router;