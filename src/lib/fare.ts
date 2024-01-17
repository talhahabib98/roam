import { config } from '../config';

export interface FareRates {
  baseCents: number;
  perKmCents: number;
  minimumCents: number;
}

/** Base fare plus a per-kilometre rate, never below the minimum fare. */
export function calculateFareCents(distanceKm: number, rates: FareRates = config.fare): number {
  const raw = rates.baseCents + rates.perKmCents * distanceKm;
  return Math.max(rates.minimumCents, Math.round(raw));
}
