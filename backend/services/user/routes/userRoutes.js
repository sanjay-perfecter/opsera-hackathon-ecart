const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  restoreUser,
  getUserStats
} = require('../controllers/userController');
const { verifyTokenViaAuthService } = require('../../../shared/middleware/auth');
const { isAdmin, isOwnerOrAdmin } = require('../../../shared/middleware/rbac');
const { userValidation, validate, idValidation } = require('../../../shared/validators');

// All routes require authentication
router.use(verifyTokenViaAuthService);

// Admin only routes
router.post('/', [isAdmin, ...userValidation.createUser, validate], createUser);
router.get('/', isAdmin, getAllUsers);
router.get('/stats/overview', isAdmin, getUserStats);
router.put('/:id/role', [isAdmin, ...idValidation, ...userValidation.updateRole, validate], updateUserRole);
router.delete('/:id', [isAdmin, ...idValidation, validate], deleteUser);
router.patch('/:id/restore', [isAdmin, ...idValidation, validate], restoreUser);

// Owner or admin routes
router.get('/:id', [...idValidation, validate, isOwnerOrAdmin()], getUserById);
router.put('/:id', [...idValidation, ...userValidation.updateProfile, validate, isOwnerOrAdmin()], updateUser);

module.exports = router;
