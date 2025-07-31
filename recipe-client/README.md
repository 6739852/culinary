# 🍲 Recipe Client - Angular Frontend

A modern, responsive Angular application for managing and sharing recipes. Built with Angular 17, featuring a beautiful UI with Bootstrap Icons and SCSS styling.

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Protected routes with guards
- Automatic token management

### 🍽️ Recipe Management
- Browse all recipes with search and filters
- View detailed recipe information
- Create and edit personal recipes
- Upload recipe images
- Filter by category and preparation time
- Difficulty level indicators

### 👤 User Features
- Personal recipe collection
- User profile management
- Password updates
- Responsive design for all devices

### 🎨 UI/UX
- Modern gradient design
- Smooth animations and transitions
- Mobile-first responsive layout
- Bootstrap Icons integration
- Loading states and error handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Angular CLI

### Installation

1. **Clone the repository**
   ```bash
   cd recipe-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/                 # Authentication components
│   │   │   ├── login.component.ts
│   │   │   └── register.component.ts
│   │   ├── layout/               # Layout components
│   │   │   ├── navbar.component.ts
│   │   │   └── home.component.ts
│   │   └── recipes/              # Recipe components
│   │       ├── recipe-list.component.ts
│   │       ├── recipe-detail.component.ts
│   │       ├── recipe-form.component.ts
│   │       └── my-recipes.component.ts
│   ├── guards/                   # Route guards
│   │   └── auth.guard.ts
│   ├── interceptors/             # HTTP interceptors
│   │   └── auth.interceptor.ts
│   ├── models/                   # TypeScript interfaces
│   │   ├── user.model.ts
│   │   ├── recipe.model.ts
│   │   └── category.model.ts
│   ├── services/                 # Angular services
│   │   ├── auth.service.ts
│   │   ├── recipe.service.ts
│   │   └── category.service.ts
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/                       # Static assets
├── styles.scss                   # Global styles
└── index.html
```

## 🔧 Configuration

### API Endpoint
Update the API base URL in the services:
```typescript
// In auth.service.ts, recipe.service.ts, category.service.ts
private apiUrl = 'http://localhost:3000'; // Change to your server URL
```

### Environment Variables
Create environment files for different configurations:
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1200px+)

## 🎨 Styling

- **SCSS** for advanced styling features
- **Bootstrap Icons** for consistent iconography
- **CSS Grid & Flexbox** for responsive layouts
- **Custom animations** for smooth user experience
- **CSS Variables** for theme consistency

## 🔒 Security Features

- JWT token automatic inclusion in requests
- Route protection with guards
- Input validation and sanitization
- Secure authentication flow
- Error handling and user feedback

## 🚀 Build & Deployment

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration production
```

### Serve Production Build
```bash
ng serve --configuration production
```

## 📦 Dependencies

### Core Dependencies
- **@angular/core** - Angular framework
- **@angular/common** - Common Angular utilities
- **@angular/router** - Routing functionality
- **@angular/forms** - Reactive forms
- **@angular/animations** - Animation support

### UI Dependencies
- **@angular/material** - Material Design components
- **bootstrap-icons** - Icon library
- **bootstrap** - CSS framework

## 🤝 API Integration

The client integrates with the Recipe API server:

### Authentication Endpoints
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `PATCH /users/update-password` - Password update

### Recipe Endpoints
- `GET /recipes` - Get all recipes
- `GET /recipes/my-recipes` - Get user's recipes
- `GET /recipes/:id` - Get recipe by ID
- `POST /recipes` - Create new recipe
- `PUT /recipes/:id` - Update recipe
- `DELETE /recipes/:id` - Delete recipe
- `POST /recipes/upload-image` - Upload recipe image

### Category Endpoints
- `GET /categories` - Get all categories
- `GET /categories/with-recipes` - Get categories with recipes

## 🎯 Future Enhancements

- [ ] Recipe rating and reviews
- [ ] Social features (follow users, like recipes)
- [ ] Advanced search with multiple filters
- [ ] Recipe collections and favorites
- [ ] Meal planning features
- [ ] Shopping list generation
- [ ] Recipe sharing via social media
- [ ] Offline support with PWA
- [ ] Dark mode theme
- [ ] Multi-language support

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure the backend server has CORS enabled
   - Check API URL configuration

2. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify API endpoints

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Angular CLI version compatibility
   - Update dependencies

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Development

Built with ❤️ using Angular 17 and modern web technologies.

For questions or support, please refer to the API documentation or create an issue in the repository.