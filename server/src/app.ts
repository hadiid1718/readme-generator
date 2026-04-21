/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import config from './config';
import configurePassport from './config/passport';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import readmeRoutes from './routes/readmeRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// ----- Security Middleware -----
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ----- CORS -----
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ----- Rate Limiting -----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 'error', message: 'Too many auth attempts, please try again later' },
});
app.use('/api/auth/', authLimiter);

// ----- Logging -----
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ----- Body Parsing -----
// Note: Payment webhook signature validation needs raw body, so it must be before json() middleware
// The webhook route handles its own body parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----- Passport -----
app.use(passport.initialize());
configurePassport();

// ----- Routes -----
app.use('/api/auth', authRoutes);
app.use('/api/readmes', readmeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ----- Health Check -----
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'README Generator Pro API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ----- 404 Handler -----
app.use('*', (_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// ----- Global Error Handler -----
app.use(errorHandler);

export default app;
