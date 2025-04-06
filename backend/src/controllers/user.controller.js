// src/controllers/user.controller.js
const User = require('../models/user.model');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllManagers = async (req, res) => {
  try {
    const users = await User.find({ role: 'manager'}).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new team member (Admin only)
exports.addTeamMember = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    
    // Validate role
    if (!['manager', 'employee'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either manager or employee' });
    }
    
    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Create user data
    const userData = {
      name,
      email,
      password,
      role
    };
    
    // If employee, assign manager
    if (role === 'employee' && managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== 'manager') {
        return res.status(400).json({ message: 'Invalid manager ID' });
      }
      userData.manager = managerId;
    }
    
    // Create user
    const newUser = await User.create(userData);
    
    // If user is employee, add to manager's team
    if (role === 'employee' && managerId) {
      await User.findByIdAndUpdate(
        managerId,
        { $push: { team: newUser._id } },
        { new: true }
      );
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        manager: newUser.manager
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign role to team member (Admin only)
exports.assignRole = async (req, res) => {
  try {
    const { userId, role, managerId } = req.body;
    
    // Validate role
    if (!['manager', 'employee'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either manager or employee' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user data
    const updateData = { role };
    
    // If changing to employee, assign manager
    if (role === 'employee' && managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== 'manager') {
        return res.status(400).json({ message: 'Invalid manager ID' });
      }
      
      updateData.manager = managerId;
      
      // Add user to manager's team
      await User.findByIdAndUpdate(
        managerId,
        { $addToSet: { team: userId } },
        { new: true }
      );
    } else if (role === 'manager') {
      // If changing to manager, remove from previous manager's team and clear manager field
      if (user.manager) {
        await User.findByIdAndUpdate(
          user.manager,
          { $pull: { team: userId } },
          { new: true }
        );
      }
      
      updateData.manager = null;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team members (Manager only)
exports.getTeamMembers = async (req, res) => {
  try {
    const managerId = req.user._id;
    
    const manager = await User.findById(managerId)
      .populate('team', '-password')
      .select('-password');
    
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    
    res.status(200).json({
      success: true,
      count: manager.team.length,
      data: manager.team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is employee, remove from manager's team
    if (user.role === 'employee' && user.manager) {
      await User.findByIdAndUpdate(
        user.manager,
        { $pull: { team: user._id } },
        { new: true }
      );
    }
    
    // If user is manager, reassign team members to default admin
    if (user.role === 'manager' && user.team.length > 0) {
      const admin = await User.findOne({ role: 'admin' });
      
      // Update team members' manager to admin
      await User.updateMany(
        { _id: { $in: user.team } },
        { manager: admin._id }
      );
      
      // Add team members to admin's team
      await User.findByIdAndUpdate(
        admin._id,
        { $push: { team: { $each: user.team } } },
        { new: true }
      );
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, password, role, managerId } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) user.password = password;

    // 🟡 If role is changing, handle logic
    if (role && role !== user.role) {
      // If changing from manager to employee
      if (user.role === 'manager' && role === 'employee') {
        const admin = await User.findOne({ role: 'admin' });

        // Reassign team to admin
        await User.updateMany({ _id: { $in: user.team } }, { manager: admin._id });
        await User.findByIdAndUpdate(admin._id, {
          $push: { team: { $each: user.team } },
        });

        user.team = [];
      }

      // If changing from employee to manager
      if (user.role === 'employee' && role === 'manager') {
        // Remove employee from manager's team
        if (user.manager) {
          await User.findByIdAndUpdate(user.manager, {
            $pull: { team: user._id },
          });
          user.manager = null;
        }
      }

      user.role = role;
    }

    // 🟡 If user is still employee and managerId is present
    if (role === 'employee' && managerId) {
      const newManager = await User.findById(managerId);
      if (!newManager) return res.status(400).json({ message: 'Invalid manager' });

      user.manager = managerId;
      await User.findByIdAndUpdate(managerId, {
        $addToSet: { team: user._id },
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

