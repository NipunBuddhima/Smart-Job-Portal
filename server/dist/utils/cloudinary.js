"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinaryWithFilename = exports.uploadToCloudinary = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    api_key: process.env.CLOUDINARY_API_KEY ?? '',
    api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
});
const buildCloudinaryPublicUrl = (result) => result?.secure_url ?? '';
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: resourceType,
            type: 'upload',
            access_mode: 'public',
        }, (error, result) => {
            if (error)
                return reject(error);
            if (result)
                resolve(buildCloudinaryPublicUrl(result));
        });
        streamifier_1.default.createReadStream(fileBuffer).pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const uploadToCloudinaryWithFilename = (fileBuffer, folder, resourceType = 'image', originalFilename) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder,
            resource_type: resourceType,
            type: 'upload',
            access_mode: 'public',
            use_filename: Boolean(originalFilename),
            unique_filename: false,
            ...(originalFilename ? { filename_override: originalFilename } : {}),
        };
        const uploadStream = cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error)
                return reject(error);
            if (result)
                resolve(buildCloudinaryPublicUrl(result));
        });
        streamifier_1.default.createReadStream(fileBuffer).pipe(uploadStream);
    });
};
exports.uploadToCloudinaryWithFilename = uploadToCloudinaryWithFilename;
//# sourceMappingURL=cloudinary.js.map