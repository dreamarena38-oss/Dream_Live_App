import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ CRITICAL: MONGODB_URI is not defined in environment variables!');
            process.exit(1);
        }

        const maskedUri = mongoUri.replace(/\/\/.*:.*@/, '//****:****@');
        console.log(`🔌 Attempting to connect to MongoDB: ${maskedUri}`);

        // Set connection timeout to 10 seconds to fail faster if whitelisting is the issue
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
            minPoolSize: 10,
        });

        console.log('✅ MongoDB connected successfully to Dream Live cluster');
    } catch (error: any) {
        console.error('❌ MongoDB connection error details:');
        console.error(`- Message: ${error.message}`);
        console.error(`- Code: ${error.code}`);
        if (error.message.includes('MongooseServerSelectionError')) {
            console.error('💡 TIP: This often means your IP is not whitelisted in MongoDB Atlas. For Render, you must allow access from 0.0.0.0/0.');
        }
        process.exit(1);
    }
};

export default connectDB;
