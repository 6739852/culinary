# 🍲 Recipe App - Full Stack Application

A modern, full-stack recipe management application built with Node.js, Express, MongoDB, and Angular.

## 🏗️ Project Structure

```
recipe-app/
├── server-repice/          # Backend API Server
│   ├── Node.js + Express
│   ├── MongoDB Database
│   ├── JWT Authentication
│   ├── Image Upload (Multer)
│   └── Email Service (Gmail SMTP)
└── recipe-client/          # Frontend Client
    ├── Angular 17
    ├── Responsive Design
    ├── Modern UI/UX
    └── Bootstrap Icons
```

## ⚡ Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### 1. Start Backend Server
```bash
cd server-repice
npm install
npm start
```
Server runs on: `http://localhost:3000`

### 2. Start Frontend Client
```bash
cd recipe-client
npm install
npm start
```
Client runs on: `http://localhost:4200`

### 3. Open Application
Navigate to: **http://localhost:4200**

## 🎯 Features

### 🔐 Authentication
- User registration with email verification
- JWT-based authentication
- Password management
- Role-based access control

### 🍽️ Recipe Management
- Browse and search recipes
- Create, edit, and delete recipes
- Image upload for recipes
- Category-based organization
- Difficulty levels and prep time
- Personal recipe collections

### 👤 User Features
- User profiles
- Personal recipe management
- Recipe sharing
- Responsive design for all devices

### 📧 Email Integration
- Welcome emails for new users
- HTML-formatted emails
- Gmail SMTP integration

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload
- **Nodemailer** - Email service
- **Joi** - Validation
- **bcrypt** - Password hashing

### Frontend
- **Angular 17** - Framework
- **TypeScript** - Language
- **SCSS** - Styling
- **Bootstrap Icons** - Icons
- **RxJS** - Reactive programming
- **Angular Material** - UI components

## 📱 Responsive Design

Works perfectly on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1200px+)

## 🔧 Configuration

### Backend Environment Variables
Create `.env` file in `server-repice/`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/recipe-db
JWT_SECRET=your-secret-key
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Environment
Update `recipe-client/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `PATCH /users/update-password` - Password update
- `GET /users` - Get all users (admin)
- `DELETE /users/:id` - Delete user (admin)

### Recipe Endpoints
- `GET /recipes` - Get all recipes
- `GET /recipes/my-recipes` - Get user's recipes
- `GET /recipes/:id` - Get recipe by ID
- `GET /recipes/prep-time?maxMinutes=30` - Filter by prep time
- `GET /recipes/by-category/:name` - Filter by category
- `POST /recipes` - Create recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe
- `POST /recipes/upload-image` - Upload recipe image

### Category Endpoints
- `GET /categories` - Get all categories
- `GET /categories/with-recipes` - Get categories with recipes
- `GET /categories/by-code/:code` - Get category by code
- `GET /categories/by-name/:name` - Get category by name
- `POST /categories` - Create category (admin)
- `PUT /categories/:id` - Update category (admin)
- `DELETE /categories/:id` - Delete category (admin)

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build for production: `ng build --configuration production`
2. Deploy `dist/` folder to web server
3. Configure server for SPA routing

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation with Joi
- CORS configuration
- File upload restrictions
- SQL injection prevention
- XSS protection

## 🎨 UI/UX Features

- Modern gradient design
- Smooth animations and transitions
- Loading states and error handling
- Mobile-first responsive layout
- Intuitive navigation
- Search and filter functionality
- Image optimization

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Check the documentation in each directory
- Review the API endpoints
- Ensure all dependencies are installed
- Verify environment configuration

---

**Built with ❤️ using Node.js, Express, MongoDB, and Angular**