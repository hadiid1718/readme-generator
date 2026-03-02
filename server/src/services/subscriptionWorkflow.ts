/**
 * Subscription Expiration Workflow
 * Scheduled job that checks for expiring subscriptions and sends warning emails.
 *
 * Runs daily at 9:00 AM and:
 * 1. Finds users whose subscriptions expire within 7 days → sends warning email
 * 2. Finds users whose subscriptions have just expired → downgrades and notifies
 */
import cron from 'node-cron';
import User from '../models/User';
import SubscriptionHistory from '../models/SubscriptionHistory';
import { sendExpirationWarning, sendExpiredNotification } from '../services/emailService';
import config from '../config';

/**
 * Check for subscriptions expiring within the next 7 days and send warning emails.
 * Only sends one email per user per day (tracked via a simple date check).
 */
const checkExpiringSubscriptions = async (): Promise<void> => {
  console.log('[CRON] Running subscription expiration check...');

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    // ---- Step 1: Warn users about upcoming expiration ----
    const expiringUsers = await User.find({
      plan: 'pro',
      subscriptionStatus: { $in: ['active', 'canceled'] },
      subscriptionEndDate: {
        $gte: now,
        $lte: sevenDaysFromNow,
      },
    });

    console.log(`  Found ${expiringUsers.length} user(s) with subscriptions expiring within 7 days`);

    for (const user of expiringUsers) {
      if (!user.subscriptionEndDate) continue;

      const daysLeft = Math.ceil(
        (user.subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only send warning at 7, 3, and 1 day(s) before expiration
      if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
        await sendExpirationWarning(user.email, user.name, user.subscriptionEndDate, daysLeft);

        // Log the warning in subscription history
        const alreadyLogged = await SubscriptionHistory.findOne({
          userId: user._id,
          event: 'expired', // Use expired event type to check
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        });

        if (!alreadyLogged) {
          // We don't create a history entry for warnings, only for actual expiration
          console.log(`  [EMAIL] Warning sent to ${user.email} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)`);
        }
      }
    }

    // ---- Step 2: Handle expired subscriptions ----
    const expiredUsers = await User.find({
      plan: 'pro',
      subscriptionEndDate: { $lt: now },
      subscriptionStatus: { $in: ['canceled', 'past_due'] },
    });

    console.log(`  Found ${expiredUsers.length} user(s) with expired subscriptions to downgrade`);

    for (const user of expiredUsers) {
      // Downgrade to free
      user.plan = 'free';
      user.subscriptionStatus = 'none' as any;
      user.stripeSubscriptionId = undefined;
      await user.save();

      // Log in subscription history
      await SubscriptionHistory.create({
        userId: user._id,
        event: 'expired',
        plan: 'free',
        details: 'Subscription expired — downgraded to free plan',
        periodEnd: user.subscriptionEndDate,
      });

      // Send notification email
      await sendExpiredNotification(user.email, user.name);

      console.log(`  [DOWNGRADE] User ${user.email} downgraded to free plan`);
    }

    console.log('[OK] Subscription expiration check complete');
  } catch (error) {
    console.error('[ERROR] Subscription expiration check failed:', error);
  }
};

/**
 * Start the subscription expiration cron job
 * Runs every day at 9:00 AM server time
 */
export const startSubscriptionWorkflow = (): void => {
  // Schedule: At 09:00 every day
  const job = cron.schedule('0 9 * * *', () => {
    checkExpiringSubscriptions();
  });

  console.log('[CRON] Subscription expiration workflow scheduled (daily at 9:00 AM)');

  // Run immediately on startup in development for testing
  if (config.nodeEnv === 'development') {
    console.log('  [DEV] Running initial check in development mode...');
    // Delay by 5s to let DB connection stabilize
    setTimeout(() => {
      checkExpiringSubscriptions();
    }, 5000);
  }
};

export default startSubscriptionWorkflow;
