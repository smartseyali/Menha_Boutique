const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');
const { authenticate } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

router.get('/', authenticate, compareController.getCompare);
router.post('/add', authenticate, compareController.addToCompare);
router.delete('/:id', authenticate, validateUUID, compareController.removeFromCompare);
router.delete('/', authenticate, compareController.clearCompare);

module.exports = router;

