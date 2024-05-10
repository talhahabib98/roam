import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, closeDatabase, createTestUser, resetDatabase } from '../../test/helpers';

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('driver availability', () => {
  it('starts offline with the vehicle from registration', async () => {
    const { token } = await createTestUser('DRIVER');
    const res = await api().get('/api/drivers/me').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.driver).toMatchObject({ status: 'OFFLINE', vehicleModel: 'Toyota Corolla' });
  });

  it('requires a location before going online', async () => {
    const { token } = await createTestUser('DRIVER');
    const res = await api()
      .put('/api/drivers/me/status')
      .set(bearer(token))
      .send({ status: 'ONLINE' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('LOCATION_REQUIRED');
  });

  it('goes online after reporting a location, and back offline', async () => {
    const { token } = await createTestUser('DRIVER');
    await api()
      .put('/api/drivers/me/location')
      .set(bearer(token))
      .send({ latitude: 24.86, longitude: 67.0 })
      .expect(200);

    const online = await api()
      .put('/api/drivers/me/status')
      .set(bearer(token))
      .send({ status: 'ONLINE' });
    expect(online.body.driver.status).toBe('ONLINE');

    const offline = await api()
      .put('/api/drivers/me/status')
      .set(bearer(token))
      .send({ status: 'OFFLINE' });
    expect(offline.body.driver.status).toBe('OFFLINE');
  });

  it('rejects out-of-range coordinates', async () => {
    const { token } = await createTestUser('DRIVER');
    const res = await api()
      .put('/api/drivers/me/location')
      .set(bearer(token))
      .send({ latitude: 123, longitude: 67.0 });

    expect(res.status).toBe(400);
  });
});
