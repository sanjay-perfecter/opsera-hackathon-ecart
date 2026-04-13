/**
 * Middleware to check if user has required role
 * @param {Array} roles - Array of allowed roles
 */
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

/**
 * Middleware to check if user can access their own resource
 * @param {String} paramName - Name of the parameter containing user ID
 */
const isOwnerOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const resourceUserId = req.params[paramName];

        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }

        // User can only access their own resource
        if (req.user.id === resourceUserId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.'
        });
    };
};

module.exports = { checkRole, isAdmin, isOwnerOrAdmin };
