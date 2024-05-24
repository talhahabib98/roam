import { afterAll, describe, expect, it } from 'vitest';
import { api, closeDatabase } from './test/helpers';

afterAll(closeDatabase);

describe('app', () => {
  it('responds to the health check', async () => {
    const res = await api().get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('reports database readiness', async () => {
    const res = await api().get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await api().get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
