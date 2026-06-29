import { Router } from 'express';
import * as c from '../controllers/recommendations.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const recommendationsRouter = Router();

recommendationsRouter.post('/temp-add', requireAuth, c.tempAdd);
recommendationsRouter.get('/', requireAuth, c.list);
recommendationsRouter.post('/from-ratings', requireAuth, c.fromRatings);
