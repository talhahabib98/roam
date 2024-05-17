import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, closeDatabase, createTestUser, resetDatabase } from '../../test/helpers';

beforeEach(resetDatabase);
afterAll(closeDatabase);

const pickup = { latitude: 24.86, longitude: 67.0 };
const dropoff = { latitude: 24.92, longitude: 67.08 };

async function onlineDriver(latitude: number, longitude: number) {
  const driver = await createTestUser('DRIVER');
  await api()
    .put('/api/drivers/me/location')
    .set(bearer(driver.token))
    .send({ latitude, longitude });
  await api().put('/api/drivers/me/status').set(bearer(driver.token)).send({ status: 'ONLINE' });
  return driver;
}

const requestRide = (token: string) =>
  api().post('/api/rides').set(bearer(token)).send({ pickup, dropoff });

describe('fare estimate', () => {
  it('returns distance and fare for a rider', async () => {
    const rider = await createTestUser('RIDER');
    const res = await api()
      .post('/api/rides/estimate')
      .set(bearer(rider.token))
      .send({ pickup, dropoff });

    expect(res.status).toBe(200);
    expect(res.body.estimate.distanceKm).toBeGreaterThan(0);
    expect(res.body.estimate.fareCents).toBeGreaterThanOrEqual(500);
  });
});

describe('ride lifecycle', () => {
  it('runs a ride from request to completion', async () => {
    const driver = await onlineDriver(24.861, 67.001);
    const rider = await createTestUser('RIDER');

    const created = await requestRide(rider.token);
    expect(created.status).toBe(201);
    expect(created.body.ride.status).toBe('REQUESTED');
    const rideId = created.body.ride.id;

    const driverState = await api().get('/api/drivers/me').set(bearer(driver.token));
    expect(driverState.body.driver.status).toBe('BUSY');

    const accepted = await api().post(`/api/rides/${rideId}/accept`).set(bearer(driver.token));
    expect(accepted.body.ride.status).toBe('ACCEPTED');

    const started = await api().post(`/api/rides/${rideId}/start`).set(bearer(driver.token));
    expect(started.body.ride.status).toBe('IN_PROGRESS');

    const completed = await api().post(`/api/rides/${rideId}/complete`).set(bearer(driver.token));
    expect(completed.body.ride.status).toBe('COMPLETED');
    expect(completed.body.ride.completedAt).toBeTruthy();

    const freed = await api().get('/api/drivers/me').set(bearer(driver.token));
    expect(freed.body.driver.status).toBe('ONLINE');

    const riderHistory = await api().get('/api/rides').set(bearer(rider.token));
    expect(riderHistory.body.total).toBe(1);
    expect(riderHistory.body.rides[0].status).toBe('COMPLETED');

    const driverHistory = await api().get('/api/rides?status=COMPLETED').set(bearer(driver.token));
    expect(driverHistory.body.total).toBe(1);
  });

  it('fails when no driver is available', async () => {
    const rider = await createTestUser('RIDER');
    const res = await requestRide(rider.token);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('NO_DRIVERS_AVAILABLE');
  });

  it('assigns the nearest online driver', async () => {
    await onlineDriver(24.95, 67.0);
    const near = await onlineDriver(24.861, 67.001);
    const rider = await createTestUser('RIDER');

    const created = await requestRide(rider.token);
    const nearProfile = await api().get('/api/drivers/me').set(bearer(near.token));

    expect(created.body.ride.driverId).toBe(nearProfile.body.driver.id);
  });

  it('allows only one active ride per rider', async () => {
    await onlineDriver(24.861, 67.001);
    await onlineDriver(24.862, 67.002);
    const rider = await createTestUser('RIDER');

    await requestRide(rider.token).expect(201);
    const second = await requestRide(rider.token);

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('ACTIVE_RIDE_EXISTS');
  });

  it('rejects out-of-order transitions', async () => {
    const driver = await onlineDriver(24.861, 67.001);
    const rider = await createTestUser('RIDER');
    const { body } = await requestRide(rider.token);

    const res = await api().post(`/api/rides/${body.ride.id}/start`).set(bearer(driver.token));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_RIDE_STATE');
  });

  it('frees the driver when the rider cancels', async () => {
    const driver = await onlineDriver(24.861, 67.001);
    const rider = await createTestUser('RIDER');
    const { body } = await requestRide(rider.token);

    const cancelled = await api()
      .post(`/api/rides/${body.ride.id}/cancel`)
      .set(bearer(rider.token));
    expect(cancelled.body.ride.status).toBe('CANCELLED');

    const freed = await api().get('/api/drivers/me').set(bearer(driver.token));
    expect(freed.body.driver.status).toBe('ONLINE');
  });

  it('does not allow cancelling a ride that is already in progress', async () => {
    const driver = await onlineDriver(24.861, 67.001);
    const rider = await createTestUser('RIDER');
    const { body } = await requestRide(rider.token);
    await api().post(`/api/rides/${body.ride.id}/accept`).set(bearer(driver.token));
    await api().post(`/api/rides/${body.ride.id}/start`).set(bearer(driver.token));

    const res = await api().post(`/api/rides/${body.ride.id}/cancel`).set(bearer(rider.token));
    expect(res.status).toBe(409);
  });

  it('hides rides from users who are not part of them', async () => {
    await onlineDriver(24.861, 67.001);
    const rider = await createTestUser('RIDER');
    const stranger = await createTestUser('RIDER');
    const { body } = await requestRide(rider.token);

    const res = await api().get(`/api/rides/${body.ride.id}`).set(bearer(stranger.token));
    expect(res.status).toBe(403);
  });

  it('stops other drivers from acting on a ride', async () => {
    await onlineDriver(24.861, 67.001);
    const other = await onlineDriver(24.95, 67.0);
    const rider = await createTestUser('RIDER');
    const { body } = await requestRide(rider.token);

    const res = await api().post(`/api/rides/${body.ride.id}/accept`).set(bearer(other.token));
    expect(res.status).toBe(403);
  });
});
