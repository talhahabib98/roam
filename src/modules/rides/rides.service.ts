import { RideStatus } from '@prisma/client';
import { AuthUser } from '../../middleware/authenticate';
import { HttpError } from '../../lib/errors';
import { calculateFareCents } from '../../lib/fare';
import { distanceKm } from '../../lib/geo';
import { prisma } from '../../lib/prisma';
import { findNearestAvailableDriver } from './matching';
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

  const driver = await findNearestAvailableDriver(input.pickup);
  if (!driver) {
    throw HttpError.conflict('No drivers available nearby', 'NO_DRIVERS_AVAILABLE');
  }

  const estimate = estimateRide(input);

  return prisma.$transaction(async (tx) => {
    // Reserve the driver; fails if someone else grabbed them since the lookup
    const reserved = await tx.driver.updateMany({
      where: { id: driver.id, status: 'ONLINE' },
      data: { status: 'BUSY' },
    });
    if (reserved.count === 0) {
      throw HttpError.conflict('No drivers available nearby', 'NO_DRIVERS_AVAILABLE');
    }

    return tx.ride.create({
      data: {
        riderId,
        driverId: driver.id,
        pickupLat: input.pickup.latitude,
        pickupLng: input.pickup.longitude,
        dropoffLat: input.dropoff.latitude,
        dropoffLng: input.dropoff.longitude,
        distanceKm: estimate.distanceKm,
        fareCents: estimate.fareCents,
      },
    });
  });
}

export async function getRideForUser(rideId: string, user: AuthUser) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { driver: { select: { userId: true } } },
  });
  if (!ride) {
    throw HttpError.notFound('Ride not found');
  }

  const isRider = ride.riderId === user.id;
  const isDriver = ride.driver?.userId === user.id;
  if (!isRider && !isDriver) {
    throw HttpError.forbidden();
  }

  const { driver, ...rest } = ride;
  return rest;
}

type TimestampField = 'acceptedAt' | 'startedAt' | 'completedAt' | 'cancelledAt';

async function getAssignedRide(rideId: string, driverUserId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { driver: { select: { userId: true } } },
  });
  if (!ride) {
    throw HttpError.notFound('Ride not found');
  }
  if (ride.driver?.userId !== driverUserId) {
    throw HttpError.forbidden('This ride is not assigned to you');
  }
  return ride;
}

async function transition(
  rideId: string,
  allowedFrom: RideStatus[],
  to: RideStatus,
  timestamp: TimestampField,
  options: { releaseDriver?: boolean } = {},
) {
  return prisma.$transaction(async (tx) => {
    // The status filter makes the update atomic, so concurrent requests cannot both win
    const updated = await tx.ride.updateMany({
      where: { id: rideId, status: { in: allowedFrom } },
      data: { status: to, [timestamp]: new Date() },
    });
    if (updated.count === 0) {
      throw HttpError.conflict(
        `Ride cannot be moved to ${to} from its current state`,
        'INVALID_RIDE_STATE',
      );
    }

    const ride = await tx.ride.findUniqueOrThrow({ where: { id: rideId } });
    if (options.releaseDriver && ride.driverId) {
      await tx.driver.update({ where: { id: ride.driverId }, data: { status: 'ONLINE' } });
    }
    return ride;
  });
}

export async function acceptRide(rideId: string, driverUserId: string) {
  await getAssignedRide(rideId, driverUserId);
  return transition(rideId, ['REQUESTED'], 'ACCEPTED', 'acceptedAt');
}

export async function startRide(rideId: string, driverUserId: string) {
  await getAssignedRide(rideId, driverUserId);
  return transition(rideId, ['ACCEPTED'], 'IN_PROGRESS', 'startedAt');
}

export async function completeRide(rideId: string, driverUserId: string) {
  await getAssignedRide(rideId, driverUserId);
  return transition(rideId, ['IN_PROGRESS'], 'COMPLETED', 'completedAt', { releaseDriver: true });
}
