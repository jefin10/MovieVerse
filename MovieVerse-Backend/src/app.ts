import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { router } from './routes/index.js';
import { aiRouter } from './routes/ai.routes.js';

export function createApp() {
  const app = express();

  // Behind a proxy/load balancer on AWS: gives correct client IPs (req.ip) and
  // lets secure cookies work over forwarded HTTPS.
  app.set('trust proxy', env.trustProxyHops);

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.cookieSecret));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Rate limiting: a general cap for the API plus a stricter cap for auth
  // writes (send/verify code, sign-up) to blunt brute-force. Reads such as the
  // username check fire as people type, so only the general cap applies.
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'GET',
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter, router);
  app.use('/ai', aiRouter); // mirrors Django: AI endpoints live at app root

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
