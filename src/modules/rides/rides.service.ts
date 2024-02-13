import { RideStatus } from '@prisma/client';
import { HttpError } from '../../lib/errors';
import { calculateFareCents } from '../../lib/fare';
import { distanceKm } from '../../lib/geo';
import { prisma } from '../../lib/prisma';
import { RideRequestInput } from './rides.schema';

const ACTIVE_STATUSES: RideStatus[] = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'];

export function estimateRide(input: RideRequestInput) {
  const distance = distanceKm(input.pickup, input.dropoff);
  return {
    distanceKm: Math.round(distance * 100) / 100,
    fareCents: calculateFareCents(distance),
  };
}

export async function createRide(riderId: string, input: RideRequestInput) {
  const active = await prisma.ride.findFirst({
    where: { riderId, status: { in: ACTIVE_STATUSES } },
  });
  if (active) {
    throw HttpError.conflict('You already have an active ride', 'ACTIVE_RIDE_EXISTS');
  }

  const estimate = estimateRide(input);

  return prisma.ride.create({
    data: {
      riderId,
      pickupLat: input.pickup.latitude,
      pickupLng: input.pickup.longitude,
      dropoffLat: input.dropoff.latitude,
      dropoffLng: input.dropoff.longitude,
      distanceKm: estimate.distanceKm,
      fareCents: estimate.fareCents,
    },
  });
}
