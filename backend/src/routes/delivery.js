const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { optionalAuth, authenticate, requireRole } = require('../middleware/auth');

// Public route to calculate delivery charge
router.post('/calculate', optionalAuth, deliveryController.calculateDeliveryCharge);

// Admin route to get all configurations
router.get('/charges', authenticate, requireRole('admin'), deliveryController.getDeliveryCharges);

// Admin routes for managing charges
router.post('/charges', authenticate, requireRole('admin'), deliveryController.createDeliveryCharge);
router.put('/charges/:id', authenticate, requireRole('admin'), deliveryController.updateDeliveryCharge);
router.delete('/charges/:id', authenticate, requireRole('admin'), deliveryController.deleteDeliveryCharge);

// Admin routes for managing delivery rules (New Dynamic Calculation)
router.post('/rules', authenticate, requireRole('admin'), deliveryController.saveDeliveryRule);
router.delete('/rules/:id', authenticate, requireRole('admin'), deliveryController.deleteDeliveryRule);

// New Tariff & Zone Routes
router.post('/tariffs', authenticate, requireRole('admin'), deliveryController.createTariff);
router.put('/tariffs/:id', authenticate, requireRole('admin'), deliveryController.updateTariff);
router.delete('/tariffs/:id', authenticate, requireRole('admin'), deliveryController.deleteTariff);

router.put('/states/:id/zone', authenticate, requireRole('admin'), deliveryController.updateStateZone);
router.post('/states/zones/bulk', authenticate, requireRole('admin'), deliveryController.bulkUpdateStateZones);

module.exports = router;
