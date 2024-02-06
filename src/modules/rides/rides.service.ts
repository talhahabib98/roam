import { calculateFareCents } from '../../lib/fare';
import { distanceKm } from '../../lib/geo';
import { RideRequestInput } from './rides.schema';

export function estimateRide(input: RideRequestInput) {
  const distance = distanceKm(input.pickup, input.dropoff);
  return {
    distanceKm: Math.round(distance * 100) / 100,
    fareCents: calculateFareCents(distance),
  };
}
