import express from 'express';
import {
    createPayment,
    processPayment,
    getMyPayments,
    getAllPayments
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
    .post(protect, createPayment)
    .get(protect, admin, getAllPayments);

router.route('/my').get(protect, getMyPayments);

router.route('/:id/process').post(protect, processPayment);

export default router;
