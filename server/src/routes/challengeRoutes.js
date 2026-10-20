import { Router } from 'express';
import {
  getAllChallenges,
  getChallengeById,
  unlockHint,
  recordAttempt
} from '../controllers/challengeController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Challenges list (optional auth to attach progress)
router.get('/', optionalAuth, getAllChallenges);

// Single challenge detail (optional auth)
router.get('/:challengeId', optionalAuth, getChallengeById);

// Unlock hint (auth required)
router.post('/:challengeId/hint', authenticate, unlockHint);

// Record attempt/run (auth required)
router.post('/:challengeId/attempt', authenticate, recordAttempt);

export default router;
