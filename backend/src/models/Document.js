import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
    },

    adminComments: {
        type: String
    }
}, {
    timestamps: true
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
