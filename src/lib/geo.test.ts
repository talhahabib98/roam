import { describe, expect, it } from 'vitest';
import { distanceKm } from './geo';

describe('distanceKm', () => {
  it('returns 0 for identical points', () => {
    const point = { latitude: 24.8607, longitude: 67.0011 };
    expect(distanceKm(point, point)).toBe(0);
  });

  it('matches a known city-to-city distance', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    expect(distanceKm(london, paris)).toBeCloseTo(343.6, 0);
  });

  it('is symmetric', () => {
    const a = { latitude: 40.7128, longitude: -74.006 };
    const b = { latitude: 34.0522, longitude: -118.2437 };
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 6);
  });
});
