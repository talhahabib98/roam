import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { HttpError } from './errors';

export interface TokenPayload {
  sub: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (typeof decoded === 'string' || !decoded.sub || !decoded.role) {
      throw HttpError.unauthorized('Invalid token');
    }
    return { sub: decoded.sub, role: decoded.role as Role };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw HttpError.unauthorized('Invalid or expired token');
  }
}
