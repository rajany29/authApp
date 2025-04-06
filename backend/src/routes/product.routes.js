// src/routes/product.routes.js
const express = require('express');
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes
router.use(protect);

// Admin and Manager routes
router.post('/', restrictTo('admin', 'manager'), createProduct);
router.put('/:id', restrictTo('admin', 'manager'), updateProduct);
router.delete('/:id', restrictTo('admin', 'manager'), deleteProduct);

module.exports = router;