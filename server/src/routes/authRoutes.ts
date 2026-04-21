/**
 * Auth Routes
 * Handles all authentication-related endpoints
 */
import { Router } from 'express';
import passport from 'passport';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { registerSchema, loginSchema } from '../utils/validation';
import * as authController from '../controllers/authController';

const router = Router();

// Email/Password Authentication
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/admin/login', validate(loginSchema), authController.adminLogin);
router.post('/logout', authController.logout);

// Get & Update Profile (protected)
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, authController.updateMe);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login?error=oauth_failed',
    session: false,
  }),
  authController.googleCallback
);

export default router;
