"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const app = (0, express_1.default)();
// Secure HTTP headers
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
// Enable Cross-Origin Resource Sharing
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Adjust for Vite's default port
    credentials: true, // Required for HTTP-only cookies
}));
// Body parsers for JSON and URL-encoded payloads
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
app.use('/uploads', express_1.default.static('uploads'));
// Pipe Morgan's HTTP request logs into Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use((0, morgan_1.default)(morganFormat, {
    stream: {
        write: (message) => logger_1.default.http(message.trim()),
    },
}));
// Sanity check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running successfully.' });
});
// TODO: Mount Feature Routes Here
// e.g., app.use('/api/auth', authRoutes);
// e.g., app.use('/api/jobs', jobRoutes);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/applications', application_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// Catch-all route for undefined endpoints
app.use(errorHandler_1.notFoundHandler);
// Centralized error handling (Must be the very last middleware)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map