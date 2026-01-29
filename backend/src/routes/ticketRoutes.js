import express from 'express';
import {
    createTicket,
    getMyTickets,
    getAllTickets,
    getTicketById,
    respondToTicket,
    updateTicketStatus
} from '../controllers/ticketController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
    .post(protect, createTicket)
    .get(protect, admin, getAllTickets);

router.route('/my').get(protect, getMyTickets);

router.route('/:id')
    .get(protect, getTicketById);

router.route('/:id/respond')
    .put(protect, admin, respondToTicket);

router.route('/:id/status')
    .put(protect, updateTicketStatus);

export default router;
