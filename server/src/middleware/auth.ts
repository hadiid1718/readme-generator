/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { extractToken, verifyToken } from '../utils/jwt';
import User, { IUser } from '../models/User';

// Extend Passport's User interface to include our IUser properties
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IUser {}
  }
}

/**
 * Require authentication - rejects unauthenticated requests
 */
export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from header or cookie
    const token = extractToken(
      req.headers.authorization,
      req.cookies
    );

    if (!token) {
      return next(new AppError('Please log in to access this resource', 401));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

/**
 * Optional authentication - attaches user if token exists, but doesn't reject
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(
      req.headers.authorization,
      req.cookies
    );

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Silently continue without user
  }

  next();
};

/**
 * Restrict access to specific plans
 */
export const requirePlan = (...plans: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Please log in first', 401));
    }

    if (!plans.includes(req.user.plan)) {
      return next(
        new AppError('Your plan does not include access to this feature. Please upgrade.', 403)
      );
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError('Please log in first', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  next();
};
