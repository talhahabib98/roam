import { User } from '@prisma/client';
import { HttpError } from '../../lib/errors';
import { hashPassword } from '../../lib/password';
import { prisma } from '../../lib/prisma';
import { RegisterInput } from './auth.schema';

export type PublicUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>;

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw HttpError.conflict('Email is already registered', 'EMAIL_TAKEN');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      name: input.name,
      role: input.role,
      driver:
        input.role === 'DRIVER'
          ? {
              create: {
                vehicleModel: input.vehicleModel as string,
                vehiclePlate: input.vehiclePlate as string,
              },
            }
          : undefined,
    },
  });

  return toPublicUser(user);
}
