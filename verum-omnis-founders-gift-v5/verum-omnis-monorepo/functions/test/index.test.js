import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app;

beforeAll(async () => {
  process.env.SKIP_IMMUTABLE_VERIFY = '1';
  ({ app } = await import('../index.js'));
});

describe('verum omnis api', () => {
  it('reports healthy status', async () => {
    const res = await request(app).get('/v1/verify');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it('rejects anchor without hash', async () => {
    const res = await request(app).post('/v1/anchor').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: 'invalid_hash' });
  });
});
