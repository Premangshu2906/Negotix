import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import offerRoutes from './routes/offers';
import userRoutes from './routes/users';
import uploadRoutes from './routes/uploads';
import supportRoutes from './routes/support';
import path from 'path';

dotenv.config();

import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded local images statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/support', supportRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // We'll restrict this in prod
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

export { io };

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
