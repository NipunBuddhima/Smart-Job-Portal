import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

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

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
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

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedRole = role === 'employer' ? 'employer' : 'candidate';

    if (!normalizedName || !normalizedEmail || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: normalizedRole,
    });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      return next(new AppError('Please provide an email and password', 400));
    }

    // Select password since it's hidden by default in the schema
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};