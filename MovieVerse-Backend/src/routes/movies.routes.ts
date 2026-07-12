import { Router } from 'express';
import * as c from '../controllers/movies.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const moviesRouter = Router();

moviesRouter.get('/Trending', requireAuth, c.trending);
moviesRouter.get('/TinderMovies', c.tinder);
moviesRouter.get('/shorts/random-trailers', c.randomTrailers);
moviesRouter.get('/searchMovie/:query', c.search);
moviesRouter.get('/fetchMovieInfo/:query', c.fetchInfo);
moviesRouter.get('/getMoviePoster/:query', c.poster);

// Mobile (auth) catalog
moviesRouter.get('/mobile/catalog', requireAuth, c.catalog);
moviesRouter.get('/mobile/search/:query', requireAuth, c.search);
moviesRouter.get('/mobile/movie/:query', requireAuth, c.fetchInfo);
