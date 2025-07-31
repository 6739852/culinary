const mongoose = require("mongoose");

/**
 * userSchema - סכמת משתמש עבור מסד הנתונים
 * 
 * @property {String} username - שם משתמש, חובה, מינימום 2 תווים
 * @property {String} email - כתובת אימייל, חובה, ייחודית, נשמרת באותיות קטנות
 * @property {String} password - סיסמה, חובה, מינימום 6 תווים
 * @property {String} address - כתובת מגורים של המשתמש, חובה
 * @property {String} role - תפקיד המשתמש, ברירת מחדל "user", אפשרויות: "user", "admin", "guest"
 * @property {Date} createdAt - תאריך יצירת המשתמש (נוצר אוטומטית)
 * @property {Date} updatedAt - תאריך עדכון אחרון של המשתמש (נוצר אוטומטית)
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 2 }, // שם משתמש - חובה, מינימום 2 תווים
  email: { type: String, required: true, unique: true, lowercase: true }, // אימייל - חובה, ייחודי, נשמר באותיות קטנות
  password: { type: String, required: true, minlength: 6 }, // סיסמה - חובה, מינימום 6 תווים
  address: { type: String, required: true }, // כתובת מגורים - חובה
  role: { type: String, default: "user", enum: ["user", "admin", "guest"] } // תפקיד - ברירת מחדל "user", אפשרויות: "user", "admin", "guest"
}, { timestamps: true }); // מוסיף שדות createdAt ו-updatedAt אוטומטית

module.exports = mongoose.model("User", userSchema);