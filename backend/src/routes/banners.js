const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

router.get('/', bannerController.getAllBanners);
router.post('/', authenticate, requireRole('admin'), bannerController.createBanner);
router.put('/:id', authenticate, requireRole('admin'), validateUUID, bannerController.updateBanner);
router.delete('/:id', authenticate, requireRole('admin'), validateUUID, bannerController.deleteBanner);

module.exports = router;
