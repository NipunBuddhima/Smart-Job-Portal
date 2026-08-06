import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/db';
import logger from './utils/logger';
import http from 'http';
import { initSocket } from './utils/socket';

// Load environment variables immediately
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to the database before starting the server
const startServer = async () => {
  await connectDB();

 // Create HTTP server wrapping the Express app
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

connectDB().then(() => {
  // Listen on the HTTP server, NOT the Express app
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

  // Catch unhandled promise rejections (e.g., bad DB credentials)
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`UNHANDLED REJECTION! 💥 Shutting down gracefully...`);
    logger.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
  
  // Catch synchronous exceptions that crash the Node process
  process.on('uncaughtException', (err: Error) => {
    logger.error(`UNCAUGHT EXCEPTION! 💥 Shutting down immediately...`);
    logger.error(err.name, err.message);
    process.exit(1);
  });
};

startServer();