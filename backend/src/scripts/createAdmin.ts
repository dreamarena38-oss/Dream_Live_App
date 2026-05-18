import dotenv from 'dotenv';
import connectDB from '../config/db';
import { seedAdmin } from '../utils/seed';

dotenv.config();

const runSeeder = async () => {
    try {
        await connectDB();
        await seedAdmin();
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

runSeeder();
