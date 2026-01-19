const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateAddress, validateUUID } = require('../middleware/validation');

router.get('/', authenticate, addressController.getUserAddresses);
router.post('/', optionalAuth, validateAddress, addressController.createAddress);
router.put('/:id', authenticate, validateUUID, addressController.updateAddress);
router.delete('/:id', authenticate, validateUUID, addressController.deleteAddress);

module.exports = router;

