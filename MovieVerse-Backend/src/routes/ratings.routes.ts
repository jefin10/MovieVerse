import { Router } from 'express';
import * as c from '../controllers/ratings.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const ratingsRouter = Router();

ratingsRouter.post('/addRatings', requireAuth, c.add);
ratingsRouter.get('/getRatings/:username/:movieId', c.get);
ratingsRouter.post('/movie/:movieId/rate', requireAuth, c.rate);
ratingsRouter.get('/movie/:movieId/rating', requireAuth, c.movieRating);
