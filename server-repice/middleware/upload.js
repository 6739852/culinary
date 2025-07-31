const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🔧 יצירת תיקיות אוטומטית
const createUploadDirs = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const recipesDir = path.join(__dirname, '../uploads/recipes');
  
  // בדיקה אם תיקיית uploads קיימת, אם לא - צור אותה
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('📁 Created uploads directory');
  }
  
  if (!fs.existsSync(recipesDir)) {
    fs.mkdirSync(recipesDir);
    console.log('📁 Created uploads/recipes directory');
  }
};

// יצירת התיקיות עכשיו
createUploadDirs();

// הגדרת אחסון
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const recipesDir = path.join(__dirname, '../uploads/recipes');
    
    // ודא שהתיקייה קיימת לפני שמירה
    if (!fs.existsSync(recipesDir)) {
      fs.mkdirSync(recipesDir, { recursive: true });
    }
    
    cb(null, recipesDir);
  },
  filename: (req, file, cb) => {
    // שם קובץ ייחודי וניקוי שם
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(cleanName);
    console.log(`📸 Saving image: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

// פילטר לסוגי קבצים
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('רק קבצי תמונה מותרים (JPEG, PNG, WebP)'), false);
  }
};

// הגדרת multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB מקסימום
  },
  fileFilter: fileFilter
});

// Middleware לטיפול בשגיאות
const handleMulterError = (err, req, res, next) => {
  console.error('❌ Multer Error:', err.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: { message: 'הקובץ גדול מדי. מקסימום 10MB' }
      });
    }
  }
  
  if (err.message.includes('רק קבצי תמונה מותרים')) {
    return res.status(400).json({
      error: { message: err.message }
    });
  }
  
  return res.status(500).json({
    error: { message: 'שגיאה בהעלאת הקובץ', detail: err.message }
  });
};

module.exports = {
  upload,
  handleMulterError
};