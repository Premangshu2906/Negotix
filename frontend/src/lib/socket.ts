import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
        });

        socket.on('connect', () => {
            console.log('Connected to WebSocket server:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
    }
    return socket;
};
