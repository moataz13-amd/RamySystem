import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

const defaultCategories = [
    { nameEn: 'Sunglasses', nameAr: 'نظارات شمسية' },
    { nameEn: 'Eyeglasses', nameAr: 'نظارات طبية' },
    { nameEn: 'Reading Glasses', nameAr: 'نظارات قراءة' },
    { nameEn: 'Contact Lenses', nameAr: 'عدسات لاصقة' },
];

// GET /api/v1/categories — seeds defaults if DB is empty
router.get('/', async (req, res) => {
    try {
        let categories = await Category.find({ isActive: true });
        if (categories.length === 0) {
            categories = await Category.insertMany(
                defaultCategories.map(c => ({ ...c, isActive: true }))
            );
        }
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/v1/categories — Admin: create
router.post('/', protect, admin, async (req, res) => {
    try {
        const { nameEn, nameAr, image } = req.body;
        const category = await Category.create({ nameEn, nameAr, image: image || '', isActive: true });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/v1/categories/:id — Admin: update
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/v1/categories/:id — Admin: delete (soft delete)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/v1/categories/newest — last 3 products added
router.get('/newest', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .populate('category')
            .sort({ createdAt: -1 })
            .limit(3);
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/v1/categories/bestsellers — top 4 by order count (auto) + manual bestSeller flag
router.get('/bestsellers', async (req, res) => {
    try {
        // Get products manually marked as bestSeller
        const manualBest = await Product.find({ bestSeller: true, isActive: true }).populate('category').limit(4);
        if (manualBest.length >= 4) {
            return res.json({ success: true, data: manualBest });
        }

        // Auto: count how many times each product appears in orders
        const pipeline = [
            { $unwind: '$orderItems' },
            { $group: { _id: '$orderItems.product', totalOrdered: { $sum: '$orderItems.quantity' } } },
            { $sort: { totalOrdered: -1 } },
            { $limit: 8 }
        ];
        const topOrdered = await Order.aggregate(pipeline);
        const topIds = topOrdered.map(t => t._id).filter(Boolean);

        const autoProducts = await Product.find({ _id: { $in: topIds }, isActive: true }).populate('category');
        // Sort by order count
        const sorted = autoProducts.sort((a, b) => {
            const aCount = topOrdered.find(t => t._id?.toString() === a._id.toString())?.totalOrdered || 0;
            const bCount = topOrdered.find(t => t._id?.toString() === b._id.toString())?.totalOrdered || 0;
            return bCount - aCount;
        });

        // Merge manual + auto, no duplicates
        const manualIds = new Set(manualBest.map(p => p._id.toString()));
        const combined = [...manualBest, ...sorted.filter(p => !manualIds.has(p._id.toString()))].slice(0, 4);

        res.json({ success: true, data: combined });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
