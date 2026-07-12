import { Router } from 'express';
import * as c from '../controllers/watchlist.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const watchlistRouter = Router();

watchlistRouter.get('/', requireAuth, c.list);
watchlistRouter.post('/add', requireAuth, c.add);
watchlistRouter.delete('/remove/:pk', requireAuth, c.remove);
