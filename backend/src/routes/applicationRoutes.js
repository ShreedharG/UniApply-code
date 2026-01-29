import express from 'express';
import {
    createApplication,
    getMyApplications,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    withdrawApplication
} from '../controllers/applicationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
    .post(protect, createApplication)
    .get(protect, admin, getAllApplications);

router.route('/my').get(protect, getMyApplications);

router.route('/:id')
    .get(protect, getApplicationById);

router.route('/:id/status')
    .put(protect, admin, updateApplicationStatus);

router.route('/:id/withdraw')
    .put(protect, withdrawApplication);

export default router;
