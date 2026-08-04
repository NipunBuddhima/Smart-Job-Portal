import multer from 'multer';
import { AppError } from './errorHandler';

const storage = multer.memoryStorage();

const allowedResumeMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
]);

const allowedResumeExtensions = new Set(['.pdf', '.doc', '.docx']);

const isAllowedResumeFile = (file: Express.Multer.File) => {
  const originalName = file.originalname.toLowerCase();
  return (
    allowedResumeMimeTypes.has(file.mimetype) ||
    Array.from(allowedResumeExtensions).some((extension) => originalName.endsWith(extension))
  );
};

// Filter for Avatar (Images only)
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new AppError('Only image files are allowed!', 400));
  },
});

// Filter for Resume (PDFs only)
export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (isAllowedResumeFile(file)) cb(null, true);
    else cb(new AppError('Only PDF, DOC, or DOCX files are allowed!', 400));
  },
});