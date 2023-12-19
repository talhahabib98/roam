import { HttpError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { UpdateLocationInput, UpdateStatusInput } from './drivers.schema';

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
  if (input.status === 'ONLINE' && driver.latitude === null) {
    throw HttpError.conflict('Update your location before going online', 'LOCATION_REQUIRED');
  }

  return prisma.driver.update({ where: { id: driver.id }, data: { status: input.status } });
}

export async function updateDriverLocation(userId: string, input: UpdateLocationInput) {
  const driver = await getDriverByUserId(userId);

  return prisma.driver.update({
    where: { id: driver.id },
    data: {
      latitude: input.latitude,
      longitude: input.longitude,
      locationUpdatedAt: new Date(),
    },
  });
}
