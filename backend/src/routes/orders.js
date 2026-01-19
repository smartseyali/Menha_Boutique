const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const { validateOrder, validateUUID } = require('../middleware/validation');

router.get('/all', authenticate, requireRole('admin'), orderController.getAllOrders);
router.get('/', authenticate, orderController.getUserOrders);
router.get('/by-transaction/:transactionId', authenticate, orderController.getOrderByTransactionId);
router.get('/:id', optionalAuth, validateUUID, orderController.getOrderById);
router.post('/', optionalAuth, validateOrder, orderController.createOrder);
router.put('/:id/status', authenticate, requireRole('admin'), validateUUID, orderController.updateOrderStatus);

module.exports = router;

