import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { verifyExternalServices } from './utils/serviceVerification.js';
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';


import universityRoutes from './routes/universityRoutes.js';
import programRoutes from './routes/programRoutes.js';
import academicRecordRoutes from './routes/academicRecordRoutes.js';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS Configuration - supports both development and production
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000'
    ];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Basic Route for Health Check
app.get('/', (req, res) => {
    res.send('UniApply API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);


app.use('/api/universities', universityRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/academic-records', academicRecordRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start Server
const startServer = async () => {
    // Connect to mongoDB
    await connectDB();

    // Verify External Services
    await verifyExternalServices();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();
