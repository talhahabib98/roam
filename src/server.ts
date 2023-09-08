import { app } from './app';
import { config } from './config';
import { logger } from './lib/logger';

app.listen(config.port, () => {
  logger.info(`Ride-sharing service listening at http://localhost:${config.port}`);
});
