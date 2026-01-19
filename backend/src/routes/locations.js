const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Public routes - no authentication required
router.get('/countries', locationController.getCountries);
router.get('/states', locationController.getStates);
router.get('/cities', locationController.getCities);

module.exports = router;

