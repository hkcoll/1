const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    categoryAr: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        default: ''
    },
    subCategoryAr: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: '$'
    },
    image: {
        type: String,
        required: true
    },
    badge: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
