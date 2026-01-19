const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/add', authenticate, wishlistController.addToWishlist);
router.delete('/:id', authenticate, validateUUID, wishlistController.removeFromWishlist);

module.exports = router;

