/**
 * Admin Controller
 * Handles admin dashboard operations: user management, stats, etc.
 */
import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../utils/AppError';
import User from '../models/User';
import Readme from '../models/Readme';
import SubscriptionHistory from '../models/SubscriptionHistory';

/**
 * Get dashboard stats overview
 * GET /api/admin/stats
 */
export const getDashboardStats = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const [
      totalUsers,
      proUsers,
      freeUsers,
      totalReadmes,
      totalRevenue,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: 'pro' }),
      User.countDocuments({ plan: 'free' }),
      Readme.countDocuments(),
      SubscriptionHistory.aggregate([
        { $match: { event: { $in: ['subscribed', 'renewed'] }, amount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email plan role createdAt'),
    ]);

    // Monthly signups for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          proUsers,
          freeUsers,
          totalReadmes,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlySignups,
        },
        recentUsers,
      },
    });
  }
);

/**
 * Get all users (paginated, searchable)
 * GET /api/admin/users
 */
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const planFilter = req.query.plan as string;
    const roleFilter = req.query.role as string;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (planFilter && ['free', 'pro'].includes(planFilter)) {
      filter.plan = planFilter;
    }
    if (roleFilter && ['user', 'admin'].includes(roleFilter)) {
      filter.role = roleFilter;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email avatar role plan subscriptionStatus exportsUsedThisMonth createdAt'),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

/**
 * Get single user details
 * GET /api/admin/users/:id
 */
export const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id).select(
      'name email avatar role plan subscriptionStatus subscriptionEndDate stripeCustomerId stripeSubscriptionId exportsUsedThisMonth exportsResetDate createdAt updatedAt'
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get user's readme count
    const readmeCount = await Readme.countDocuments({ userId: user._id });

    // Get user's subscription history
    const subscriptionHistory = await SubscriptionHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        readmeCount,
        subscriptionHistory,
      },
    });
  }
);

/**
 * Update a user (plan, role, etc.)
 * PATCH /api/admin/users/:id
 */
export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, plan, subscriptionStatus } = req.body;
    const updateData: any = {};

    if (role && ['user', 'admin'].includes(role)) {
      updateData.role = role;
    }
    if (plan && ['free', 'pro'].includes(plan)) {
      updateData.plan = plan;
      if (plan === 'free') {
        updateData.subscriptionStatus = 'none';
        updateData.stripeSubscriptionId = undefined;
      }
    }
    if (subscriptionStatus && ['none', 'active', 'canceled', 'past_due'].includes(subscriptionStatus)) {
      updateData.subscriptionStatus = subscriptionStatus;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('name email avatar role plan subscriptionStatus createdAt');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);

/**
 * Delete a user
 * DELETE /api/admin/users/:id
 */
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Prevent self-deletion
    if (req.params.id === req.user!._id.toString()) {
      return next(new AppError('You cannot delete your own admin account', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Delete user's readmes
    await Readme.deleteMany({ userId: user._id });

    // Delete subscription history
    await SubscriptionHistory.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'User and associated data deleted',
    });
  }
);
