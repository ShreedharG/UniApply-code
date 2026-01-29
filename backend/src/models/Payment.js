import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    type: {
        type: String,
        enum: ['APPLICATION_FEE', 'ISSUE_RESOLUTION_FEE'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentGatewayResponse: {
        type: Object
    },
    paidAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

paymentSchema.virtual('User', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

paymentSchema.virtual('Application', {
    ref: 'Application',
    localField: 'applicationId',
    foreignField: '_id',
    justOne: true
});

paymentSchema.virtual('Ticket', {
    ref: 'Ticket',
    localField: 'ticketId',
    foreignField: '_id',
    justOne: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
