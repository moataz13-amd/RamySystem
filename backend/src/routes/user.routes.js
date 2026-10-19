import express from 'express';
import {
    getAdmins,
    createAdmin,
    updateUserPassword,
    getDeliveryAgents,
    createDeliveryAgent,
    getAssistants,
    createAssistant,
    deleteUser
} from '../controllers/user.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/delivery')
    .get(protect, admin, getDeliveryAgents)
    .post(protect, admin, createDeliveryAgent);

router.route('/assistant')
    .get(protect, admin, getAssistants)
    .post(protect, admin, createAssistant);

router.route('/admin')
    .get(protect, admin, getAdmins)
    .post(protect, admin, createAdmin);

router.route('/:id/password')
    .put(protect, admin, updateUserPassword);

router.route('/:id')
    .delete(protect, admin, deleteUser);

export default router;
