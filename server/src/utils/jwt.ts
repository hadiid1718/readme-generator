/**
 * JWT Utility
 * Handles token generation and verification
 */
import jwt from 'jsonwebtoken';
import config from '../config';
import { IUser } from '../models/User';

interface TokenPayload {
  id: string;
  email: string;
}

/**
 * Generate JWT access token
 */
export const generateToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

/**
 * Verify JWT token and return decoded payload
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

/**
 * Extract token from Authorization header or cookie
 */
export const extractToken = (
  authHeader?: string,
  cookies?: Record<string, string>
): string | null => {
  // Check Authorization header first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  // Check cookies
  if (cookies?.token) {
    return cookies.token;
  }

  return null;
};
