import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

let io: SocketIOServer;
const userSockets = new Map<string, string>(); // Maps userId to socketId

export const initSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // When a user logs in or opens the app, they send their ID to the socket
    socket.on('register_user', (userId: string) => {
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

// Utility to send a notification to a specific user
export const sendRealTimeNotification = (userId: string, notification: any) => {
  if (io) {
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('new_notification', notification);
    }
  }
};

// Utility to broadcast to all users (e.g., New Job Posted)
export const broadcastNotification = (notification: any) => {
  if (io) {
    io.to('authenticated_users').emit('new_notification', notification);
  }
};