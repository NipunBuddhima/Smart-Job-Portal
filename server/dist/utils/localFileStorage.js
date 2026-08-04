"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUploadedFileLocally = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const sanitizeFileName = (fileName) => fileName
    .trim()
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/_+/g, '_');
const saveUploadedFileLocally = async (fileBuffer, folder, originalFilename, userId) => {
    const targetDir = path_1.default.resolve(__dirname, '../../uploads', folder.replace('job_portal/', ''));
    await promises_1.default.mkdir(targetDir, { recursive: true });
    const safeOriginalName = sanitizeFileName(originalFilename || 'resume.pdf');
    const uniqueFileName = `${Date.now()}-${userId ?? 'user'}-${safeOriginalName}`;
    const filePath = path_1.default.join(targetDir, uniqueFileName);
    await promises_1.default.writeFile(filePath, fileBuffer);
    const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${folder.replace('job_portal/', '')}/${uniqueFileName}`;
};
exports.saveUploadedFileLocally = saveUploadedFileLocally;
//# sourceMappingURL=localFileStorage.js.map