/**
 * User Model
 * Handles user data, authentication, subscription status, and usage tracking
 */
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ----- Interfaces -----
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  plan: 'free' | 'pro';
  paddleCustomerId?: string;
  paddleSubscriptionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: 'none' | 'active' | 'canceled' | 'past_due';
  subscriptionEndDate?: Date;
  exportsUsedThisMonth: number;
  exportsResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  canExport(): boolean;
  incrementExports(): Promise<void>;
}

// ----- Schema -----
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    paddleCustomerId: {
      type: String,
    },
    paddleSubscriptionId: {
      type: String,
    },
    // Legacy Stripe fields kept for backward compatibility with existing data.
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'canceled', 'past_due'],
      default: 'none',
    },
    subscriptionEndDate: {
      type: Date,
    },
    exportsUsedThisMonth: {
      type: Number,
      default: 0,
    },
    exportsResetDate: {
      type: Date,
      default: () => {
        // Set to the first day of next month
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      },
    },
  },
  {
    timestamps: true,
  }
);

// ----- Indexes -----
// Note: email already has unique: true which creates an index automatically
userSchema.index({ paddleCustomerId: 1 });
userSchema.index({ stripeCustomerId: 1 });

// ----- Pre-save Hook: Hash password -----
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ----- Methods -----

/**
 * Compare a candidate password with the stored hashed password
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if user can export (free plan: 5/month, pro: unlimited)
 */
userSchema.methods.canExport = function (): boolean {
  if (this.plan === 'pro') return true;

  // Reset counter if we're past the reset date
  if (new Date() >= this.exportsResetDate) {
    return true; // Will be reset on next export
  }

  return this.exportsUsedThisMonth < 5;
};

/**
 * Increment export count (and reset if needed)
 */
userSchema.methods.incrementExports = async function (): Promise<void> {
  const now = new Date();

  // Reset counter if past reset date
  if (now >= this.exportsResetDate) {
    this.exportsUsedThisMonth = 0;
    this.exportsResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  this.exportsUsedThisMonth += 1;
  await this.save();
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
