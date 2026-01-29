import { Document, Application } from '../models/index.js';

import path from 'path';

// @desc    Upload a document
// @route   POST /api/documents
// @access  Private (Student)
export const uploadDocument = async (req, res) => {
    try {
        const { applicationId, type } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Check if user owns application
        if (application.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Create Document record
        const document = await Document.create({
            applicationId,
            type,
            url: file.path,
            status: 'PENDING'
        });



        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify document (Admin)
// @route   PUT /api/documents/:id/verify
// @access  Private (Admin)
export const verifyDocument = async (req, res) => {
    const { status, adminComments } = req.body;

    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        document.status = status;
        if (adminComments) {
            document.adminComments = adminComments;
        }

        await document.save();

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
