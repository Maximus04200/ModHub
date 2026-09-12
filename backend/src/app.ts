import express, { type Express } from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/error.middleware';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', apiRouter);

  app.use(errorHandler);

  return app;
}
