"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
// Custom log format for readability
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(errors({ stack: true }), // Ensure stack traces are captured for errors
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [
        // Output all logs to the console
        new winston_1.default.transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
});
// In production, write logs to files for persistence
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }));
    logger.add(new winston_1.default.transports.File({ filename: 'logs/combined.log' }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map