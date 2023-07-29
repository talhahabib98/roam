import express from 'express';
import { config } from './config';
import { logger } from './lib/logger';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  logger.info(`Ride-sharing service listening at http://localhost:${config.port}`);
});
