import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    category: {
        type: String,
        enum: ['DOCUMENT_ISSUE', 'PAYMENT', 'APPLICATION_STATUS', 'TECHNICAL', 'OTHER'],
        default: 'OTHER'
    },
    adminResponse: {
        type: String
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ticketSchema.virtual('User', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

ticketSchema.virtual('Application', {
    ref: 'Application',
    localField: 'applicationId',
    foreignField: '_id',
    justOne: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
