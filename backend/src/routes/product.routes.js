import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview
} from '../controllers/product.controller.js';
import { protect, adminOrAssistant } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, adminOrAssistant, createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, adminOrAssistant, updateProduct)
    .delete(protect, adminOrAssistant, deleteProduct);

router.route('/:id/reviews').post(protect, createProductReview);

export default router;