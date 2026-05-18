import express from 'express';
import cors from 'cors';
import http from 'http';
import compression from 'compression';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db';
import routes from './routes';
import { seedAdmin } from './utils/seed';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// @ts-ignore
global.io = io;

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// API Routes
app.use('/api', routes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = Number(process.env.PORT) || 3001;

const startServer = async () => {
    try {
        console.log('🏁 Starting Dream Live Backend...');
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'not set'}`);
        console.log(`🔌 Port: ${PORT}`);

        console.log('🔄 Step 1: Connecting to Database...');
        await connectDB();

        console.log('🔄 Step 2: Running Admin Seeder...');
        await seedAdmin();

        console.log('🔄 Step 3: Starting HTTP Server...');
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Dream Live Backend v2 Running on port ${PORT}`);
            console.log(`📡 Real-time Socket.IO enabled`);
        });
    } catch (error: any) {
        console.error('❌ CRITICAL ERROR during server startup:');
        console.error(error);
        process.exit(1);
    }
};

io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

startServer();
