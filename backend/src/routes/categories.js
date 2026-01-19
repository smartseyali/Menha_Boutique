const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

router.get('/', categoryController.getAllCategories);
router.get('/:id', validateUUID, categoryController.getCategoryById);
router.get('/:id/products', validateUUID, categoryController.getCategoryProducts);
router.post('/', authenticate, requireRole('admin'), categoryController.createCategory);
router.put('/:id', authenticate, requireRole('admin'), validateUUID, categoryController.updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), validateUUID, categoryController.deleteCategory);

module.exports = router;

