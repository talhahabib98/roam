import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/errors';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(HttpError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(HttpError.forbidden(`Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}
