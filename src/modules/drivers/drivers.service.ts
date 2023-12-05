import { HttpError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';

export async function getDriverByUserId(userId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) {
    throw HttpError.notFound('Driver profile not found');
  }
  return driver;
}
