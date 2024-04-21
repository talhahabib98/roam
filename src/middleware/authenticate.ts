import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/errors';
import { verifyToken } from '../lib/token';

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(HttpError.unauthorized());
  }

  try {
    const payload = await verifyToken(header.slice('Bearer '.length));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function currentUser(req: Request): AuthUser {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  return req.user;
}
