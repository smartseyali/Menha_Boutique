# Thandatti Foods Backend API

Backend API for Thandatti Foods e-commerce application built with Node.js, Express, and PostgreSQL.

## Features

- User authentication with JWT
- Product management (CRUD operations)
- Category management
- Shopping cart
- Wishlist
- Order management
- Product reviews and ratings
- Blog management
- Coupon system
- Address management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pattikadai
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

CORS_ORIGIN=http://localhost:3000
```

3. Create PostgreSQL database:
```bash
createdb pattikadai
```

4. Run migrations:
```bash
npm run migrate:up
```

5. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with pagination, filtering)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:categoryId` - Get products by category
- `GET /api/products/search?q=` - Search products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `GET /api/categories/:id/products` - Get products by category
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)

### Orders
- `GET /api/orders` - Get user's orders (authenticated)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Cart
- `GET /api/cart` - Get user's cart (authenticated)
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Compare
- `GET /api/compare` - Get user's compare list
- `POST /api/compare/add` - Add to compare
- `DELETE /api/compare/:id` - Remove from compare

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review (authenticated)
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Blogs
- `GET /api/blogs` - Get all blogs (with pagination)
- `GET /api/blogs/:id` - Get single blog
- `GET /api/blogs/category/:category` - Get blogs by category
- `POST /api/blogs` - Create blog (admin only)
- `PUT /api/blogs/:id` - Update blog (admin only)

### Coupons
- `GET /api/coupons/validate/:code` - Validate coupon code
- `POST /api/coupons/apply` - Apply coupon to order

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

## Database Migrations

### Run migrations
```bash
npm run migrate:up
```

### Rollback migrations
```bash
npm run migrate:down
```

### Create new migration
```bash
npm run migrate:create migration_name
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── migrations/      # Database migrations
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
├── .env                 # Environment variables
├── database.json        # Migration configuration
├── package.json
└── server.js            # Entry point
```

## License

ISC

