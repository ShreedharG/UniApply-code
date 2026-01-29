import { Application, User, Document } from '../models/index.js';

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private (Student)
export const createApplication = async (req, res) => {
    try {
        const { universityName, programName, personalDetails } = req.body;

        const application = await Application.create({
            userId: req.user.id,
            universityName,
            programName,
            personalDetails,
            status: 'DRAFT'
        });



        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all applications for logged in student
// @route   GET /api/applications/my
// @access  Private (Student)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            where: { userId: req.user.id },
            include: [{ model: Document }]
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications
// @access  Private (Admin)
export const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Document }
            ]
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findByPk(req.params.id, {
            include: [
                { model: Document },
                { model: User, attributes: ['name', 'email'] }
            ]
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check ownership or admin
        if (req.user.role !== 'ADMIN' && application.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Admin)
export const updateApplicationStatus = async (req, res) => {
    const { status, adminComments } = req.body;

    try {
        const application = await Application.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        if (adminComments) {
            application.adminComments = adminComments;
        }

        await application.save();



        res.json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Private (Student)
export const withdrawApplication = async (req, res) => {
    try {
        const application = await Application.findByPk(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check ownership
        if (application.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to withdraw this application' });
        }

        // Check if already processed or fee paid
        if (application.feePaid) {
            return res.status(400).json({ message: 'Cannot withdraw application after fee payment' });
        }

        if (application.status === 'REJECTED') {
            return res.status(400).json({ message: 'Cannot withdraw a rejected application' });
        }

        // Delete the application
        await application.destroy();



        res.json({ message: 'Application withdrawn and deleted successfully' });
    } catch (error) {
        console.error('SERVER ERROR in withdrawApplication:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
