import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxUses, expiryDate } = req.body;
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderValue: minOrderValue || 0,
            maxUses: maxUses || 0,
            expiryDate: expiryDate || null,
        });
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle coupon active state
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
        res.json({ success: true, data: coupon });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate/apply coupon (customer)
// @route   POST /api/v1/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: 'كود الخصم غير صحيح أو منتهي الصلاحية' });
        }

        // Check expiry
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'انتهت صلاحية كود الخصم' });
        }

        // Check max uses
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ message: 'تم استنفاد عدد مرات استخدام هذا الكود' });
        }

        // Check min order
        if (orderTotal < coupon.minOrderValue) {
            return res.status(400).json({
                message: `الحد الأدنى للطلب هو ${coupon.minOrderValue} ج.م`
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderTotal * coupon.discountValue) / 100;
        } else {
            discountAmount = Math.min(coupon.discountValue, orderTotal);
        }

        res.json({
            success: true,
            data: {
                couponId: coupon._id,
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount: Math.round(discountAmount * 100) / 100,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
