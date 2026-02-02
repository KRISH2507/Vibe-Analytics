import { Router } from 'express';
import { getTrending } from '../controllers/trends.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

router.get('/mastodon', requireAuth, getTrending);

export default router;
