const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateProduct, validateUUID } = require('../middleware/validation');

router.get('/', productController.getAllProducts);
router.get('/bestselling', productController.getBestSellingProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', validateUUID, productController.getProductById);
router.post('/', authenticate, requireRole('admin'), validateProduct, productController.createProduct);
router.put('/:id', authenticate, requireRole('admin'), validateUUID, productController.updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), validateUUID, productController.deleteProduct);

module.exports = router;

