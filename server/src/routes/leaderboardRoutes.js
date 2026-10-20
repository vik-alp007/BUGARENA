import { Router } from 'express';
import { getLeaderboard, getPublicStats } from '../controllers/leaderboardController.js';

const router = Router();

router.get('/', getLeaderboard);
router.get('/stats', getPublicStats);

export default router;
