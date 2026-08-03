"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.attachOptionalUser = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("./errorHandler");
const protect = async (req, res, next) => {
    try {
        const currentUser = await resolveUserFromRequest(req);
        if (!currentUser) {
            return next(new errorHandler_1.AppError('The user belonging to this token no longer exists.', 401));
        }
        req.user = currentUser;
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError('Invalid or expired token', 401));
    }
};
exports.protect = protect;
const resolveUserFromRequest = async (req) => {
    let token;
    if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return null;
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const currentUser = await User_1.default.findById(decoded.id);
    return currentUser || null;
};
const attachOptionalUser = async (req, _res, next) => {
    try {
        req.user = await resolveUserFromRequest(req);
    }
    catch {
        req.user = undefined;
    }
    next();
};
exports.attachOptionalUser = attachOptionalUser;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError(`Role ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map