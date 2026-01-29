import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    ranking: {
        type: Number
    },
    logoColor: {
        type: String,
        default: 'bg-blue-100 text-blue-700'
    },
    description: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

universitySchema.virtual('programs', {
    ref: 'Program',
    localField: '_id',
    foreignField: 'universityId'
});

const University = mongoose.model('University', universitySchema);
export default University;
