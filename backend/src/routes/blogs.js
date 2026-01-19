const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

router.get('/', optionalAuth, blogController.getAllBlogs);
router.get('/category/:category', optionalAuth, blogController.getBlogsByCategory);
router.get('/:id', optionalAuth, validateUUID, blogController.getBlogById);
router.post('/', authenticate, requireRole('admin'), blogController.createBlog);
router.put('/:id', authenticate, requireRole('admin'), validateUUID, blogController.updateBlog);

module.exports = router;

