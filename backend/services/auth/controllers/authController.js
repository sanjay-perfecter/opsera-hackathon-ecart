const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse, errorResponse } = require('../../../shared/utils/helpers');

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

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
        role: 'user',
        isDeleted: false,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, 201, 'User registered successfully', {
        user: user.toJSON(),
        accessToken,
        refreshToken
    });
});

/**
 * @route   POST /api/auth/signin
 * @desc    Login user
 * @access  Public
 */
const signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check if user is deleted
    if (user.isDeleted) {
        return errorResponse(res, 401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return errorResponse(res, 401, 'Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, 200, 'Login successful', {
        user: user.toJSON(),
        accessToken,
        refreshToken
    });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return errorResponse(res, 401, 'Refresh token required');
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find user and verify refresh token
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            return errorResponse(res, 401, 'Invalid refresh token');
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        successResponse(res, 200, 'Token refreshed successfully', {
            accessToken: newAccessToken
        });
    } catch (error) {
        return errorResponse(res, 401, 'Invalid or expired refresh token');
    }
});

/**
 * @route   POST /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
const verifyToken = asyncHandler(async (req, res) => {
    // Token verification is done by middleware, if we reach here, token is valid
    successResponse(res, 200, 'Token is valid', {
        user: req.user
    });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    // Remove refresh token from database
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    successResponse(res, 200, 'Logout successful');
});

module.exports = {
    signup,
    signin,
    refreshAccessToken,
    verifyToken,
    logout
};
