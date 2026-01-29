import { Ticket, User, Application } from '../models/index.js';

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (Student)
export const createTicket = async (req, res) => {
    try {
        const { applicationId, subject, description, category, priority } = req.body;

        const ticket = await Ticket.create({
            userId: req.user.id,
            applicationId,
            subject,
            description,
            category: category || 'OTHER',
            priority: priority || 'MEDIUM',
            status: 'OPEN'
        });



        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all tickets for logged in user
// @route   GET /api/tickets/my
// @access  Private (Student)
export const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Application, attributes: ['id', 'universityName', 'programName'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets
// @access  Private (Admin)
export const getAllTickets = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const tickets = await Ticket.findAll({
            where,
            include: [
                { model: User, as: 'User', attributes: ['id', 'name', 'email'] },
                { model: Application, attributes: ['id', 'universityName', 'programName'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id, {
            include: [
                { model: User, as: 'User', attributes: ['name', 'email'] },
                { model: Application, attributes: ['universityName', 'programName'] }
            ]
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Check ownership or admin
        if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Respond to ticket (Admin)
// @route   PUT /api/tickets/:id/respond
// @access  Private (Admin)
export const respondToTicket = async (req, res) => {
    const { response, status } = req.body;

    try {
        const ticket = await Ticket.findByPk(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.adminResponse = response;
        ticket.respondedBy = req.user.id;
        ticket.respondedAt = new Date();

        if (status) {
            ticket.status = status;
        } else {
            ticket.status = 'IN_PROGRESS';
        }

        await ticket.save();



        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private (Admin or Owner)
export const updateTicketStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const ticket = await Ticket.findByPk(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Allow owner to close their own tickets
        if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        ticket.status = status;
        await ticket.save();



        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
