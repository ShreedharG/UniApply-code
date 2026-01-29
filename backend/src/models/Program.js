import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
    universityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    eligibility: {
        type: Object
    }
}, {
    timestamps: true
});

const Program = mongoose.model('Program', programSchema);
export default Program;
