const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { optionalAuth } = require('../middleware/auth');

router.get('/validate/:code', optionalAuth, couponController.validateCoupon);
router.post('/apply', optionalAuth, couponController.applyCoupon);

module.exports = router;

