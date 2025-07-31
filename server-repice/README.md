
# 🍲 פרויקט מתכונים – תיעוד API

שרת מבוסס Node.js, Express ו־MongoDB לניהול משתמשים, מתכונים וקטגוריות.
כולל הרשמה, התחברות, הרשאות JWT, אימות עם Joi, העלאת תמונה ושליחת מייל ברוך הבא.

---

## 👤 משתמשים (Users)

🔹 **POST /users/register**  
- תיאור: הרשמה של משתמש חדש  
- שדות נדרשים: username, email, password, address  
- הרשאות: פתוח (אורח)  
- תוצאה: יצירת משתמש ושליחת מייל מעוצב לג’ימייל

🔹 **POST /users/login**  
- תיאור: התחברות של משתמש  
- שדות: email, password  
- הרשאות: פתוח (אורח)  
- תוצאה: החזרת טוקן JWT

🔹 **PATCH /users/update-password**  
- תיאור: שינוי סיסמה  
- שדות: newPassword  
- הרשאות: משתמש מחובר

🔹 **GET /users**  
- תיאור: שליפת כל המשתמשים  
- הרשאות: מנהל בלבד

🔹 **DELETE /users/:id**  
- תיאור: מחיקת משתמש לפי מזהה  
- הרשאות: מנהל בלבד

---

## 📒 מתכונים (Recipes)

🔹 **GET /recipes**  
- תיאור: שליפת כל המתכונים  
- פרמטרים אופציונליים: search, limit, page  
- הרשאות: פתוח לכולם

🔹 **GET /recipes/my-recipes**  
- תיאור: מתכונים של המשתמש המחובר  
- הרשאות: משתמש

🔹 **GET /recipes/:id**  
- תיאור: קבלת מתכון לפי מזהה  
- הרשאות: כולם

🔹 **GET /recipes/prep-time?maxMinutes=30**  
- תיאור: קבלת מתכונים לפי זמן הכנה  
- הרשאות: כולם

🔹 **GET /recipes/by-category/:name**  
- תיאור: קבלת מתכונים לפי קטגוריה  
- הרשאות: כולם

🔹 **POST /recipes**  
- תיאור: הוספת מתכון חדש  
- שדות: title, description, category, preparationTime, difficultyLevel, layers[], instructions  
- הרשאות: משתמש

🔹 **PUT /recipes/:id**  
- תיאור: עדכון מתכון  
- הרשאות: משתמש

🔹 **DELETE /recipes/:id**  
- תיאור: מחיקת מתכון  
- הרשאות: משתמש

🔹 **POST /recipes/upload-image**  
- תיאור: העלאת תמונה עם Multer  
- הרשאות: משתמש

---

## 🏷️ קטגוריות (Categories)

🔹 **GET /categories**  
- תיאור: קבלת כל הקטגוריות  
- הרשאות: כולם

🔹 **GET /categories/with-recipes**  
- תיאור: כל הקטגוריות כולל המתכונים בהן  
- הרשאות: כולם

🔹 **GET /categories/by-code/:code**  
- תיאור: קבלת קטגוריה לפי קוד  
- הרשאות: כולם

🔹 **GET /categories/by-name/:name**  
- תיאור: קבלת קטגוריה לפי שם  
- הרשאות: כולם

🔹 **POST /categories**  
- תיאור: הוספת קטגוריה  
- שדות: code, name, description  
- הרשאות: מנהל

🔹 **PUT /categories/:id**  
- תיאור: עדכון קטגוריה  
- הרשאות: מנהל

🔹 **DELETE /categories/:id**  
- תיאור: מחיקת קטגוריה  
- הרשאות: מנהל

---

## ✉️ שליחת מייל

- מתבצעת אוטומטית לאחר הרשמה
- נשלחת ל־Gmail דרך SMTP עם עיצוב HTML בעברית
- תוכן המייל: ברוך הבא, הסבר קצר וכפתור כניסה

---

## ✅ בונוסים שבוצעו

- ✅ שליחת מייל אמיתי עם App Password של Gmail
- ✅ מייל מעוצב ב־HTML, כולל RTL
- ✅ טיפול בשגיאת אימייל כפול עם הודעה מותאמת
- ✅ העלאת תמונה דרך Multer
