import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app: Application = express();


// Secure HTTP headers
app.use(helmet());
app.use(cookieParser());

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Adjust for Vite's default port
  credentials: true, // Required for HTTP-only cookies
}));

// Body parsers for JSON and URL-encoded payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Pipe Morgan's HTTP request logs into Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

// Sanity check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API is running successfully.' });
});

// TODO: Mount Feature Routes Here
// e.g., app.use('/api/auth', authRoutes);
// e.g., app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Catch-all route for undefined endpoints
app.use(notFoundHandler);

// Centralized error handling (Must be the very last middleware)
app.use(errorHandler);

export default app;