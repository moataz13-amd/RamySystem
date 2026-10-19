import express from 'express';
import { authUser, registerUser, getUserProfile, updatePassword } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile/password', protect, updatePassword);

export default router;
