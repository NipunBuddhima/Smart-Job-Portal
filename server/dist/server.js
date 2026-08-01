"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const logger_1 = __importDefault(require("./utils/logger"));
// Load environment variables immediately
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
// Connect to the database before starting the server
const startServer = async () => {
    await (0, db_1.connectDB)();
    const server = app_1.default.listen(PORT, () => {
        logger_1.default.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
    // Catch unhandled promise rejections (e.g., bad DB credentials)
    process.on('unhandledRejection', (err) => {
        logger_1.default.error(`UNHANDLED REJECTION! 💥 Shutting down gracefully...`);
        logger_1.default.error(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });
    // Catch synchronous exceptions that crash the Node process
    process.on('uncaughtException', (err) => {
        logger_1.default.error(`UNCAUGHT EXCEPTION! 💥 Shutting down immediately...`);
        logger_1.default.error(err.name, err.message);
        process.exit(1);
    });
};
startServer();
//# sourceMappingURL=server.js.map