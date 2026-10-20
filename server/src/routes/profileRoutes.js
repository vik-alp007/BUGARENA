import { Router } from 'express';
import { getProfile } from '../controllers/profileController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Current authenticated user's profile
router.get('/me', authenticate, getProfile);

// Public profile by username
router.get('/:username', optionalAuth, getProfile);

export default router;
