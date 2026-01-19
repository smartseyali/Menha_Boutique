const Coupon = require('../models/Coupon');

async function validateCoupon(req, res, next) {
  try {
    const { code } = req.params;
    const { orderAmount } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const userId = req.userId || null;
    const amount = parseFloat(orderAmount) || 0;

    const validation = await Coupon.validate(code, userId, amount);

    if (!validation.valid) {
      return res.status(400).json({
        valid: false,
        message: validation.message,
      });
    }

    res.json({
      valid: true,
      coupon: validation.coupon,
      discountAmount: validation.discountAmount,
    });
  } catch (error) {
    next(error);
  }
}

async function applyCoupon(req, res, next) {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !orderAmount) {
      return res.status(400).json({ message: 'Coupon code and order amount are required' });
    }

    const userId = req.userId || null;
    const amount = parseFloat(orderAmount);

    const validation = await Coupon.validate(code, userId, amount);

    if (!validation.valid) {
      return res.status(400).json({
        valid: false,
        message: validation.message,
      });
    }

    res.json({
      valid: true,
      coupon: validation.coupon,
      discountAmount: validation.discountAmount,
      finalAmount: amount - validation.discountAmount,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validateCoupon,
  applyCoupon,
};

