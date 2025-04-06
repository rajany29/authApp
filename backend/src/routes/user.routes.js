// src/routes/user.routes.js
const express = require('express');
const { 
  getAllUsers, 
  getAllManagers,
  getUserById, 
  addTeamMember, 
  assignRole, 
  getTeamMembers,
  deleteUser, 
  updateUser
} = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin routes
router.get('/', restrictTo(['admin', 'manager']), getAllUsers);
router.post('/add', restrictTo('admin'), addTeamMember);
router.post('/manager', restrictTo('admin'), getAllManagers);
router.put('/assign-role', restrictTo('admin'), assignRole);
router.delete('/:id', restrictTo('admin'), deleteUser);
router.put('/:id', restrictTo('admin'), updateUser);

// Manager routes
router.get('/team', restrictTo(['manager','admin']), getTeamMembers);

// Common routes
router.get('/:id', restrictTo('admin'), getUserById);

module.exports = router;