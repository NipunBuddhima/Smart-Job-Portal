import multer from 'multer';
import { AppError } from './errorHandler';

const storage = multer.memoryStorage();

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
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new AppError('Only PDF files are allowed!', 400));
  },
});