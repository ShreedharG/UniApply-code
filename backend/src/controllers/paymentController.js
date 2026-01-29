import { Payment, Application, Ticket } from '../models/index.js';

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
    try {
        const { applicationId, ticketId, amount, type } = req.body;

        const payment = await Payment.create({
            userId: req.user.id,
            applicationId,
            ticketId,
            amount,
            type,
            status: 'PENDING',
            currency: 'INR'
        });

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Process payment (Mock Payment Gateway)
// @route   POST /api/payments/:id/process
// @access  Private
export const processPayment = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Mock payment processing - In real app, integrate Razorpay/Stripe
        const mockTransactionId = `TXN${Date.now()}${Math.random().toString(36).substring(7)}`;

        payment.status = 'COMPLETED';
        payment.transactionId = mockTransactionId;
        payment.paymentMethod = 'UPI'; // Mock
        payment.paidAt = new Date();
        payment.paymentGatewayResponse = {
            success: true,
            transactionId: mockTransactionId,
            gateway: 'MOCK_GATEWAY'
        };

        await payment.save();

        // Update application/ticket status based on payment type
        if (payment.type === 'APPLICATION_FEE' && payment.applicationId) {
            const application = await Application.findByPk(payment.applicationId);
            if (application) {
                application.status = 'PAYMENT_RECEIVED';
                await application.save();
            }
        }

        if (payment.type === 'ISSUE_RESOLUTION_FEE' && payment.ticketId) {
            const ticket = await Ticket.findByPk(payment.ticketId);
            if (ticket) {
                ticket.status = 'IN_PROGRESS';
                await ticket.save();
            }
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's payments
// @route   GET /api/payments/my
// @access  Private
export const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Application, attributes: ['universityName', 'programName'] },
                { model: Ticket, attributes: ['subject'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [
                { model: Application },
                { model: Ticket }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
