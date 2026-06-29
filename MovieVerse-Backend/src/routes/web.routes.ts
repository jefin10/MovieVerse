import { Router } from 'express';
import * as c from '../controllers/web.controller.js';

// Public website endpoints (no auth)
export const webRouter = Router();

webRouter.get('/catalog', c.catalog);
webRouter.get('/search/:query', c.search);
webRouter.get('/movie/:query', c.fetchInfo);
