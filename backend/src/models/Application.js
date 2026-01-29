import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    universityName: {
        type: String,
        required: true
    },
    programName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['DRAFT', 'SUBMITTED', 'ISSUE_RAISED', 'VERIFIED', 'REJECTED', 'WITHDRAWN'],
        default: 'DRAFT'
    },
    personalDetails: {
        type: Object
    },
    adminComments: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

applicationSchema.virtual('documents', {
    ref: 'Document',
    localField: '_id',
    foreignField: 'applicationId'
});

applicationSchema.virtual('User', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
