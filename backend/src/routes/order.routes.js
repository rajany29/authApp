// src/routes/order.routes.js
const express = require('express');
const { 
  createOrder, 
  getAllOrders, 
  getTeamOrders, 
  getUserOrders,
  getOrderById,
  updateOrderStatus 
} = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin routes
router.get('/all', restrictTo('admin'), getAllOrders);

// Manager routes
router.get('/team', restrictTo('manager'), getTeamOrders);
router.put('/:id/status', restrictTo('admin', 'manager'), updateOrderStatus);

// Employee routes
router.post('/', restrictTo('employee'), createOrder);
router.get('/my-orders', restrictTo('employee'), getUserOrders);

// Common routes
router.get('/:id', getOrderById);

module.exports = router;