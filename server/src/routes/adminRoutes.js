import { Router } from 'express';
import { getAdminStats, getAllReports, reviewReport } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateReviewReport } from '../middleware/validation.js';

const router = Router();

// Protect all admin endpoints with authenticate and requireAdmin
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/reports', getAllReports);
router.put('/reports/:id/review', validateReviewReport, reviewReport);

export default router;
