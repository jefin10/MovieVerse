import { Router } from 'express';
import * as c from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';

// Mounted at /ai (app root) to mirror Django's ai.urls.
export const aiRouter = Router();

aiRouter.post('/recommend', requireAuth, c.mood); // mood text -> genre -> movies
aiRouter.post('/rec', requireAuth, c.recommend); // liked/disliked -> recommendations
