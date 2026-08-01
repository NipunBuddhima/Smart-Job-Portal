"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCompanyLogo = exports.uploadUserResume = exports.uploadUserAvatar = exports.updateProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const cloudinary_1 = require("../utils/cloudinary");
const errorHandler_1 = require("../middleware/errorHandler");
const profile_validators_1 = require("../validators/profile.validators");
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
const updateProfile = async (req, res, next) => {
    try {
        const validationResult = req.user.role === 'employer'
            ? (0, profile_validators_1.validateEmployerProfileUpdate)(req.body)
            : (0, profile_validators_1.validateCandidateProfileUpdate)(req.body);
        if (validationResult.errors.length) {
            return next(new errorHandler_1.AppError(validationResult.errors.join(' '), 400));
        }
        const user = await User_1.default.findByIdAndUpdate(req.user.id, validationResult.value, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, user: buildUserResponse(user) });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const uploadUserAvatar = async (req, res, next) => {
    try {
        if (!req.file)
            return next(new errorHandler_1.AppError('Please upload an image', 400));
        const avatarUrl = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'job_portal/avatars', 'image');
        const user = await User_1.default.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true, runValidators: true });
        res.status(200).json({ success: true, avatarUrl: user?.avatar, user: buildUserResponse(user) });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadUserAvatar = uploadUserAvatar;
const uploadUserResume = async (req, res, next) => {
    try {
        if (!req.file)
            return next(new errorHandler_1.AppError('Please upload a PDF document', 400));
        // resourceType 'raw' is required in Cloudinary for PDFs/Docs
        const resumeUrl = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'job_portal/resumes', 'raw');
        const user = await User_1.default.findByIdAndUpdate(req.user.id, { resume: resumeUrl }, { new: true, runValidators: true });
        res.status(200).json({ success: true, resumeUrl: user?.resume, user: buildUserResponse(user) });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadUserResume = uploadUserResume;
const uploadCompanyLogo = async (req, res, next) => {
    try {
        if (!req.file)
            return next(new errorHandler_1.AppError('Please upload an image', 400));
        const logoUrl = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'job_portal/company-logos', 'image');
        const user = await User_1.default.findByIdAndUpdate(req.user.id, { companyLogo: logoUrl }, { new: true, runValidators: true });
        res.status(200).json({ success: true, companyLogoUrl: user?.companyLogo, user: buildUserResponse(user) });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadCompanyLogo = uploadCompanyLogo;
//# sourceMappingURL=user.controller.js.map