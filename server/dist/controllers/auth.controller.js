"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const buildUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    resume: user.resume,
    skills: user.skills ?? [],
    education: user.education ?? [],
    experience: user.experience ?? [],
    socialLinks: user.socialLinks ?? {},
    companyName: user.companyName ?? '',
    companyDescription: user.companyDescription ?? '',
    website: user.website ?? '',
    companyLogo: user.companyLogo ?? '',
});
const sendTokenResponse = (user, statusCode, res) => {
    const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(user._id, user.role);
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };
    res
        .status(statusCode)
        .cookie('accessToken', accessToken, { ...options, maxAge: 15 * 60 * 1000 }) // 15 mins
        .cookie('refreshToken', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
        .json({
        success: true,
        user: buildUserResponse(user),
    });
};
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedName = typeof name === 'string' ? name.trim() : '';
        const normalizedRole = role === 'employer' ? 'employer' : 'candidate';
        if (!normalizedName || !normalizedEmail || !password) {
            return next(new errorHandler_1.AppError('Please provide name, email, and password', 400));
        }
        const existingUser = await User_1.default.findOne({ email: normalizedEmail });
        if (existingUser) {
            return next(new errorHandler_1.AppError('Email already in use', 400));
        }
        const user = await User_1.default.create({
            name: normalizedName,
            email: normalizedEmail,
            password,
            role: normalizedRole,
        });
        sendTokenResponse(user, 201, res);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalizedEmail || !password) {
            return next(new errorHandler_1.AppError('Please provide an email and password', 400));
        }
        // Select password since it's hidden by default in the schema
        const user = await User_1.default.findOne({ email: normalizedEmail }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return next(new errorHandler_1.AppError('Invalid credentials', 401));
        }
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };
    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        res.status(200).json({
            success: true,
            user: buildUserResponse(user),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map