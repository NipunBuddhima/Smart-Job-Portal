"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
// Custom error class to distinguish operational errors from programming bugs
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Indicates this is an expected error (e.g., validation failure)
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.name === 'ValidationError') {
        // Catch Mongoose Schema Validation Errors
        statusCode = 400;
        message = err.message;
    }
    else if (err.name === 'CastError') {
        // Catch invalid MongoDB ObjectIDs
        statusCode = 400;
        message = 'Resource not found';
    }
    // Log the error
    if (statusCode >= 500) {
        logger_1.default.error('Unexpected Error:', err);
    }
    else {
        logger_1.default.warn(`Operational Error: ${message}`, { url: req.originalUrl, method: req.method });
    }
    // Send consistent JSON response to the client
    res.status(statusCode).json({
        success: false,
        message,
        // Only leak stack traces in development mode
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
    next(error); // Pass to the global errorHandler
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map