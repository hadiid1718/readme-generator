/**
 * Subscription History Model
 * Tracks all subscription events for audit and user visibility
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionHistory extends Document {
  userId: mongoose.Types.ObjectId;
  event: 'subscribed' | 'renewed' | 'canceled' | 'expired' | 'payment_failed' | 'reactivated';
  plan: 'free' | 'pro';
  amount?: number;
  currency?: string;
  stripeSubscriptionId?: string;
  stripeInvoiceId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  details?: string;
  createdAt: Date;
}

const subscriptionHistorySchema = new Schema<ISubscriptionHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    event: {
      type: String,
      enum: ['subscribed', 'renewed', 'canceled', 'expired', 'payment_failed', 'reactivated'],
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      required: true,
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    stripeSubscriptionId: {
      type: String,
    },
    stripeInvoiceId: {
      type: String,
    },
    periodStart: {
      type: Date,
    },
    periodEnd: {
      type: Date,
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionHistorySchema.index({ userId: 1, createdAt: -1 });

const SubscriptionHistory = mongoose.model<ISubscriptionHistory>(
  'SubscriptionHistory',
  subscriptionHistorySchema
);

export default SubscriptionHistory;
