import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from './errorHandler';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = await resolveUserFromRequest(req);

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

const resolveUserFromRequest = async (req: Request) => {
  let token;

  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return null;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
  const currentUser = await User.findById(decoded.id);

  return currentUser || null;
};

export const attachOptionalUser = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.user = await resolveUserFromRequest(req);
  } catch {
    req.user = undefined;
  }

  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};