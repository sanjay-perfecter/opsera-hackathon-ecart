const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse, errorResponse, getPagination } = require('../../../shared/utils/helpers');
const path = require('path');
const fs = require('fs');

/**
 * Helper function to resolve category (by ID or slug) to Category ObjectId
 */
const resolveCategoryId = async (categoryInput) => {
    if (!categoryInput) return null;

    // Check if it's a valid MongoDB ObjectId
    if (categoryInput.match(/^[0-9a-fA-F]{24}$/)) {
        const category = await Category.findOne({ _id: categoryInput, isDeleted: false });
        if (category) return category._id;
    }

    // Try to find by slug
    const category = await Category.findOne({ slug: categoryInput, isDeleted: false });
    if (category) return category._id;

    return null;
};

/**
 * @route   GET /api/products
 * @desc    Get all products with optional filters
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        category,
        search = '',
        minPrice,
        maxPrice,
        inStock,
        includeDeleted = 'false'
    } = req.query;

    // Build query
    const query = {};

    // Only admins can see deleted products
    if (includeDeleted === 'true' && req.user?.role === 'admin') {
        // Include all products
    } else {
        query.isDeleted = false;
    }

    // Resolve category by slug or ID
    if (category) {
        const categoryId = await resolveCategoryId(category);
        if (categoryId) {
            query.category = categoryId;
        } else {
            // Invalid category - return empty results
            return successResponse(res, 200, 'Products retrieved successfully', {
                products: [],
                pagination: getPagination(page, limit, 0)
            });
        }
    }

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (inStock !== undefined) {
        query.inStock = inStock === 'true';
    }

    // Count total documents
    const total = await Product.countDocuments(query);

    // Get paginated products
    const products = await Product.find(query)
        .populate('category', 'name slug')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const pagination = getPagination(page, limit, total);

    successResponse(res, 200, 'Products retrieved successfully', {
        products,
        pagination
    });
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
        return errorResponse(res, 404, 'Product not found');
    }

    // Non-admins cannot see deleted products
    if (product.isDeleted && req.user?.role !== 'admin') {
        return errorResponse(res, 404, 'Product not found');
    }

    successResponse(res, 200, 'Product retrieved successfully', { product });
});

/**
 * @route   POST /api/products
 * @desc    Create new product (admin only)
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
    const { name, category, price, quantity, description, unit } = req.body;

    // Resolve category
    const categoryId = await resolveCategoryId(category);
    if (!categoryId) {
        return errorResponse(res, 400, 'Invalid category. Category does not exist or is deleted.');
    }

    // Get image URL if file was uploaded
    let imageUrl = '';
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
        name,
        category: categoryId,
        price,
        quantity,
        description,
        imageUrl,
        unit: unit || 'kg'
    });

    // Populate category before sending response
    await product.populate('category', 'name slug');

    successResponse(res, 201, 'Product created successfully', { product });
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (admin only)
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
    const { name, category, price, quantity, description, unit } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        return errorResponse(res, 404, 'Product not found');
    }

    if (product.isDeleted) {
        return errorResponse(res, 400, 'Cannot update a deleted product. Please restore it first.');
    }

    // Update fields if provided
    if (name) product.name = name;

    // Resolve category if provided
    if (category) {
        const categoryId = await resolveCategoryId(category);
        if (!categoryId) {
            return errorResponse(res, 400, 'Invalid category. Category does not exist or is deleted.');
        }
        product.category = categoryId;
    }

    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (description !== undefined) product.description = description;
    if (unit) product.unit = unit;

    // Update image if new file uploaded
    if (req.file) {
        // Delete old image if exists — restrict deletion to the uploads directory
        // to prevent path traversal via a tampered imageUrl (semgrep: path-join-resolve-traversal)
        if (product.imageUrl) {
            const uploadsRoot = path.resolve(__dirname, '..', 'uploads');
            const oldImagePath = path.resolve(__dirname, '..', product.imageUrl);
            if (oldImagePath.startsWith(uploadsRoot + path.sep) && fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        product.imageUrl = `/uploads/${req.file.filename}`;
    }

    await product.save();
    await product.populate('category', 'name slug');

    successResponse(res, 200, 'Product updated successfully', { product });
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Soft delete product (admin only)
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return errorResponse(res, 404, 'Product not found');
    }

    if (product.isDeleted) {
        return errorResponse(res, 400, 'Product is already deleted');
    }

    // Soft delete (don't delete image file)
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.deletedBy = req.user.id;
    await product.save();

    successResponse(res, 200, 'Product deleted successfully');
});

/**
 * @route   PATCH /api/products/:id/restore
 * @desc    Restore soft-deleted product (admin only)
 * @access  Private/Admin
 */
const restoreProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return errorResponse(res, 404, 'Product not found');
    }

    if (!product.isDeleted) {
        return errorResponse(res, 400, 'Product is not deleted');
    }

    // Verify category still exists and is not deleted
    const category = await Category.findOne({ _id: product.category, isDeleted: false });
    if (!category) {
        return errorResponse(res, 400, 'Cannot restore product. Its category no longer exists or is deleted.');
    }

    // Restore
    product.isDeleted = false;
    product.deletedAt = null;
    product.deletedBy = null;
    await product.save();
    await product.populate('category', 'name slug');

    successResponse(res, 200, 'Product restored successfully', { product });
});

/**
 * @route   GET /api/products/stats/overview
 * @desc    Get product statistics (admin only)
 * @access  Private/Admin
 */
const getProductStats = asyncHandler(async (req, res) => {
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const outOfStock = await Product.countDocuments({ isDeleted: false, quantity: 0 });
    const lowStock = await Product.countDocuments({ isDeleted: false, quantity: { $gt: 0, $lt: 10 } });

    // Get category breakdown
    const categoryStats = await Product.aggregate([
        { $match: { isDeleted: false } },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'categoryInfo'
            }
        },
        { $unwind: '$categoryInfo' },
        {
            $group: {
                _id: '$category',
                name: { $first: '$categoryInfo.name' },
                slug: { $first: '$categoryInfo.slug' },
                count: { $sum: 1 }
            }
        },
        { $sort: { name: 1 } }
    ]);

    // Legacy compatibility: provide totalVegetables and totalFruits if those categories exist
    const vegetableCategory = categoryStats.find(c => c.slug === 'vegetable');
    const fruitCategory = categoryStats.find(c => c.slug === 'fruit');

    successResponse(res, 200, 'Product statistics retrieved successfully', {
        stats: {
            totalProducts,
            outOfStock,
            lowStock,
            totalVegetables: vegetableCategory?.count || 0,
            totalFruits: fruitCategory?.count || 0,
            categories: categoryStats
        }
    });
});

/**
 * @route   PUT /api/products/:id/stock
 * @desc    Update product stock (admin only)
 * @access  Private/Admin
 */
const updateStock = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
        return errorResponse(res, 400, 'Valid quantity is required');
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        return errorResponse(res, 404, 'Product not found');
    }

    if (product.isDeleted) {
        return errorResponse(res, 400, 'Cannot update stock for a deleted product');
    }

    product.quantity = quantity;
    await product.save();
    await product.populate('category', 'name slug');

    successResponse(res, 200, 'Stock updated successfully', { product });
});

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    getProductStats,
    updateStock
};
