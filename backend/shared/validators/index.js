const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to validate request and return errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * User validation rules
 */
const userValidation = {
    signup: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Must be a valid email address')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
            .matches(/\d/).withMessage('Password must contain at least one number')
    ],
    createUser: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Must be a valid email address')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
            .matches(/\d/).withMessage('Password must contain at least one number'),
        body('role')
            .optional()
            .isIn(['user', 'admin']).withMessage('Role must be either user or admin')
    ],
    signin: [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Must be a valid email address')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required')
    ],
    updateProfile: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('email')
            .optional()
            .trim()
            .isEmail().withMessage('Must be a valid email address')
            .normalizeEmail()
    ],
    updateRole: [
        body('role')
            .notEmpty().withMessage('Role is required')
            .isIn(['user', 'admin']).withMessage('Role must be either user or admin')
    ]
};

/**
 * Product validation rules
 */
const productValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty().withMessage('Product name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('category')
            .notEmpty().withMessage('Category is required')
            .trim(),
        body('price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
        body('quantity')
            .notEmpty().withMessage('Quantity is required')
            .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters')
    ],
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
        body('category')
            .optional()
            .trim(),
        body('price')
            .optional()
            .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
        body('quantity')
            .optional()
            .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters')
    ]
};

/**
 * Category validation rules
 */
const categoryValidation = {
    create: [
        body('name')
            .trim()
            .notEmpty().withMessage('Category name is required')
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('slug')
            .trim()
            .notEmpty().withMessage('Category slug is required')
            .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
    ],
    update: [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
        body('slug')
            .optional()
            .trim()
            .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
    ]
};

/**
 * Cart validation rules
 */
const cartValidation = {
    addToCart: [
        body('productId')
            .notEmpty().withMessage('Product ID is required')
            .isMongoId().withMessage('Invalid product ID'),
        body('quantity')
            .notEmpty().withMessage('Quantity is required')
            .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    updateCart: [
        body('productId')
            .notEmpty().withMessage('Product ID is required')
            .isMongoId().withMessage('Invalid product ID'),
        body('quantity')
            .notEmpty().withMessage('Quantity is required')
            .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ]
};

/**
 * Order validation rules
 */
const orderValidation = {
    updateStatus: [
        body('status')
            .notEmpty().withMessage('Status is required')
            .isIn(['pending', 'processing', 'completed', 'cancelled']).withMessage('Invalid order status')
    ]
};

/**
 * ID parameter validation
 */
const idValidation = [
    param('id')
        .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
    validate,
    userValidation,
    productValidation,
    categoryValidation,
    cartValidation,
    orderValidation,
    idValidation
};
