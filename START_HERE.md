# 🚀 Recipe App - Quick Start Guide

## 📁 Project Structure
```
APP_NODE/
├── server-repice/          # Backend API Server (Node.js + Express + MongoDB)
└── recipe-client/          # Frontend Client (Angular 17)
```

## ⚡ Quick Start (2 Steps)

### Step 1: Start the Backend Server
```bash
cd server-repice
npm install
npm start
```
✅ Server will run on: `http://localhost:3000`

### Step 2: Start the Frontend Client
```bash
cd recipe-client
npm install
npm start
```
✅ Client will run on: `http://localhost:4200`

## 🌐 Open Your Browser
Navigate to: **http://localhost:4200**

## 🎯 What You'll See

### 🏠 Home Page
- Beautiful welcome page with gradient design
- "Explore Recipes" and "Join Community" buttons
- Feature highlights

### 🔐 Authentication
- **Register**: Create new account (username, email, password, address)
- **Login**: Sign in with email and password
- Automatic JWT token management

### 🍽️ Recipe Features
- **Browse All Recipes**: Search, filter by category/prep time
- **Recipe Details**: Full recipe view with ingredients and instructions
- **My Recipes**: Personal recipe collection (requires login)
- **Add Recipe**: Create new recipes with image upload (requires login)
- **Edit/Delete**: Manage your recipes (requires login)

## 📱 Responsive Design
Works perfectly on:
- 📱 Mobile phones
- 📱 Tablets  
- 💻 Desktop computers

## 🎨 UI Features
- Modern gradient design
- Smooth animations
- Bootstrap Icons
- Loading states
- Error handling
- Mobile-first responsive layout

## 🔧 Default Configuration
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:4200
- **Database**: MongoDB (configured in backend)
- **Email**: Gmail SMTP (configured in backend)

## 📋 API Endpoints Available

### Users
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `PATCH /users/update-password` - Change password

### Recipes
- `GET /recipes` - Get all recipes
- `GET /recipes/my-recipes` - Get user's recipes
- `GET /recipes/:id` - Get recipe by ID
- `POST /recipes` - Create new recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe
- `POST /recipes/upload-image` - Upload recipe image

### Categories
- `GET /categories` - Get all categories
- `GET /categories/with-recipes` - Get categories with recipes

## 🛠️ Troubleshooting

**Port Already in Use?**
```bash
# For backend (change port in app.js)
# For frontend
ng serve --port 4201
```

**CORS Issues?**
- Make sure both servers are running
- Check API URL in `recipe-client/src/environments/environment.ts`

**Dependencies Issues?**
```bash
# In each directory
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation
- **Backend**: See `server-repice/README.md`
- **Frontend**: See `recipe-client/README.md`
- **Setup Guide**: See `recipe-client/SETUP.md`

## 🎉 You're Ready!
1. ✅ Start backend server
2. ✅ Start frontend client  
3. ✅ Open http://localhost:4200
4. 🍳 Start cooking with recipes!

---
**Happy Coding & Cooking! 🍲**