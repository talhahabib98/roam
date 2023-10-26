import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiRouter } from './routes';

export const app = express();

app.use(requestLogger);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
