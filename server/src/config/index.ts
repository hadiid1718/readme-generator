/**
 * Server Configuration
 * Loads environment variables and exports typed config object
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const currentNodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
const environmentFileName = `.env.${currentNodeEnv}`;

const envFileCandidates = [
  // Repo root (works for both ts-node and compiled dist)
  path.resolve(__dirname, '..', '..', '..', environmentFileName),
  // Current working directory (useful in some deploy setups)
  path.resolve(process.cwd(), environmentFileName),
  // Server directory fallback
  path.resolve(__dirname, '..', '..', environmentFileName),
  // Legacy .env fallback
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(process.cwd(), '.env'),
];

const envFilePath = envFileCandidates.find((candidate) => fs.existsSync(candidate));

if (envFilePath) {
  dotenv.config({ path: envFilePath });
} else {
  dotenv.config();
}

const normalizeOrigin = (url: string): string => url.replace(/\/+$/, '');

interface Config {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  jwt: {
    secret: string;
    expiresIn: string;
    cookieExpiresIn: number;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  paddle: {
    apiKey: string;
    webhookSecret: string;
    proPriceId: string;
    checkoutUrl: string;
    customerPortalUrl: string;
    baseUrl: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
  };
  clientUrl: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/readme-generator-pro',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10),
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },
  paddle: {
    apiKey: process.env.PADDLE_API_KEY || '',
    webhookSecret: process.env.PADDLE_WEBHOOK_SECRET || '',
    proPriceId: process.env.PADDLE_PRO_PRICE_ID || '',
    checkoutUrl: process.env.PADDLE_CHECKOUT_URL || '',
    customerPortalUrl: process.env.PADDLE_CUSTOMER_PORTAL_URL || '',
    baseUrl: process.env.PADDLE_API_BASE_URL || 'https://api.paddle.com',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'README Generator Pro <noreply@readmepro.com>',
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@readmepro.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
  },
  clientUrl: normalizeOrigin(process.env.CLIENT_URL || 'http://localhost:5173'),
};

export default config;
