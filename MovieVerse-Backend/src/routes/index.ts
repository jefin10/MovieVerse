import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { moviesRouter } from './movies.routes.js';
import { ratingsRouter } from './ratings.routes.js';
import { recommendationsRouter } from './recommendations.routes.js';
import { watchlistRouter } from './watchlist.routes.js';
import { webRouter } from './web.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/', moviesRouter); // Trending, TinderMovies, searchMovie, fetchMovieInfo...
router.use('/watchlist', watchlistRouter);
router.use('/', ratingsRouter); // addRatings, movie/:id/rate...
router.use('/recommendations', recommendationsRouter);
router.use('/web', webRouter);
