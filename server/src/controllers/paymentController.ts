/**
 * Payment Controller
 * Handles Stripe checkout, portal, and webhook endpoints
 */
import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../utils/AppError';
import * as stripeService from '../services/stripeService';
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

    if (req.user.plan === 'pro') {
      throw new AppError('You are already on the Pro plan', 400);
    }

    const successUrl = `${config.clientUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&upgrade=success`;
    const cancelUrl = `${config.clientUrl}/pricing?upgrade=canceled`;

    const checkoutUrl = await stripeService.createCheckoutSession(
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

    const returnUrl = `${config.clientUrl}/dashboard`;

    const portalUrl = await stripeService.createPortalSession(req.user, returnUrl);

    res.status(200).json({
      status: 'success',
      data: { url: portalUrl },
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
 * Stripe webhook handler
 * POST /api/payments/webhook
 */
export const webhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  try {
    const event = stripeService.constructWebhookEvent(req.body, sig);
    await stripeService.handleWebhookEvent(event);
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
    const limit = parseInt(req.query.limit as string) || 20;
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
