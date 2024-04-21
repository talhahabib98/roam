import { Role } from '@prisma/client';
import { jwtVerify, SignJWT } from 'jose';
import { config } from '../config';
import { HttpError } from './errors';

export interface TokenPayload {
  sub: string;
  role: Role;
}

const secret = new TextEncoder().encode(config.jwtSecret);

export function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(config.jwtExpiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    if (!payload.sub || !payload.role) {
      throw HttpError.unauthorized('Invalid token');
    }
    return { sub: payload.sub, role: payload.role as Role };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw HttpError.unauthorized('Invalid or expired token');
  }
}
