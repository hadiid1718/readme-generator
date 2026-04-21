/**
 * Payment Controller
 * Handles Paddle checkout, cancellation, portal, and webhook endpoints
 */
import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../utils/AppError';
import * as paddleService from '../services/paddleService';
import SubscriptionHistory from '../models/SubscriptionHistory';
import config from '../config';

/**
 * Create checkout session for Pro plan
 * POST /api/payments/create-checkout
 */
export const createCheckout = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role === 'admin') {
      throw new AppError('System admin accounts do not use paid subscriptions', 400);
    }

    if (req.user.plan === 'pro') {
      throw new AppError('You are already on the Pro plan', 400);
    }

    const successUrl = `${config.clientUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&upgrade=success`;
    const cancelUrl = `${config.clientUrl}/pricing?upgrade=canceled`;

    const checkoutUrl = await paddleService.createCheckoutSession(
      req.user,
      successUrl,
      cancelUrl
    );

    res.status(200).json({
      status: 'success',
      data: { url: checkoutUrl },
    });
  }
);

/**
 * Create customer portal session (manage subscription)
 * POST /api/payments/create-portal
 */
export const createPortal = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role === 'admin') {
      throw new AppError('System admin accounts do not use paid subscriptions', 400);
    }

    const returnUrl = `${config.clientUrl}/dashboard`;

    const portalUrl = await paddleService.createPortalSession(req.user, returnUrl);

    res.status(200).json({
      status: 'success',
      data: { url: portalUrl },
    });
  }
);

/**
 * Cancel active subscription (allowed within first 48 hours)
 * POST /api/payments/cancel-subscription
 */
export const cancelSubscription = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role === 'admin') {
      throw new AppError('System admin accounts do not use paid subscriptions', 400);
    }

    if (req.user.plan !== 'pro' || req.user.subscriptionStatus !== 'active') {
      throw new AppError('No active subscription to cancel', 400);
    }

    const lastActivation = await SubscriptionHistory.findOne({
      userId: req.user._id,
      event: { $in: ['subscribed', 'reactivated'] },
      plan: 'pro',
    }).sort({ createdAt: -1 });

    if (!lastActivation) {
      throw new AppError('Subscription activation record not found', 400);
    }

    const msSinceActivation = Date.now() - new Date(lastActivation.createdAt).getTime();
    const cancelWindowMs = 48 * 60 * 60 * 1000;
    if (msSinceActivation > cancelWindowMs) {
      throw new AppError('Cancellation is only allowed within 2 days of subscription', 403);
    }

    const currentSubscriptionId = req.user.paddleSubscriptionId;
    await paddleService.cancelSubscription(req.user);

    req.user.plan = 'free';
    req.user.subscriptionStatus = 'canceled';
    req.user.subscriptionEndDate = new Date();
    req.user.paddleSubscriptionId = undefined;
    await req.user.save();

    await SubscriptionHistory.create({
      userId: req.user._id,
      event: 'canceled',
      plan: 'free',
      paddleSubscriptionId: currentSubscriptionId,
      details: 'User canceled subscription within 2-day policy window',
      periodEnd: new Date(),
    });

    res.status(200).json({
      status: 'success',
      message: 'Subscription canceled successfully',
    });
  }
);

/**
 * Get current subscription status
 * GET /api/payments/status
 */
export const getSubscriptionStatus = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    res.status(200).json({
      status: 'success',
      data: {
        plan: req.user.plan,
        subscriptionStatus: req.user.subscriptionStatus,
        subscriptionEndDate: req.user.subscriptionEndDate,
        exportsUsedThisMonth: req.user.exportsUsedThisMonth,
        exportsLimit: req.user.plan === 'pro' ? 'unlimited' : 5,
      },
    });
  }
);

/**
 * Paddle webhook handler
 * POST /api/payments/webhook
 */
export const webhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['paddle-signature'] as string | undefined;
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));

  if (!signature && config.paddle.webhookSecret) {
    res.status(400).json({ error: 'Missing paddle-signature header' });
    return;
  }

  try {
    const isValid = paddleService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid Paddle webhook signature' });
      return;
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    await paddleService.handleWebhookEvent(payload);
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
};

/**
 * Get subscription history for the logged-in user
 * GET /api/payments/history
 */
export const getSubscriptionHistory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const requestedLimit = parseInt(req.query.limit as string) || 10;
    const limit = Math.min(Math.max(requestedLimit, 1), 10);
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      SubscriptionHistory.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SubscriptionHistory.countDocuments({ userId: req.user._id }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        history,
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
