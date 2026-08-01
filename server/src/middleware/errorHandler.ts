import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Custom error class to distinguish operational errors from programming bugs
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates this is an expected error (e.g., validation failure)

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Catch Mongoose Schema Validation Errors
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    // Catch invalid MongoDB ObjectIDs
    statusCode = 400;
    message = 'Resource not found';
  }

  // Log the error
  if (statusCode >= 500) {
    logger.error('Unexpected Error:', err);
  } else {
    logger.warn(`Operational Error: ${message}`, { url: req.originalUrl, method: req.method });
  }

  // Send consistent JSON response to the client
  res.status(statusCode).json({
    success: false,
    message,
    // Only leak stack traces in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error); // Pass to the global errorHandler
};