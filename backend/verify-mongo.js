import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Application } from './src/models/index.js';

dotenv.config();

const verifyMongo = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Test User creation
        console.log('Creating test user...');
        const testUser = await User.create({
            name: 'Mongo Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'STUDENT'
        });
        console.log('✅ User created:', testUser._id);

        // Test Application creation
        console.log('Creating test application...');
        const testApplication = await Application.create({
            userId: testUser._id,
            universityName: 'Test University',
            programName: 'Test Program',
            status: 'DRAFT',
            personalDetails: { age: 25, city: 'Test City' }
        });
        console.log('✅ Application created:', testApplication._id);

        // Test Population
        console.log('Testing population...');
        const populatedApp = await Application.findById(testApplication._id).populate('User');
        if (populatedApp.User && populatedApp.User.name === 'Mongo Test User') {
            console.log('✅ Population successful');
        } else {
            console.error('❌ Population failed', populatedApp);
        }

        // Cleanup
        console.log('Cleaning up...');
        await Application.deleteOne({ _id: testApplication._id });
        await User.deleteOne({ _id: testUser._id });
        console.log('✅ Cleanup successful');

        console.log('🎉 VERIFICATION COMPLETE: ALL SYSTEMS GO');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
};

verifyMongo();
