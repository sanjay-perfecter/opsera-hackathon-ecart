const express = require('express');
const router = express.Router();
const {
    signup,
    signin,
    refreshAccessToken,
    verifyToken,
    logout
} = require('../controllers/authController');
const { verifyToken: verifyTokenMiddleware } = require('../../../shared/middleware/auth');
const { userValidation, validate } = require('../../../shared/validators');

// Public routes
router.post('/signup', userValidation.signup, validate, signup);
router.post('/signin', userValidation.signin, validate, signin);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.post('/verify', verifyTokenMiddleware, verifyToken);
router.post('/logout', verifyTokenMiddleware, logout);

module.exports = router;
