const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ============================================
// 🚀 Products Cache System
// ============================================
let productsCache = [];
let cacheLoaded = false;

// Load all products into cache
async function loadCache() {
    try {
        productsCache = await Product.find({}).sort({ createdAt: -1 }).lean();
        cacheLoaded = true;
        console.log(`✅ Products cache loaded: ${productsCache.length} products`);
    } catch (error) {
        console.error('❌ Failed to load cache:', error.message);
        cacheLoaded = false;
    }
}

// Refresh cache (called after any modification)
async function refreshCache() {
    try {
        productsCache = await Product.find({}).sort({ createdAt: -1 }).lean();
        cacheLoaded = true;
        console.log(`🔄 Cache refreshed: ${productsCache.length} products`);
    } catch (error) {
        console.error('❌ Failed to refresh cache:', error.message);
    }
}

// ============================================
// API Routes
// ============================================

// Get all products
router.get('/', async (req, res) => {
    try {
        // Try to use cache, if not loaded load from DB directly
        let allProducts;

        if (cacheLoaded && productsCache.length > 0) {
            allProducts = productsCache;
        } else {
            // Load from database directly
            allProducts = await Product.find({}).sort({ createdAt: -1 }).lean();
            // Update cache for next time
            productsCache = allProducts;
            cacheLoaded = true;
        }

        const { category, status, search } = req.query;
        let results = [...allProducts];

        // Filter by category
        if (category && category !== 'all') {
            results = results.filter(p => p.category === category);
        }

        // Filter by status
        if (status && status !== 'all') {
            results = results.filter(p => p.status === status);
        }

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            results = results.filter(p =>
                p.name && p.name.toLowerCase().includes(searchLower)
            );
        }

        res.json(results);
    } catch (error) {
        console.error('❌ Error fetching products:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        // Try to find in cache first
        if (productsCache) {
            const cached = productsCache.find(p =>
                p._id.toString() === req.params.id
            );
            if (cached) {
                return res.json(cached);
            }
        }

        // Fallback to database
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create product - Updates cache immediately
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();

        // Refresh cache in background
        refreshCache();

        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update product - Updates cache immediately
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Refresh cache in background
        refreshCache();

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product - Updates cache immediately
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Refresh cache in background
        refreshCache();

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Manual cache refresh endpoint (for admin use)
router.post('/refresh-cache', async (req, res) => {
    try {
        await loadCache();
        res.json({
            message: 'Cache refreshed successfully',
            count: productsCache.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
