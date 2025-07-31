# 🚀 Recipe Client Setup Guide

## Quick Start

### 1. Prerequisites
Make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Angular CLI** (optional but recommended)

### 2. Install Angular CLI (if not installed)
```bash
npm install -g @angular/cli
```

### 3. Install Dependencies
```bash
cd recipe-client
npm install
```

### 4. Start the Development Server
```bash
npm start
# or
ng serve
```

### 5. Open Your Browser
Navigate to: `http://localhost:4200`

## 🔧 Configuration

### API Server Configuration
1. Make sure your Recipe API server is running on `http://localhost:3000`
2. If your server runs on a different port, update the environment files:

**src/environments/environment.ts** (for development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:YOUR_PORT'  // Change YOUR_PORT to your server port
};
```

## 📱 Features Overview

### 🏠 Home Page
- Welcome section with call-to-action buttons
- Feature highlights
- Navigation to recipes and registration

### 🔐 Authentication
- **Register**: Create a new account
- **Login**: Sign in to existing account
- **Auto-redirect**: Logged-in users are redirected appropriately

### 🍽️ Recipe Management
- **Browse Recipes**: View all available recipes
- **Search & Filter**: Find recipes by name, category, or prep time
- **Recipe Details**: View full recipe information
- **My Recipes**: Manage your personal recipes
- **Add/Edit Recipe**: Create and modify recipes
- **Image Upload**: Add photos to your recipes

### 🎨 UI Features
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Modern UI**: Beautiful gradients and animations
- **Bootstrap Icons**: Consistent iconography
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Build and watch for changes
npm run watch

# Run tests
npm test

# Lint code
ng lint

# Generate new component
ng generate component component-name

# Generate new service
ng generate service service-name
```

## 📁 Project Structure

```
recipe-client/
├── src/
│   ├── app/
│   │   ├── components/          # All UI components
│   │   │   ├── auth/            # Login & Register
│   │   │   ├── layout/          # Navbar & Home
│   │   │   └── recipes/         # Recipe components
│   │   ├── services/            # API services
│   │   ├── models/              # TypeScript interfaces
│   │   ├── guards/              # Route protection
│   │   └── interceptors/        # HTTP interceptors
│   ├── environments/            # Environment configs
│   ├── assets/                  # Static files
│   └── styles.scss             # Global styles
├── README.md                   # Detailed documentation
├── SETUP.md                    # This file
└── package.json               # Dependencies
```

## 🔍 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# If port 4200 is busy, use a different port
ng serve --port 4201
```

**2. CORS Errors**
- Make sure your API server has CORS enabled
- Check that the API URL in environment.ts is correct

**3. Module Not Found Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. Build Errors**
```bash
# Clear Angular cache
ng cache clean
```

### API Connection Issues

**Check API Server Status:**
1. Make sure your Recipe API server is running
2. Test API endpoints manually:
   ```bash
   curl http://localhost:3000/recipes
   ```

**Update API URL:**
If your server runs on a different port, update:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

## 🌐 Browser Support

- **Chrome** (recommended)
- **Firefox**
- **Safari**
- **Edge**
- **Mobile browsers**

## 📦 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Web Server
1. Copy contents of `dist/recipe-client/` to your web server
2. Configure server to serve `index.html` for all routes (SPA routing)
3. Update `environment.prod.ts` with your production API URL

### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist/recipe-client;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🎯 Next Steps

1. **Start the API Server** (from the server-recipe directory)
2. **Start the Angular Client** (this project)
3. **Open your browser** to `http://localhost:4200`
4. **Register a new account** or login
5. **Start exploring recipes!**

## 📞 Support

If you encounter any issues:
1. Check this troubleshooting guide
2. Verify your API server is running
3. Check browser console for errors
4. Ensure all dependencies are installed

Happy cooking! 🍳