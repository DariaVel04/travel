import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { accommodationsRouter, transportRouter } from './routes/catalog.js';
import { healthRouter } from './routes/health.js';
import { tripsRouter } from './routes/trips.js';
import { usersRouter } from './routes/users.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/trips', tripsRouter);
  app.use('/api/accommodations', accommodationsRouter);
  app.use('/api/transport', transportRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
