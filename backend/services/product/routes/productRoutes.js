const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats,
    updateStock,
    restoreProduct
} = require('../controllers/productController');
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory
} = require('../controllers/categoryController');
const { verifyTokenViaAuthService, optionalVerifyTokenViaAuthService, verifyInternalServiceKey } = require('../../../shared/middleware/auth');
const { isAdmin } = require('../../../shared/middleware/rbac');
const { productValidation, categoryValidation, validate, idValidation } = require('../../../shared/validators');
const upload = require('../middleware/upload');

const isInternalRequest = (req) => !!req.headers['x-internal-service-key'];

// Category routes (must be before /:id to avoid conflicts)
router.get('/categories', getAllCategories);
router.post('/categories', verifyTokenViaAuthService, isAdmin, categoryValidation.create, validate, createCategory);
router.get('/categories/:id', [...idValidation, validate], getCategoryById);
router.put('/categories/:id', verifyTokenViaAuthService, isAdmin, [...idValidation, ...categoryValidation.update, validate], updateCategory);
router.delete('/categories/:id', verifyTokenViaAuthService, isAdmin, [...idValidation, validate], deleteCategory);
router.patch('/categories/:id/restore', verifyTokenViaAuthService, isAdmin, [...idValidation, validate], restoreCategory);

// Public product routes (with optional auth for admin features)
router.get('/', optionalVerifyTokenViaAuthService, getAllProducts);
router.get('/:id', optionalVerifyTokenViaAuthService, [...idValidation, validate], getProductById);

// Protected admin routes
router.post(
    '/',
    verifyTokenViaAuthService,
    isAdmin,
    upload.single('image'),
    productValidation.create,
    validate,
    createProduct
);

router.put(
    '/:id',
    verifyTokenViaAuthService,
    isAdmin,
    upload.single('image'),
    [...idValidation, ...productValidation.update, validate],
    updateProduct
);

router.delete(
    '/:id',
    verifyTokenViaAuthService,
    isAdmin,
    [...idValidation, validate],
    deleteProduct
);

router.get(
    '/stats/overview',
    verifyTokenViaAuthService,
    isAdmin,
    getProductStats
);

router.put(
    '/:id/stock',
    (req, res, next) => (isInternalRequest(req) ? verifyInternalServiceKey(req, res, next) : verifyTokenViaAuthService(req, res, next)),
    (req, res, next) => (isInternalRequest(req) ? next() : isAdmin(req, res, next)),
    [...idValidation, validate],
    updateStock
);

router.patch(
    '/:id/restore',
    verifyTokenViaAuthService,
    isAdmin,
    [...idValidation, validate],
    restoreProduct
);

module.exports = router;
