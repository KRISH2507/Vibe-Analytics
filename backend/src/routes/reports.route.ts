import { Router } from 'express';
import { getSearchHistory, exportCSV, exportPDF } from '../controllers/reports.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.get('/history', requireAuth, getSearchHistory);
router.get('/export/csv', requireAuth, exportCSV);
router.get('/export/pdf', requireAuth, exportPDF);

export default router;
