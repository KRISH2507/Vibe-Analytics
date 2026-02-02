import { Router } from 'express';
import { analyzeKeyword, resetUsage } from '../controllers/analysis.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.get('/analyze', requireAuth, analyzeKeyword);
router.post('/analyze/reset-usage', requireAuth, resetUsage);

export default router;
