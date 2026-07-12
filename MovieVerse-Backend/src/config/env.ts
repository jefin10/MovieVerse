import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

/**
 * Reads an env var. In production a missing value is fatal (no insecure
 * fallbacks); in development the provided fallback keeps local setup simple.
 */
function required(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value !== undefined && value !== '') return value;
  if (isProd) throw new Error(`Missing required env var in production: ${name}`);
  return devFallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd,
  port: Number(process.env.PORT ?? 8080),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  databaseUrl: required('DATABASE_URL', 'postgresql://movieverse:movieverse@localhost:5432/movieverse'),
  jwt: {
    secret: required('JWT_SECRET', 'dev-secret'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  cookieSecret: required('COOKIE_SECRET', 'dev-cookie-secret'),
  tmdb: {
    apiKey: process.env.TMDB_API_KEY ?? '',
    bearer: process.env.TMDB_BEARER_TOKEN ?? '',
    baseUrl: process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3',
    imageBaseUrl: process.env.TMDB_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p/w500',
  },
  ai: {
    url: process.env.AI_SERVICE_URL ?? 'http://localhost:5001',
    token: process.env.AI_SERVICE_TOKEN ?? '',
  },
  mail: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'no-reply@movieverse.local',
  },
};
