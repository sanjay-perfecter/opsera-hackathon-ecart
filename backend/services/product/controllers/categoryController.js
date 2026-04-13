const Category = require('../models/Category');
const Product = require('../models/Product');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse, errorResponse, getPagination } = require('../../../shared/utils/helpers');

/**
 * @route   GET /api/products/categories
 * @desc    Get all categories (public: non-deleted only, admin: optionally include deleted)
 * @access  Public
 */
const getAllCategories = asyncHandler(async (req, res) => {
    const { includeDeleted = 'false' } = req.query;
    
    // Build query
    const query = {};
    
    // Only admins can see deleted categories
    if (includeDeleted === 'true' && req.user?.role === 'admin') {
        // Include all categories
    } else {
        query.isDeleted = false;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    successResponse(res, 200, 'Categories retrieved successfully', { categories });
});

/**
 * @route   GET /api/products/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return errorResponse(res, 404, 'Category not found');
    }

    // Non-admins cannot see deleted categories
    if (category.isDeleted && req.user?.role !== 'admin') {
        return errorResponse(res, 404, 'Category not found');
    }

    successResponse(res, 200, 'Category retrieved successfully', { category });
});

/**
 * @route   POST /api/products/categories
 * @desc    Create new category (admin only)
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;

    // Check if category with same slug already exists (including deleted ones)
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
        if (existingCategory.isDeleted) {
            return errorResponse(res, 400, 'A deleted category with this slug exists. Please restore it or use a different slug.');
        }
        return errorResponse(res, 400, 'Category with this slug already exists');
    }

    const category = await Category.create({
        name,
        slug
    });

    successResponse(res, 201, 'Category created successfully', { category });
});

/**
 * @route   PUT /api/products/categories/:id
 * @desc    Update category (admin only)
 * @access  Private/Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
        return errorResponse(res, 404, 'Category not found');
    }

    if (category.isDeleted) {
        return errorResponse(res, 400, 'Cannot update a deleted category. Please restore it first.');
    }

    // Check if new slug conflicts with another category
    if (slug && slug !== category.slug) {
        const existingCategory = await Category.findOne({ slug, _id: { $ne: category._id } });
        if (existingCategory) {
            return errorResponse(res, 400, 'Another category with this slug already exists');
        }
        category.slug = slug;
    }

    if (name) category.name = name;

    await category.save();

    successResponse(res, 200, 'Category updated successfully', { category });
});

/**
 * @route   DELETE /api/products/categories/:id
 * @desc    Soft delete category (admin only)
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return errorResponse(res, 404, 'Category not found');
    }

    if (category.isDeleted) {
        return errorResponse(res, 400, 'Category is already deleted');
    }

    // Check if any products use this category (including deleted products)
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
        return errorResponse(res, 400, `Cannot delete category. ${productsCount} product(s) are using this category.`);
    }

    // Soft delete
    category.isDeleted = true;
    category.deletedAt = new Date();
    category.deletedBy = req.user.id;
    await category.save();

    successResponse(res, 200, 'Category deleted successfully');
});

/**
 * @route   PATCH /api/products/categories/:id/restore
 * @desc    Restore soft-deleted category (admin only)
 * @access  Private/Admin
 */
const restoreCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return errorResponse(res, 404, 'Category not found');
    }

    if (!category.isDeleted) {
        return errorResponse(res, 400, 'Category is not deleted');
    }

    // Restore
    category.isDeleted = false;
    category.deletedAt = null;
    category.deletedBy = null;
    await category.save();

    successResponse(res, 200, 'Category restored successfully', { category });
});

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory
};
