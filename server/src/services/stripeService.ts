/**
 * Stripe Service
 * Handles Stripe customer creation, subscription management, and webhook processing
 */
import Stripe from 'stripe';
import config from '../config';
import User, { IUser } from '../models/User';
import SubscriptionHistory from '../models/SubscriptionHistory';

// Initialize Stripe client
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-09-30.acacia' as any,
});

/**
 * Create or retrieve Stripe customer for a user
 */
export const getOrCreateCustomer = async (user: IUser): Promise<string> => {
  // Return existing customer ID if available
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user._id.toString(),
    },
  });

  // Save customer ID to user
  user.stripeCustomerId = customer.id;
  await user.save();

  return customer.id;
};

/**
 * Create a checkout session for Pro plan subscription
 */
export const createCheckoutSession = async (
  user: IUser,
  successUrl: string,
  cancelUrl: string
): Promise<string> => {
  const customerId = await getOrCreateCustomer(user);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: config.stripe.proPriceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user._id.toString(),
    },
    subscription_data: {
      metadata: {
        userId: user._id.toString(),
      },
    },
  });

  return session.url || '';
};

/**
 * Create a customer portal session (for managing subscriptions)
 */
export const createPortalSession = async (user: IUser, returnUrl: string): Promise<string> => {
  const customerId = await getOrCreateCustomer(user);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhookEvent = async (event: Stripe.Event): Promise<void> => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId && session.subscription) {
        await User.findByIdAndUpdate(userId, {
          plan: 'pro',
          stripeSubscriptionId: session.subscription as string,
          subscriptionStatus: 'active',
        });

        // Log subscription event
        await SubscriptionHistory.create({
          userId,
          event: 'subscribed',
          plan: 'pro',
          amount: session.amount_total ? session.amount_total / 100 : undefined,
          currency: session.currency || 'usd',
          stripeSubscriptionId: session.subscription as string,
          details: 'Pro plan subscription started',
        });

        console.log(`[OK] User ${userId} upgraded to Pro plan`);
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
        if (user) {
          user.plan = 'pro';
          user.subscriptionStatus = 'active';
          await user.save();

          // Log renewal (skip first invoice which is covered by checkout.session.completed)
          if (invoice.billing_reason === 'subscription_cycle') {
            await SubscriptionHistory.create({
              userId: user._id,
              event: 'renewed',
              plan: 'pro',
              amount: invoice.amount_paid ? invoice.amount_paid / 100 : undefined,
              currency: invoice.currency || 'usd',
              stripeSubscriptionId: subscriptionId,
              stripeInvoiceId: invoice.id,
              periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : undefined,
              periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
              details: 'Subscription renewed successfully',
            });
          }

          console.log(`[OK] Subscription renewed for user ${user._id}`);
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
        if (user) {
          user.subscriptionStatus = 'past_due';
          await user.save();

          await SubscriptionHistory.create({
            userId: user._id,
            event: 'payment_failed',
            plan: user.plan,
            stripeSubscriptionId: subscriptionId,
            stripeInvoiceId: invoice.id,
            details: 'Payment failed for subscription renewal',
          });

          console.log(`[WARN] Payment failed for user ${user._id}`);
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await User.findOne({ stripeSubscriptionId: subscription.id });

      if (user) {
        user.plan = 'free';
        user.subscriptionStatus = 'canceled';
        user.stripeSubscriptionId = undefined;
        user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
        await user.save();

        await SubscriptionHistory.create({
          userId: user._id,
          event: 'canceled',
          plan: 'free',
          stripeSubscriptionId: subscription.id,
          periodEnd: new Date(subscription.current_period_end * 1000),
          details: 'Subscription canceled and reverted to free plan',
        });

        console.log(`[WARN] Subscription canceled for user ${user._id}`);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await User.findOne({ stripeSubscriptionId: subscription.id });

      if (user) {
        if (subscription.status === 'active') {
          user.plan = 'pro';
          user.subscriptionStatus = 'active';
        } else if (subscription.status === 'canceled') {
          user.subscriptionStatus = 'canceled';
          user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
        }
        await user.save();
      }
      break;
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
};

/**
 * Construct webhook event from request
 */
export const constructWebhookEvent = (
  body: Buffer,
  signature: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
};

export default stripe;
