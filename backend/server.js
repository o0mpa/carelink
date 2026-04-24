import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import requestRoutes from './src/routes/requestRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import clientRoutes from './src/routes/clientRoutes.js';
import caregiverRoutes from './src/routes/caregiverRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import emergencyRoutes from './src/routes/emergencyRoutes.js';
import calendarRoutes from './src/routes/calendarRoutes.js';

import { Server } from 'socket.io';
import http from 'http';

import fs from 'fs';

const uploadDirs = [
    'uploads/caregivers',
    'uploads/clients'
];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
        console.log(`Created Directory: ${dir}`)
    }
});


dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // This is the default port for Vite/React
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/calendar', calendarRoutes);

//socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin:      'http://localhost:5173',
        methods:     ['GET', 'POST'],
        credentials: true,
    },
});

// userId → socketId map
const onlineUsers = new Map();
 
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Frontend emits this right after connecting: socket.emit('register', userId)
    socket.on('register', (userId) => {
        onlineUsers.set(String(userId), socket.id);
    });

    // CHAT FLOW: frontend must first call GET /api/requests/:requestId/chat-access
    // to verify both parties are allowed to chat (request must be Accepted).
    // If allowed, it gets the otherUserId — then uses that as data.receiverId here.
    //
    // data: { senderId, receiverId, message, requestId }
    socket.on('sendMessage', (data) => {
        const receiverSocketId = onlineUsers.get(String(data.receiverId));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', data);
        }
        socket.emit('messageSent', { success: true, data });
    });

    socket.on('disconnect', () => {
        for (const [userId, sid] of onlineUsers.entries()) {
            if (sid === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log(`Server has started on port: ${PORT}`));