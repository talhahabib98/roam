import express from 'express';
import { asyncHandler } from './lib/asyncHandler';
import { prisma } from './lib/prisma';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiRouter } from './routes';

export const app = express();

app.use(requestLogger);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Readiness also checks the database connection, unlike the plain liveness check above
app.get(
  '/health/ready',
  asyncHandler(async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', database: 'up' });
    } catch {
      res.status(503).json({ status: 'unavailable', database: 'down' });
    }
  }),
);

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
