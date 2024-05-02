import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

export const api = () => request(app);

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Ride", "Driver", "User" RESTART IDENTITY CASCADE',
  );
}

export async function closeDatabase() {
  await prisma.$disconnect();
}

interface TestUserOptions {
  email?: string;
  password?: string;
  name?: string;
}

let counter = 0;

/** Registers a user through the API and returns their token. */
export async function createTestUser(role: 'RIDER' | 'DRIVER', options: TestUserOptions = {}) {
  counter += 1;
  const email = options.email ?? `${role.toLowerCase()}${counter}@example.com`;
  const password = options.password ?? 'password123';

  await api()
    .post('/api/auth/register')
    .send({
      email,
      password,
      name: options.name ?? `Test ${role} ${counter}`,
      role,
      ...(role === 'DRIVER'
        ? { vehicleModel: 'Toyota Corolla', vehiclePlate: `ABC-${counter}` }
        : {}),
    })
    .expect(201);

  const login = await api().post('/api/auth/login').send({ email, password }).expect(200);
  return { email, password, token: login.body.token as string, user: login.body.user };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
