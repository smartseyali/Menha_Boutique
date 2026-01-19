const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config/config');

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      config.cors.origin
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1 || config.server.env === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// URL-encoded middleware - skip for upload routes (they use multipart/form-data)
const urlencodedMiddleware = express.urlencoded({ extended: true });
app.use((req, res, next) => {
  // Skip URL-encoded parsing for upload routes (they use multipart/form-data)
  if (req.path.startsWith('/api/upload')) {
    return next();
  }
  urlencodedMiddleware(req, res, next);
});

// Webhook routes need raw body for signature verification
app.use('/api/payments/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use('/api/payments/webhook/phonepe', express.json());

// JSON middleware - but skip for upload routes (they use multipart/form-data)
const jsonMiddleware = express.json();
app.use((req, res, next) => {
  // Skip JSON parsing for upload routes (they use multipart/form-data)
  if (req.path.startsWith('/api/upload')) {
    return next();
  }
  jsonMiddleware(req, res, next);
});

// Serve static files from public folder (for uploaded images)
// Use express.static with options to handle URL-encoded paths and set proper headers
const staticOptions = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  index: false,
  lastModified: true,
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    // Set proper content type for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // Enable CORS for images
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
};

const fs = require('fs');
const publicAssetsPath = path.join(__dirname, '../public/assets');
const defaultImagePath = path.join(publicAssetsPath, 'img/product/default.jpg');

// Custom middleware to handle product images - serves files directly to handle URL encoding properly
app.use((req, res, next) => {
  // Only handle GET requests for product images
  if (req.method === 'GET' && req.path.startsWith('/assets/img/product/')) {
    const imageMatch = req.path.match(/^\/assets\/img\/product\/(.+)$/);
    if (imageMatch && /\.(jpg|jpeg|png|gif|webp)$/i.test(imageMatch[1])) {
      try {
        // Decode URL-encoded filename
        const filename = decodeURIComponent(imageMatch[1]);
        const requestedPath = path.join(publicAssetsPath, 'img/product', filename);
        
        // Determine content type based on file extension
        const getContentType = (filePath) => {
          const ext = path.extname(filePath).toLowerCase();
          if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
          if (ext === '.png') return 'image/png';
          if (ext === '.gif') return 'image/gif';
          if (ext === '.webp') return 'image/webp';
          return 'application/octet-stream';
        };
        
        // Check if requested file exists
        if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
          // File exists, serve it directly with proper headers
          res.setHeader('Content-Type', getContentType(requestedPath));
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
          return res.sendFile(requestedPath);
        } else {
          // File doesn't exist, serve default image
          if (fs.existsSync(defaultImagePath)) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.sendFile(defaultImagePath);
          }
        }
      } catch (error) {
        console.error('Error serving product image:', error);
        // On error, try to serve default image
        if (fs.existsSync(defaultImagePath)) {
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.sendFile(defaultImagePath);
        }
      }
    }
  }
  // Not a product image request, continue to next middleware
  next();
});

// Serve static files from public folder
app.use('/assets', express.static(publicAssetsPath, staticOptions));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/wishlist', require('./src/routes/wishlist'));
app.use('/api/compare', require('./src/routes/compare'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/blogs', require('./src/routes/blogs'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/addresses', require('./src/routes/addresses'));
app.use('/api/attribution', require('./src/routes/attribution'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/locations', require('./src/routes/locations'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/delivery', require('./src/routes/delivery'));
app.use('/api/banners', require('./src/routes/banners'));

// Error handling middleware
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

