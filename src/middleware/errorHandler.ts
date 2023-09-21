import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/errors';
import { logger } from '../lib/logger';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(HttpError.notFound('Route not found'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // body-parser raises plain errors carrying a 4xx status (e.g. malformed JSON)
  const status = (err as { status?: number })?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return res.status(status).json({ error: { code: 'BAD_REQUEST', message: 'Invalid request' } });
  }

  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal server error' } });
}
