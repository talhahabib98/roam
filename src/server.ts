import { app } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const server = app.listen(config.port, () => {
  logger.info(`Ride-sharing service listening at http://localhost:${config.port}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
