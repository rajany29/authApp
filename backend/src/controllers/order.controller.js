// src/controllers/order.controller.js
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

// Create new order (Employee only)
exports.createOrder = async (req, res) => {
  try {
    const { customerName, products } = req.body;
    
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one product' });
    }
    
    // Calculate total amount and verify products exist
    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found or inactive` });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }
    
    const newOrder = await Order.create({
      customerName,
      products: orderProducts,
      totalAmount,
      createdBy: req.user._id
    });
    
    // Populate product details for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate({
        path: 'products.product',
        select: 'name description'
      })
      .populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'products.product',
        select: 'name'
      })
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get manager's team orders (Manager only)
exports.getTeamOrders = async (req, res) => {
  try {
    const manager = await User.findById(req.user._id);
    
    if (!manager || manager.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get all orders created by team members
    const orders = await Order.find({ createdBy: { $in: manager.team } })
      .populate({
        path: 'products.product',
        select: 'name'
      })
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders (Employee only)
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ createdBy: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name description'
      });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'products.product',
        select: 'name description'
      })
      .populate('createdBy', 'name');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permission
    if (
      req.user.role === 'employee' && 
      order.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }
    
    // If manager, check if order was created by team member
    if (req.user.role === 'manager') {
      const manager = await User.findById(req.user._id);
      const isTeamMember = manager.team.some(
        (member) => member.toString() === order.createdBy._id.toString()
      );
      
      if (!isTeamMember) {
        return res.status(403).json({ message: 'Not authorized to access this order' });
      }
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (Manager only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // If manager, check if order was created by team member
    if (req.user.role === 'manager') {
      const manager = await User.findById(req.user._id);
      const isTeamMember = manager.team.some(
        (member) => member.toString() === order.createdBy.toString()
      );
      
      if (!isTeamMember) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'products.product',
        select: 'name description'
      })
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};