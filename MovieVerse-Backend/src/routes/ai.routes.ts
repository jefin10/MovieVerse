import { Router } from 'express';
import * as c from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';

// Proxy to the MovieverseAI Flask service, attaching DB-backed movie data.
export const aiRouter = Router();

aiRouter.post('/mood', requireAuth, c.mood);
aiRouter.post('/recommend', requireAuth, c.recommend);
