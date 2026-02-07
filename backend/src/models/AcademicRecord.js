import mongoose from 'mongoose';
import User from './User.js';

const academicRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    type: {
        type: String,
        enum: ['10TH_MARKSHEET', '12TH_MARKSHEET'],
        required: true
    },

    documentUrl: {
        type: String,
        required: true
    },

    fileName: String,

    board: {
        type: String
    },

    uploadedAt: {
        type: Date,
        default: Date.now
    },

    percentage: {
        type: Number,
        default: 0
    },

    subjects: [{
        subject: { type: String, required: true },
        theoryMarks: { type: Number, default: null },
        practicalMarks: { type: Number, default: null },
        totalMarks: { type: Number, default: null },
        marks: { type: Number, required: true } // Keeping for backward compatibility or as the primary 'obtained' mark
    }],

    additionalSubjects: [{
        subject: { type: String },
        totalMarks: { type: Number }
    }],

    /* ==============================
       ✅ Minimal AI Processing Fields
       ============================== */

    processingStatus: {
        type: String,
        enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'],
        default: 'UPLOADED',
        index: true
    },

    aiScoreVerification: {
        confidenceScore: { type: Number },

        status: {
            type: String,
            enum: ['PASS', 'FLAGGED', 'FAIL', 'PENDING'],
            default: 'PENDING'
        },

        flags: [String],

        extractedData: {
            rawText: String,
            detectedBoard: String,
            llmObject: mongoose.Schema.Types.Mixed
        },

        verificationDate: { type: Date }
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/* ==============================
   Indexes
   ============================== */

academicRecordSchema.index({ userId: 1, type: 1 }, { unique: true });

/* ==============================
   Enforce student-only records
   ============================== */

academicRecordSchema.pre('save', async function () {
    if (this.isNew || this.isModified('userId')) {
        const user = await User.findById(this.userId);
        if (!user || user.role !== 'STUDENT') {
            throw new Error('Academic records can only be created for students');
        }
    }
});

/* ==============================
   Process AI result (minimal)
   ============================== */

academicRecordSchema.methods.processAIResult = async function (aiData) {
    const {
        confidenceScore,
        extractedSubjects,
        rawText,
        detectedBoard,
        llmObject
    } = aiData;

    this.processingStatus = 'COMPLETED';

    this.aiScoreVerification = {
        confidenceScore,
        verificationDate: new Date(),
        flags: [],
        extractedData: {
            rawText: rawText || '',
            detectedBoard: detectedBoard || '',
            llmObject: llmObject || {}
        },
        status: 'FAIL'
    };

    if (confidenceScore >= 80) {
        this.aiScoreVerification.status = 'PASS';
        this.subjects = extractedSubjects || [];
        this.board = detectedBoard || this.board;
        this.calculatePercentage();

    } else if (confidenceScore >= 60) {
        this.aiScoreVerification.status = 'FLAGGED';
        this.aiScoreVerification.flags.push('Low Confidence Score');
        this.subjects = extractedSubjects || [];
        this.board = detectedBoard || this.board;
        this.calculatePercentage();

    } else {
        this.aiScoreVerification.flags.push('Extraction Failed - Low Confidence');
        this.subjects = [];
        this.percentage = 0;
    }

    return await this.save();
};

/* ==============================
   Percentage helper
   ============================== */

academicRecordSchema.methods.calculatePercentage = function () {
    if (!this.subjects || this.subjects.length === 0) {
        this.percentage = 0;
        return;
    }

    const totalMarks = this.subjects.reduce((sum, sub) => sum + sub.marks, 0);
    this.percentage = Number((totalMarks / this.subjects.length).toFixed(2));
};

const AcademicRecord = mongoose.model('AcademicRecord', academicRecordSchema);
export default AcademicRecord;
