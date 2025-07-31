require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path"); // 🆕

const app = express();

// 🛡️ אבטחה
app.use(helmet());

// 🧩 Middleware
app.use(cors());
app.use(express.json());

// 🖼️ הגשת קבצים סטטיים (תמונות) - 🆕
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔗 חיבור למסלולים
const userRoutes = require("./routes/users");
const recipeRoutes = require("./routes/recipes");
const categoryRoutes = require("./routes/categoryRoutes");

app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);

// 🗄️ חיבור למסד נתונים
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 🔍 ברירת מחדל לשורש
app.get("/", (req, res) => {
  res.json({ message: "🍽️ API is up and running", timestamp: new Date() });
});

// 🧭 טיפול בנתיבים לא קיימים
app.use("*", (req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      availableRoutes: [
        "/users/test",
        "/users/register",
        "/users/login",
        "/recipes",
        "/recipes/upload-image",
        "/recipes/:id",
        "/categories"
      ]
    }
  });
});

// ❌ טיפול בשגיאות כלליות
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  res.status(500).json({
    error: {
      message: err.message || "Something went wrong!",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    }
  });
});

// 🚀 הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
  console.log(`📁 Static files served at: http://localhost:${PORT}/uploads`); // 🆕
});

module.exports = app;