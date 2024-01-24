import { describe, expect, it } from 'vitest';
import { calculateFareCents } from './fare';

const rates = { baseCents: 250, perKmCents: 120, minimumCents: 500 };

describe('calculateFareCents', () => {
  it('adds the per-km rate to the base fare', () => {
    expect(calculateFareCents(10, rates)).toBe(1450);
  });

  it('rounds to whole cents', () => {
    expect(calculateFareCents(5.123, rates)).toBe(865);
  });

  it('never goes below the minimum fare', () => {
    expect(calculateFareCents(0.5, rates)).toBe(500);
    expect(calculateFareCents(0, rates)).toBe(500);
  });
});
