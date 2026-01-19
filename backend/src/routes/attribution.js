const express = require('express');
const router = express.Router();
const attributionController = require('../controllers/attributionController');

router.post('/track', attributionController.trackAttribution);
router.post('/conversion', attributionController.trackConversion);
router.get('/stats', attributionController.getAttributionStats);
router.get('/conversions', attributionController.getConversionStats);

module.exports = router;

