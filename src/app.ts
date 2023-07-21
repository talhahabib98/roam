import express from 'express';
import { config } from './config';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  return console.log(`Ride-sharing service listening at http://localhost:${config.port}`);
});
