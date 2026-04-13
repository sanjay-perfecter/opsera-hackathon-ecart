const User = require('../models/User');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse, errorResponse, getPagination } = require('../../../shared/utils/helpers');

/**
 * @route   POST /api/users
 * @desc    Create new user (admin only)
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 400, 'User with this email already exists');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role,
    isDeleted: false
  });

  successResponse(res, 201, 'User created successfully', { 
    user: user.toJSON() 
  });
});

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', role, includeDeleted = 'false' } = req.query;

  // Build query
  const query = {};
  
  // Only include deleted if explicitly requested
  if (includeDeleted === 'true') {
    // Include all users
  } else {
    query.isDeleted = false;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    query.role = role;
  }

  // Count total documents
  const total = await User.countDocuments(query);
  
  // Get paginated users
  const users = await User.find(query)
    .select('-password -refreshToken')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const pagination = getPagination(page, limit, total);

  successResponse(res, 200, 'Users retrieved successfully', {
    users,
    pagination
  });
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  // Non-admins cannot see deleted users
  if (user.isDeleted && req.user?.role !== 'admin') {
    return errorResponse(res, 404, 'User not found');
  }

  successResponse(res, 200, 'User retrieved successfully', { user });
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  if (user.isDeleted) {
    return errorResponse(res, 400, 'Cannot update a deleted user. Please restore it first.');
  }

  // Check if email is being changed and already exists
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'Email already in use');
    }
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  successResponse(res, 200, 'User updated successfully', { 
    user: user.toJSON() 
  });
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (admin only)
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  user.role = role;
  await user.save();

  successResponse(res, 200, 'User role updated successfully', { 
    user: user.toJSON() 
  });
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user (admin only)
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  if (user.isDeleted) {
    return errorResponse(res, 400, 'User is already deleted');
  }

  // Prevent deleting own admin account
  if (req.user.id === req.params.id && req.user.role === 'admin') {
    return errorResponse(res, 400, 'Cannot delete your own admin account');
  }

  // Soft delete
  user.isDeleted = true;
  user.deletedAt = new Date();
  user.deletedBy = req.user.id;
  await user.save();

  successResponse(res, 200, 'User deleted successfully');
});

/**
 * @route   PATCH /api/users/:id/restore
 * @desc    Restore soft-deleted user (admin only)
 * @access  Private/Admin
 */
const restoreUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  if (!user.isDeleted) {
    return errorResponse(res, 400, 'User is not deleted');
  }

  // Restore
  user.isDeleted = false;
  user.deletedAt = null;
  user.deletedBy = null;
  await user.save();

  successResponse(res, 200, 'User restored successfully', { user: user.toJSON() });
});

/**
 * @route   GET /api/users/stats/overview
 * @desc    Get user statistics (admin only)
 * @access  Private/Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ isDeleted: false });
  const totalAdmins = await User.countDocuments({ isDeleted: false, role: 'admin' });
  const totalRegularUsers = await User.countDocuments({ isDeleted: false, role: 'user' });

  // Get recent users (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUsers = await User.countDocuments({ 
    isDeleted: false,
    createdAt: { $gte: sevenDaysAgo } 
  });

  successResponse(res, 200, 'User statistics retrieved successfully', {
    stats: {
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      recentUsers
    }
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  restoreUser,
  getUserStats
};
