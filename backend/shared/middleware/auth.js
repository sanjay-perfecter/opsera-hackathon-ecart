const jwt = require('jsonwebtoken');
const axios = require('axios');

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and verifies it
 */
const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh your token.',
                tokenExpired: true
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Token is invalid. Authorization denied.'
        });
    }
};

/**
 * Middleware to verify token by calling Auth Service
 * Used in other microservices to validate tokens
 */
const verifyTokenViaAuthService = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        const token = authHeader.substring(7);

        // Call Auth Service to verify token
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
        const response = await axios.post(
            `${authServiceUrl}/api/auth/verify`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.data?.success) {
            return res.status(401).json({
                success: false,
                message: 'Token verification failed.'
            });
        }

        // Auth service uses shared `successResponse`, so user is under `data.user`
        const user = response.data?.data?.user;
        if (!user || !user.id) {
            return res.status(401).json({
                success: false,
                message: 'Token verification failed.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return res.status(401).json({
                success: false,
                message: error.response.data.message || 'Token is invalid.',
                tokenExpired: error.response.data.tokenExpired
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Token verification failed.'
        });
    }
};

/**
 * Optional token verification middleware
 * Populates req.user if valid token is provided, but doesn't reject if no token
 * Used for public routes that need to check if user is admin
 */
const optionalVerifyTokenViaAuthService = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided - continue without user
            return next();
        }

        const token = authHeader.substring(7);

        // Call Auth Service to verify token
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
        const response = await axios.post(
            `${authServiceUrl}/api/auth/verify`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data?.success) {
            const user = response.data?.data?.user;
            if (user && user.id) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Token verification failed - continue without user
        next();
    }
};

/**
 * Middleware for internal service-to-service calls.
 * Expects a shared secret in the `x-internal-service-key` header.
 */
const verifyInternalServiceKey = (req, res, next) => {
    const configuredKey = process.env.INTERNAL_SERVICE_KEY;
    if (!configuredKey) {
        return res.status(500).json({
            success: false,
            message: 'Internal service key is not configured.'
        });
    }

    const providedKey = req.headers['x-internal-service-key'];
    if (!providedKey || providedKey !== configuredKey) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized internal request.'
        });
    }

    return next();
};

module.exports = { verifyToken, verifyTokenViaAuthService, optionalVerifyTokenViaAuthService, verifyInternalServiceKey };
