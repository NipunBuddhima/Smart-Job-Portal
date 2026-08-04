"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const errorHandler_1 = require("./errorHandler");
const storage = multer_1.default.memoryStorage();
const allowedResumeMimeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
]);
const allowedResumeExtensions = new Set(['.pdf', '.doc', '.docx']);
const isAllowedResumeFile = (file) => {
    const originalName = file.originalname.toLowerCase();
    return (allowedResumeMimeTypes.has(file.mimetype) ||
        Array.from(allowedResumeExtensions).some((extension) => originalName.endsWith(extension)));
};
// Filter for Avatar (Images only)
exports.uploadAvatar = (0, multer_1.default)({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/'))
            cb(null, true);
        else
            cb(new errorHandler_1.AppError('Only image files are allowed!', 400));
    },
});
// Filter for Resume (PDFs only)
exports.uploadResume = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (isAllowedResumeFile(file))
            cb(null, true);
        else
            cb(new errorHandler_1.AppError('Only PDF, DOC, or DOCX files are allowed!', 400));
    },
});
//# sourceMappingURL=upload.middleware.js.map