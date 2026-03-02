/**
 * README Routes
 * Handles README CRUD and generation endpoints
 */
import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateReadmeSchema } from '../utils/validation';
import * as readmeController from '../controllers/readmeController';

const router = Router();

// Public / Optional auth routes
router.post('/preview', optionalAuth, readmeController.previewReadme);
router.get('/templates', optionalAuth, readmeController.getTemplates);

// Protected routes (require authentication)
router.post('/generate', protect, validate(generateReadmeSchema), readmeController.generateReadme);
router.get('/', protect, readmeController.getMyReadmes);
router.get('/:id', protect, readmeController.getReadme);
router.patch('/:id', protect, readmeController.updateReadme);
router.delete('/:id', protect, readmeController.deleteReadme);

export default router;
