const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const { userRegisterSchema, userLoginSchema, passwordUpdateSchema } = require("../validations/userValidation");
const sendEmail = require("../utils/sendEmail");

exports.testRoute = (req, res) => {
  res.send("✅ users route is working!");
};

// 🆕 הרשמה עם validation מלא כולל כתובת



exports.registerUser = async (req, res) => {
  const { error } = userRegisterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: { message: error.details[0].message }
    });
  }

  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const newUser = new UserModel({ 
      ...req.body, 
      password: hashedPass 
    });
   await newUser.save();

// ✅ שליחת מייל ברוך הבא עם HTML
await sendEmail(
  newUser.email,
  "ברוך הבא ל-Recipe App",
  `שלום ${newUser.username}, ברוך הבא!`,
  `
  <div dir="rtl" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #2f855a; text-align: center;">שלום ${newUser.username} 👋</h2>
      <p style="font-size: 16px; text-align: center;">ברוך הבא לאפליקציית המתכונים שלנו!</p>
      <p style="font-size: 15px; text-align: center;">תוכל עכשיו לגלוש, לשמור ולשתף מתכונים טעימים 🍽️</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="http://localhost:4200" style="background-color: #38a169; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px;">
          היכנס עכשיו לאתר
        </a>
      </div>
      <p style="margin-top: 40px; font-size: 12px; color: #777; text-align: center;">
        אם לא ביקשת להצטרף – פשוט התעלם מהמייל הזה.
      </p>
    </div>
  </div>
  `
);



    res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
      username: newUser.username
    });

  } catch (err) {
    // בדיקת שגיאה מסוג E11000 = duplicate key במונגו
    if (err.code === 11000) {
      return res.status(409).json({
        error: {
          message: "Email already exists",
          detail: err.message
        }
      });
    }

    // שגיאה כללית
    res.status(500).json({
      error: {
        message: "Registration failed",
        detail: err.message
      }
    });
  }
};



// התחברות עם validation
exports.loginUser = async (req, res) => {
  const { error } = userLoginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: { message: error.details[0].message } });

  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ error: { message: "Invalid email or password" } });

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(401).json({ error: { message: "Invalid email or password" } });

    const token = jwt.sign(
      { _id: user._id, role: user.role, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: { message: "Login failed", detail: err.message } });
  }
};

// קבלת כל המשתמשים (מנהל בלבד)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.json({
      users,
      count: users.length
    });
  } catch (err) {
    res.status(500).json({ error: { message: "Failed to get users", detail: err.message } });
  }
};

// מחיקת משתמש (מנהל בלבד)
exports.deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: { message: "User not found" } });
    res.json({ message: "User deleted successfully", deletedUser: user.username });
  } catch (err) {
    res.status(500).json({ error: { message: "Delete failed", detail: err.message } });
  }
};

// עדכון סיסמא עם validation
exports.updatePassword = async (req, res) => {
  const { error } = passwordUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: { message: error.details[0].message } });
  }

  try {
    const hashed = await bcrypt.hash(req.body.newPassword, 10);
    await UserModel.findByIdAndUpdate(req.user._id, { password: hashed });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: { message: "Password update failed", detail: err.message } });
  }
};