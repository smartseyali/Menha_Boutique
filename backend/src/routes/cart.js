const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

router.get('/', authenticate, cartController.getCart);
router.post('/add', authenticate, cartController.addToCart);
router.put('/:id', authenticate, validateUUID, cartController.updateCartItem);
router.delete('/:id', authenticate, validateUUID, cartController.removeFromCart);
router.delete('/', authenticate, cartController.clearCart);

module.exports = router;

