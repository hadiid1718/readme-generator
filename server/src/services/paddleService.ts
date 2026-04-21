/**
 * Paddle Service
 * Handles Paddle checkout, customer portal, cancellations, and webhook sync.
 */
import crypto from 'crypto';
import config from '../config';
import User, { IUser } from '../models/User';
import SubscriptionHistory from '../models/SubscriptionHistory';

const paddleBaseUrl = config.paddle.baseUrl.replace(/\/+$/, '');

type PaddleEventPayload = {
  event_type?: string;
  data?: any;
};

const paddleRequest = async <T = any>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH',
  body?: Record<string, any>
): Promise<T> => {
  if (!config.paddle.apiKey) {
    throw new Error('Paddle API key is not configured');
  }

  const response = await fetch(`${paddleBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.paddle.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = json?.error?.detail || json?.error?.message || 'Paddle API request failed';
    throw new Error(msg);
  }

  return (json?.data || json) as T;
};

const buildHostedCheckoutFallbackUrl = (user: IUser): string => {
  if (!config.paddle.checkoutUrl) {
    throw new Error('Paddle checkout is not configured');
  }

  const url = new URL(config.paddle.checkoutUrl);
  url.searchParams.set('email', user.email);
  url.searchParams.set('passthrough', JSON.stringify({ userId: user._id.toString() }));
  return url.toString();
};

const normalizeAmount = (raw: unknown): number | undefined => {
  const value = Number(raw);
  if (Number.isNaN(value)) return undefined;
  if (Number.isInteger(value) && value >= 100) {
    return Number((value / 100).toFixed(2));
  }
  return value;
};

const resolveUserFromEvent = async (data: any): Promise<IUser | null> => {
  const customUserId =
    data?.custom_data?.userId || data?.custom_data?.user_id || data?.customData?.userId;
  if (customUserId) {
    const byId = await User.findById(customUserId);
    if (byId) return byId;
  }

  const customerId = data?.customer_id || data?.customer?.id;
  if (customerId) {
    const byCustomer = await User.findOne({ paddleCustomerId: customerId });
    if (byCustomer) return byCustomer;
  }

  const subscriptionId = data?.subscription_id || data?.subscription?.id || data?.id;
  if (subscriptionId) {
    const bySub = await User.findOne({ paddleSubscriptionId: subscriptionId });
    if (bySub) return bySub;
  }

  return null;
};

export const createCheckoutSession = async (
  user: IUser,
  successUrl: string,
  cancelUrl: string
): Promise<string> => {
  // Primary flow: Paddle Billing API transaction checkout
  if (config.paddle.apiKey && config.paddle.proPriceId) {
    try {
      const transaction = await paddleRequest<any>('/transactions', 'POST', {
        items: [{ price_id: config.paddle.proPriceId, quantity: 1 }],
        customer: {
          email: user.email,
          name: user.name,
        },
        custom_data: {
          userId: user._id.toString(),
        },
        checkout: {
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      });

      const checkoutUrl = transaction?.checkout?.url || transaction?.checkout_url || transaction?.url;
      if (checkoutUrl) return checkoutUrl;
    } catch (error) {
      if (!config.paddle.checkoutUrl) throw error;
    }
  }

  // Fallback flow: pre-configured hosted checkout URL
  return buildHostedCheckoutFallbackUrl(user);
};

export const createPortalSession = async (user: IUser, returnUrl: string): Promise<string> => {
  if (!config.paddle.customerPortalUrl) {
    throw new Error('Paddle customer portal is not configured');
  }

  const url = new URL(config.paddle.customerPortalUrl);
  if (user.paddleCustomerId) {
    url.searchParams.set('customer_id', user.paddleCustomerId);
  }
  url.searchParams.set('return_url', returnUrl);
  return url.toString();
};

export const cancelSubscription = async (user: IUser): Promise<void> => {
  if (!user.paddleSubscriptionId) {
    throw new Error('No active Paddle subscription found for this account');
  }

  await paddleRequest(`/subscriptions/${user.paddleSubscriptionId}/cancel`, 'POST', {
    effective_from: 'immediately',
  });
};

export const verifyWebhookSignature = (rawBody: Buffer, signatureHeader?: string): boolean => {
  if (!config.paddle.webhookSecret) {
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) {
    return false;
  }

  const signedPayload = `${ts}:${rawBody.toString('utf8')}`;
  const digest = crypto
    .createHmac('sha256', config.paddle.webhookSecret)
    .update(signedPayload)
    .digest('hex');

  const left = Buffer.from(digest, 'utf8');
  const right = Buffer.from(h1, 'utf8');

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
};

export const handleWebhookEvent = async (payload: PaddleEventPayload): Promise<void> => {
  const eventType = payload.event_type;
  const data = payload.data || {};

  if (!eventType) return;

  const user = await resolveUserFromEvent(data);
  if (!user) {
    return;
  }

  const subscriptionId = data?.subscription_id || data?.subscription?.id || data?.id;
  const customerId = data?.customer_id || data?.customer?.id;
  const currency = data?.currency_code || data?.currency || 'usd';
  const amount = normalizeAmount(data?.details?.totals?.total || data?.totals?.total || data?.amount);
  const periodEnd =
    data?.current_billing_period?.ends_at ||
    data?.scheduled_change?.effective_at ||
    data?.next_billed_at;

  if (customerId) user.paddleCustomerId = customerId;
  if (subscriptionId && eventType.startsWith('subscription.')) {
    user.paddleSubscriptionId = subscriptionId;
  }

  switch (eventType) {
    case 'transaction.completed': {
      if (subscriptionId) user.paddleSubscriptionId = subscriptionId;
      user.plan = 'pro';
      user.subscriptionStatus = 'active';
      if (periodEnd) user.subscriptionEndDate = new Date(periodEnd);
      await user.save();

      await SubscriptionHistory.create({
        userId: user._id,
        event: 'subscribed',
        plan: 'pro',
        amount,
        currency,
        paddleSubscriptionId: subscriptionId,
        paddleTransactionId: data?.id,
        details: 'Pro plan subscription started via Paddle',
      });
      break;
    }

    case 'subscription.created':
    case 'subscription.activated': {
      user.plan = 'pro';
      user.subscriptionStatus = 'active';
      if (periodEnd) user.subscriptionEndDate = new Date(periodEnd);
      await user.save();

      await SubscriptionHistory.create({
        userId: user._id,
        event: 'subscribed',
        plan: 'pro',
        amount,
        currency,
        paddleSubscriptionId: subscriptionId,
        details: 'Subscription activated via Paddle',
      });
      break;
    }

    case 'subscription.updated': {
      const status = data?.status;
      if (status === 'active' || status === 'trialing') {
        user.plan = 'pro';
        user.subscriptionStatus = 'active';
        if (periodEnd) user.subscriptionEndDate = new Date(periodEnd);

        await SubscriptionHistory.create({
          userId: user._id,
          event: 'renewed',
          plan: 'pro',
          amount,
          currency,
          paddleSubscriptionId: subscriptionId,
          details: 'Subscription renewed via Paddle',
        });
      } else if (status === 'past_due') {
        user.subscriptionStatus = 'past_due';
      } else if (status === 'canceled') {
        user.plan = 'free';
        user.subscriptionStatus = 'canceled';
        user.paddleSubscriptionId = undefined;
        user.subscriptionEndDate = periodEnd ? new Date(periodEnd) : new Date();
      }

      await user.save();
      break;
    }

    case 'subscription.canceled': {
      user.plan = 'free';
      user.subscriptionStatus = 'canceled';
      user.paddleSubscriptionId = undefined;
      user.subscriptionEndDate = periodEnd ? new Date(periodEnd) : new Date();
      await user.save();

      await SubscriptionHistory.create({
        userId: user._id,
        event: 'canceled',
        plan: 'free',
        paddleSubscriptionId: subscriptionId,
        details: 'Subscription canceled via Paddle',
        periodEnd: user.subscriptionEndDate,
      });
      break;
    }

    case 'transaction.payment_failed': {
      user.subscriptionStatus = 'past_due';
      await user.save();

      await SubscriptionHistory.create({
        userId: user._id,
        event: 'payment_failed',
        plan: user.plan,
        paddleSubscriptionId: subscriptionId,
        paddleTransactionId: data?.id,
        details: 'Payment failed for Paddle subscription',
      });
      break;
    }

    default:
      break;
  }
};
