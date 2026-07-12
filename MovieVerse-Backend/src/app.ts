import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { router } from './routes/index.js';
import { aiRouter } from './routes/ai.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.cookieSecret));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', router);
  app.use('/ai', aiRouter); // mirrors Django: AI endpoints live at app root

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
