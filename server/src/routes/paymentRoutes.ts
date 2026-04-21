/**
 * Payment Routes
 * Handles Paddle checkout, portal, cancellation, and webhook endpoints
 */
import { Router, raw } from 'express';
import { protect } from '../middleware/auth';
import * as paymentController from '../controllers/paymentController';

const router = Router();

// Webhook must use raw body parser (not JSON)
router.post('/webhook', raw({ type: 'application/json' }), paymentController.webhook);

// Protected routes
router.post('/create-checkout', protect, paymentController.createCheckout);
router.post('/create-portal', protect, paymentController.createPortal);
router.post('/cancel-subscription', protect, paymentController.cancelSubscription);
router.get('/status', protect, paymentController.getSubscriptionStatus);
router.get('/history', protect, paymentController.getSubscriptionHistory);

export default router;
