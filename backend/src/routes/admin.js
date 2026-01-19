const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/stats', authenticate, requireRole('admin'), adminController.getStats);
router.get('/users', authenticate, requireRole('admin'), adminController.getUsers);
router.get('/users/:id', authenticate, requireRole('admin'), adminController.getUserDetails);
router.put('/users/:id/status', authenticate, requireRole('admin'), adminController.updateUserStatusAndRole);

module.exports = router;

