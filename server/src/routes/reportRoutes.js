import { Router } from 'express';
import { submitReport, getMyReports, getReportById } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBugReport } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

router.post('/', validateBugReport, submitReport);
router.get('/my', getMyReports);
router.get('/:id', getReportById);

export default router;
