import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, closeDatabase, createTestUser, resetDatabase } from '../../test/helpers';

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('POST /api/auth/register', () => {
  it('registers a rider without exposing the password hash', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ email: 'Rita@Example.com', password: 'password123', name: 'Rita', role: 'RIDER' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: 'rita@example.com', role: 'RIDER' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('requires vehicle details for drivers', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ email: 'd@example.com', password: 'password123', name: 'Dan', role: 'DRIVER' });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('vehicleModel');
  });

  it('rejects duplicate emails', async () => {
    await createTestUser('RIDER', { email: 'dup@example.com' });
    const res = await api()
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123', name: 'Again', role: 'RIDER' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects short passwords', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ email: 'a@example.com', password: 'short', name: 'A', role: 'RIDER' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const { token } = await createTestUser('RIDER', { email: 'login@example.com' });
    expect(token).toBeTruthy();
  });

  it('rejects a wrong password', async () => {
    await createTestUser('RIDER', { email: 'login@example.com' });
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });
});

describe('authentication and roles', () => {
  it('returns the current user for a valid token', async () => {
    const { token } = await createTestUser('RIDER', { email: 'me@example.com' });
    const res = await api().get('/api/users/me').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@example.com');
  });

  it('rejects missing and invalid tokens', async () => {
    expect((await api().get('/api/users/me')).status).toBe(401);
    expect((await api().get('/api/users/me').set(bearer('not-a-token'))).status).toBe(401);
  });

  it('keeps driver endpoints away from riders', async () => {
    const { token } = await createTestUser('RIDER');
    const res = await api().get('/api/drivers/me').set(bearer(token));

    expect(res.status).toBe(403);
  });
});
