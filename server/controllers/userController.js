import User from '../models/User.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    
    // Filter by role if provided
    if (role && ['admin', 'editor', 'writer', 'reader'].includes(role)) {
      query.role = role;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
};

// Get editors list (for writers to assign articles)
export const getEditors = async (req, res) => {
  try {
    const editors = await User.find({ role: 'editor', isActive: true })
      .select('_id name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: editors.length,
      data: { editors }
    });
  } catch (error) {
    console.error('Get editors error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching editors'
    });
  }
};

// Get writers list (for admin view)
export const getWriters = async (req, res) => {
  try {
    const writers = await User.find({ role: 'writer' })
      .select('_id name email isActive createdAt')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: writers.length,
      data: { writers }
    });
  } catch (error) {
    console.error('Get writers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching writers'
    });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user'
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Validate role
    if (!['editor', 'writer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Can only promote/demote between editor and writer roles'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing admin role
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change admin role'
      });
    }

    // Prevent user from changing their own role
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated from ${oldRole} to ${role}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user role'
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate admin account'
      });
    }

    // Prevent user from deactivating themselves
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error toggling user status'
    });
  }
};

// Get user statistics (Admin dashboard)
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const activeUsers = await User.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();

    const formattedStats = {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      byRole: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      data: { stats: formattedStats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user statistics'
    });
  }
};