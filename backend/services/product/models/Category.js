const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        required: [true, 'Category slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
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
categorySchema.index({ slug: 1, isDeleted: 1 });

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
