/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    // Default to 500 if statusCode not set
    statusCode = statusCode || 500;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists.`;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format.';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired.';
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Async handler to wrap async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
    const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
    next(error);
};

module.exports = { ApiError, errorHandler, asyncHandler, notFound };
