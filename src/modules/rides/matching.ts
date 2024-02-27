import { Driver } from '@prisma/client';
import { config } from '../../config';
import { Coordinates, distanceKm } from '../../lib/geo';
import { prisma } from '../../lib/prisma';

type LocatedDriver = Pick<Driver, 'id' | 'latitude' | 'longitude'>;

/** Returns the closest driver within the radius, or null when nobody is close enough. */
export function pickNearestDriver<T extends LocatedDriver>(
  drivers: T[],
  pickup: Coordinates,
  radiusKm: number,
): T | null {
  let nearest: T | null = null;
  let nearestDistance = Infinity;

  for (const driver of drivers) {
    if (driver.latitude === null || driver.longitude === null) continue;
    const distance = distanceKm(pickup, {
      latitude: driver.latitude,
      longitude: driver.longitude,
    });
    if (distance <= radiusKm && distance < nearestDistance) {
      nearest = driver;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export async function findNearestAvailableDriver(pickup: Coordinates) {
  const candidates = await prisma.driver.findMany({
    where: { status: 'ONLINE', latitude: { not: null }, longitude: { not: null } },
  });
  return pickNearestDriver(candidates, pickup, config.matchRadiusKm);
}
