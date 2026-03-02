/**
 * Admin Routes
 * Protected routes for admin dashboard operations
 */
import { Router } from 'express';
import { protect, requireAdmin } from '../middleware/auth';
import {
  getDashboardStats,
  getSubscriptionStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, requireAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Subscription & revenue analytics
router.get('/subscription-stats', getSubscriptionStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
