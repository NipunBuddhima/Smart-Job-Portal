import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { sendEmail, emailTemplates } from '../utils/email';

const buildUserResponse = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  resume: user.resume,
  resumeName: user.resumeName ?? '',
  skills: user.skills ?? [],
  education: user.education ?? [],
  experience: user.experience ?? [],
  socialLinks: user.socialLinks ?? {},
  companyName: user.companyName ?? '',
  companyDescription: user.companyDescription ?? '',
  website: user.website ?? '',
  companyLogo: user.companyLogo ?? '',
  savedJobs: user.savedJobs ?? [],
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

    await sendEmail(normalizedEmail, 'Welcome to Smart Job Portal', emailTemplates.registration(normalizedName));
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    await sendEmail(email, 'Reset your Smart Job Portal password', emailTemplates.passwordReset(resetUrl));

    res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return next(new AppError('Invalid reset token or missing password', 400));
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    user.password = password;
    user.resetPasswordToken = '';
    user.resetPasswordExpire = new Date(0);
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
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