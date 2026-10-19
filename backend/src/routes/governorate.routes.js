import express from 'express';
import { getGovernorates, updateGovernorate } from '../controllers/governorate.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(getGovernorates); // Public, used in checkout

router.route('/:id')
    .put(protect, admin, updateGovernorate);

export default router;
