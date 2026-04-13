const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0.01, 'Price must be greater than 0']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    unit: {
        type: String,
        default: 'kg',
        enum: ['kg', 'piece', 'dozen', 'bunch']
    },
    inStock: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient queries
productSchema.index({ category: 1, isDeleted: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
    if (this.quantity === 0) return 'Out of Stock';
    if (this.quantity < 10) return 'Low Stock';
    return 'In Stock';
});

// Update inStock based on quantity
productSchema.pre('save', function (next) {
    this.inStock = this.quantity > 0;
    next();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
