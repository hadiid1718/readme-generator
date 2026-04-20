/**
 * Server Entry Point
 * Connects to database and starts the Express server
 */
import app from './app';
import config from './config';
import connectDB from './config/database';
import { verifyEmailConnection } from './services/emailService';
import startSubscriptionWorkflow from './services/subscriptionWorkflow';
import User from './models/User';

/**
 * Seed default admin account if none exists
 */
const seedAdmin = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: config.admin.name,
        email: config.admin.email,
        password: config.admin.password,
        role: 'admin',
        plan: 'free',
        subscriptionStatus: 'none',
        isEmailVerified: true,
      });
      console.log(`[OK] Default admin created: ${config.admin.email}`);
      return;
    }

    // Keep admins as system admins (not pro subscribers)
    if (adminExists.plan !== 'free' || adminExists.subscriptionStatus !== 'none') {
      adminExists.plan = 'free';
      adminExists.subscriptionStatus = 'none';
      adminExists.subscriptionEndDate = undefined;
      adminExists.stripeSubscriptionId = undefined;
      await adminExists.save();
      console.log(`[OK] Admin normalized to system-admin mode: ${adminExists.email}`);
    }
  } catch (error) {
    console.error('[WARN] Failed to seed admin:', error);
  }
};

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed default admin account
    await seedAdmin();

    // Verify email service (non-blocking)
    await verifyEmailConnection();

    // Start subscription expiration workflow
    startSubscriptionWorkflow();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║       README Generator Pro - API Server          ║
╠══════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(33)}║
║  Port:        ${String(config.port).padEnd(33)}║
║  URL:         http://localhost:${String(config.port).padEnd(17)}║
╚══════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      console.error('UNHANDLED REJECTION:', reason);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
