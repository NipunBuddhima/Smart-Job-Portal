"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNotification = exports.sendRealTimeNotification = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const userSockets = new Map(); // Maps userId to socketId
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // When a user logs in or opens the app, they send their ID to the socket
        socket.on('register_user', (userId) => {
            userSockets.set(userId, socket.id);
            socket.join('authenticated_users'); // Global room for all logged-in users
        });
        socket.on('disconnect', () => {
            // Remove user from map on disconnect
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });
};
exports.initSocket = initSocket;
// Utility to send a notification to a specific user
const sendRealTimeNotification = (userId, notification) => {
    if (io) {
        const socketId = userSockets.get(userId.toString());
        if (socketId) {
            io.to(socketId).emit('new_notification', notification);
        }
    }
};
exports.sendRealTimeNotification = sendRealTimeNotification;
// Utility to broadcast to all users (e.g., New Job Posted)
const broadcastNotification = (notification) => {
    if (io) {
        io.to('authenticated_users').emit('new_notification', notification);
    }
};
exports.broadcastNotification = broadcastNotification;
//# sourceMappingURL=socket.js.map