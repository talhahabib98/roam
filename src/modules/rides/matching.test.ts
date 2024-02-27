import { describe, expect, it } from 'vitest';
import { pickNearestDriver } from './matching';

const pickup = { latitude: 24.86, longitude: 67.0 };

describe('pickNearestDriver', () => {
  it('picks the closest driver', () => {
    const drivers = [
      { id: 'far', latitude: 24.9, longitude: 67.0 },
      { id: 'near', latitude: 24.862, longitude: 67.0 },
    ];
    expect(pickNearestDriver(drivers, pickup, 10)?.id).toBe('near');
  });

  it('ignores drivers outside the radius', () => {
    const drivers = [{ id: 'far', latitude: 25.5, longitude: 67.0 }];
    expect(pickNearestDriver(drivers, pickup, 10)).toBeNull();
  });

  it('ignores drivers without a known location', () => {
    const drivers = [{ id: 'unknown', latitude: null, longitude: null }];
    expect(pickNearestDriver(drivers, pickup, 10)).toBeNull();
  });
});
