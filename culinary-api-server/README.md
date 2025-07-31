# 🍽️ Culinary API Server

A professional-grade RESTful API for culinary recipe management, built with Node.js, Express, and MongoDB. This comprehensive system provides advanced features for recipe creation, user management, and culinary content organization.

## 🚀 Features

### Core Functionality
- **User Management**: Advanced user profiles with authentication, authorization, and role-based access control
- **Recipe Management**: Comprehensive recipe CRUD operations with rich metadata
- **Category System**: Hierarchical recipe categorization and organization
- **Media Management**: Professional image and video upload handling
- **Search & Filtering**: Advanced search capabilities with multiple filter options

### Advanced Features
- **Nutritional Analysis**: Detailed nutritional information tracking
- **Rating & Review System**: User-generated ratings and reviews
- **Social Features**: Recipe bookmarking, likes, and sharing
- **Multi-language Support**: Internationalization ready
- **Professional Logging**: Structured logging with Winston
- **Security**: JWT authentication, rate limiting, input validation
- **Performance**: Database indexing, query optimization, compression

## 🛠️ Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi & Express Validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd culinary-api-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env file
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload profile image
- `GET /api/users/:id/recipes` - Get user's recipes

### Recipes
- `GET /api/recipes` - Get all recipes (with filtering)
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/:id/rate` - Rate a recipe
- `POST /api/recipes/:id/bookmark` - Bookmark recipe

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

## 🔒 Authentication & Authorization

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **User**: Basic recipe management and interaction
- **Chef**: Enhanced recipe features and verification
- **Moderator**: Content moderation capabilities
- **Admin**: Full system administration

## 📊 Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: Enum ['user', 'chef', 'admin', 'moderator'],
  profileImage: String,
  bio: String,
  location: Object,
  preferences: Object,
  stats: Object
}
```

### Recipe Model
```javascript
{
  title: String,
  description: String,
  ingredients: [IngredientSchema],
  instructions: [InstructionSchema],
  images: [ImageSchema],
  prepTime: Number,
  cookTime: Number,
  difficulty: Enum,
  servings: Number,
  category: ObjectId,
  cuisine: String,
  nutrition: NutritionSchema,
  ratings: [RatingSchema],
  author: ObjectId
}
```

## 🔍 Query Parameters

### Recipe Filtering
- `search` - Text search in title and description
- `category` - Filter by category ID
- `cuisine` - Filter by cuisine type
- `difficulty` - Filter by difficulty level
- `maxPrepTime` - Maximum preparation time
- `dietary` - Dietary restrictions filter
- `sort` - Sort by: `newest`, `oldest`, `rating`, `popular`
- `page` - Page number for pagination
- `limit` - Items per page

Example:
```
GET /api/recipes?search=pasta&cuisine=italian&difficulty=beginner&sort=rating&page=1&limit=10
```

## 📝 Request/Response Examples

### Create Recipe
```javascript
POST /api/recipes
Content-Type: application/json
Authorization: Bearer <token>

{
  \"title\": \"Classic Spaghetti Carbonara\",
  \"description\": \"Authentic Italian pasta dish with eggs, cheese, and pancetta\",
  \"ingredients\": [
    {
      \"name\": \"Spaghetti\",
      \"quantity\": 400,
      \"unit\": \"g\"
    },
    {
      \"name\": \"Pancetta\",
      \"quantity\": 150,
      \"unit\": \"g\"
    }
  ],
  \"instructions\": [
    {
      \"stepNumber\": 1,
      \"description\": \"Bring a large pot of salted water to boil\"
    }
  ],
  \"prepTime\": 15,
  \"cookTime\": 20,
  \"difficulty\": \"intermediate\",
  \"servings\": 4,
  \"cuisine\": \"italian\"
}
```

## 🚦 Error Handling

The API returns consistent error responses:

```javascript
{
  \"success\": false,
  \"error\": {
    \"message\": \"Error description\",
    \"code\": 400
  },
  \"timestamp\": \"2024-01-01T12:00:00.000Z\"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options.

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation and sanitization
- CORS protection
- Security headers with Helmet
- Account lockout after failed attempts

## 📈 Performance Optimizations

- Database indexing for fast queries
- Response compression
- Image optimization
- Query result caching (Redis optional)
- Connection pooling
- Pagination for large datasets

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📚 API Documentation

Interactive API documentation is available at:
- Development: `http://localhost:8080/api-docs`
- Production: `https://your-domain.com/api-docs`

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t culinary-api .

# Run container
docker run -p 8080:8080 --env-file .env culinary-api
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secret
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure email service
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Create an issue on GitHub
- Email: support@culinaryapi.com
- Documentation: [API Docs](https://docs.culinaryapi.com)

## 🔄 Changelog

### Version 2.1.0
- Enhanced user management system
- Advanced recipe features
- Improved security measures
- Professional logging system
- Performance optimizations

---

**Built with ❤️ by the Professional Development Team**