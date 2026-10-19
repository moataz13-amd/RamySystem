import express from 'express';
import {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
} from '../controllers/coupon.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public — validate coupon during checkout
router.post('/validate', validateCoupon);

// Admin only
router.route('/')
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

router.route('/:id')
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

export default router;
