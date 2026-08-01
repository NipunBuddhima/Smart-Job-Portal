import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { uploadToCloudinary } from '../utils/cloudinary';
import { AppError } from '../middleware/errorHandler';
import {
  validateCandidateProfileUpdate,
  validateEmployerProfileUpdate,
} from '../validators/profile.validators';

const buildUserResponse = (user: any) => ({
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

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult =
      req.user.role === 'employer'
        ? validateEmployerProfileUpdate(req.body)
        : validateCandidateProfileUpdate(req.body);

    if (validationResult.errors.length) {
      return next(new AppError(validationResult.errors.join(' '), 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, validationResult.value, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

export const uploadUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return next(new AppError('Please upload an image', 400));

    const avatarUrl = await uploadToCloudinary(req.file.buffer, 'job_portal/avatars', 'image');
    
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl }, { new: true, runValidators: true });
    res.status(200).json({ success: true, avatarUrl: user?.avatar, user: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

export const uploadUserResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return next(new AppError('Please upload a PDF document', 400));

    // resourceType 'raw' is required in Cloudinary for PDFs/Docs
    const resumeUrl = await uploadToCloudinary(req.file.buffer, 'job_portal/resumes', 'raw');
    
    const user = await User.findByIdAndUpdate(req.user.id, { resume: resumeUrl }, { new: true, runValidators: true });
    res.status(200).json({ success: true, resumeUrl: user?.resume, user: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

export const uploadCompanyLogo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return next(new AppError('Please upload an image', 400));

    const logoUrl = await uploadToCloudinary(req.file.buffer, 'job_portal/company-logos', 'image');

    const user = await User.findByIdAndUpdate(req.user.id, { companyLogo: logoUrl }, { new: true, runValidators: true });
    res.status(200).json({ success: true, companyLogoUrl: user?.companyLogo, user: buildUserResponse(user) });
  } catch (error) {
    next(error);
  }
};