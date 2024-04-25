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
