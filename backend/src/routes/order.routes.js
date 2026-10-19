import express from 'express';
import {
    getOrders,
    getMyDeliveryOrders,
    assignDelivery,
    updateOrderStatus,
    addOrderItems,
    getMyOrders,
    getOrderById,
    getOrderByPhone
} from '../controllers/order.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/delivery')
    .get(protect, getMyDeliveryOrders);

router.route('/:id/assign')
    .put(protect, admin, assignDelivery);

router.route('/:id/status')
    .put(protect, updateOrderStatus); // Delivery agent logic is inside the controller

router.route('/myorders')
    .get(protect, getMyOrders);

router.route('/phone/:phone')
    .get(getOrderByPhone);

router.route('/:id')
    .get(getOrderById);

export default router;
