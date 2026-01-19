const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate, requireRole } = require('../middleware/auth');

// Upload single image (admin only)
router.post('/image', authenticate, requireRole('admin'), uploadController.uploadImage);

// Upload multiple images (admin only)
router.post('/images', authenticate, requireRole('admin'), uploadController.uploadMultipleImages);

module.exports = router;

