# 🚀 Deployment Guide - Recipe App

## ✅ Pre-Deployment Checklist

### Backend Server (server-repice)
- [x] Fixed API routes (removed /api prefix)
- [x] Set default port to 3000
- [x] Dependencies installed successfully
- [x] Static file serving configured
- [x] CORS enabled for frontend

### Frontend Client (recipe-client)
- [x] Build successful (343.72 kB total)
- [x] Environment configuration ready
- [x] All components created and functional
- [x] Services configured for API calls

## 🔧 Configuration Updates Made

### Backend Changes
```javascript
// Fixed routes in app.js
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);

// Changed default port
const PORT = process.env.PORT || 3000;
```

### Environment Setup
```env
# server-repice/.env
PORT=3000
MONGO_URI=mongodb://localhost:27017/recipe-db
JWT_SECRET=your-secret-key
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

## 🚀 Quick Start Commands

### 1. Start Backend
```bash
cd server-repice
npm install
npm start
```

### 2. Start Frontend
```bash
cd recipe-client
npm install
npm start
```

### 3. Access Application
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## 📋 API Endpoints (Updated)

### Users
- POST /users/register
- POST /users/login
- PATCH /users/update-password
- GET /users (admin)
- DELETE /users/:id (admin)

### Recipes
- GET /recipes
- GET /recipes/my-recipes
- GET /recipes/:id
- POST /recipes
- PUT /recipes/:id
- DELETE /recipes/:id
- POST /recipes/upload-image

### Categories
- GET /categories
- GET /categories/with-recipes
- POST /categories (admin)
- PUT /categories/:id (admin)
- DELETE /categories/:id (admin)

## ✅ Testing Status

### Backend
- ✅ Dependencies installed (551 packages)
- ✅ Routes configured correctly
- ✅ Port set to 3000
- ✅ Static file serving enabled

### Frontend
- ✅ Build successful
- ✅ All components created
- ✅ Services configured
- ✅ Environment variables set

## 🔄 Next Steps

1. **Set up MongoDB database**
2. **Configure email service**
3. **Test full application flow**
4. **Deploy to production**

## 📝 Notes

- Frontend expects backend on port 3000
- All API calls use relative paths (no /api prefix)
- Image uploads served from /uploads directory
- JWT authentication implemented
- CORS enabled for cross-origin requests