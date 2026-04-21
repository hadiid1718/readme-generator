/**
 * Authentication Controller
 * Handles user registration, login, Google OAuth, and profile management
 */
import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../utils/AppError';
import { generateToken } from '../utils/jwt';
import User, { IUser } from '../models/User';
import config from '../config';

const getAuthenticatedUser = async (
  email: string,
  password: string,
  next: NextFunction
): Promise<IUser | void> => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if user has a password (might be Google-only account)
  if (!user.password) {
    return next(
      new AppError('This account uses Google sign-in. Please use Google to log in.', 401)
    );
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  return user;
};

const sendLoginResponse = (res: Response, user: IUser) => {
  // Generate token
  const token = generateToken(user);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000,
  });

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;

  res.status(200).json({
    status: 'success',
    data: {
      user: userObj,
      token,
    },
  });
};

/**
 * Register a new user with email/password
 * POST /api/auth/register
 */
export const register = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000,
    });

    // Remove password from output
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      status: 'success',
      data: {
        user: userObj,
        token,
      },
    });
  }
);

/**
 * Login user account with email/password
 * POST /api/auth/login
 */
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await getAuthenticatedUser(email, password, next);
    if (!user) return;

    if (user.role === 'admin') {
      return next(new AppError('Admin accounts must sign in from the admin login page.', 403));
    }

    sendLoginResponse(res, user);
  }
);

/**
 * Login admin account with email/password
 * POST /api/auth/admin/login
 */
export const adminLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await getAuthenticatedUser(email, password, next);
    if (!user) return;

    if (user.role !== 'admin') {
      return next(new AppError('Access denied. Admin credentials required.', 403));
    }

    sendLoginResponse(res, user);
  }
);

/**
 * Google OAuth callback handler
 * GET /api/auth/google/callback
 */
export const googleCallback = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Passport attaches user to req.user
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend dashboard with token
    res.redirect(`${config.clientUrl}/dashboard?token=${token}`);
  }
);

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await User.findById(req.user!._id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);

/**
 * Update user profile
 * PATCH /api/auth/me
 */
export const updateMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);

/**
 * Logout - clear cookie
 * POST /api/auth/logout
 */
export const logout = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }
);
