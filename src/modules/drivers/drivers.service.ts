import { HttpError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { UpdateStatusInput } from './drivers.schema';

export async function getDriverByUserId(userId: string) {
  const driver = await prisma.driver.findUnique({ where: { userId } });
  if (!driver) {
    throw HttpError.notFound('Driver profile not found');
  }
  return driver;
}

export async function updateDriverStatus(userId: string, input: UpdateStatusInput) {
  const driver = await getDriverByUserId(userId);
  if (driver.status === 'BUSY') {
    throw HttpError.conflict('Cannot change availability during an active ride', 'DRIVER_BUSY');
  }

  return prisma.driver.update({ where: { id: driver.id }, data: { status: input.status } });
}
