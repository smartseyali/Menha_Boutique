const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateReview, validateUUID } = require('../middleware/validation');

router.get('/product/:productId', optionalAuth, validateUUID, reviewController.getProductReviews);
router.post('/', authenticate, validateReview, reviewController.createReview);
router.put('/:id', authenticate, validateUUID, reviewController.updateReview);
router.delete('/:id', authenticate, validateUUID, reviewController.deleteReview);

module.exports = router;

