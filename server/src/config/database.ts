/**
 * MongoDB Database Connection
 * Handles connection with retry logic and event handling
 */
import mongoose from 'mongoose';
import config from '../config';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      // Connection pool settings for production
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[OK] MongoDB connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('[ERROR] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[WARN] MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[OK] MongoDB reconnected');
    });
  } catch (error) {
    console.error('[ERROR] MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
