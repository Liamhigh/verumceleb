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

  it('health endpoint returns service info', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ 
      ok: true, 
      status: 'healthy',
      service: 'verum-omnis-api'
    });
  });

  it('chat endpoint echoes message', async () => {
    const res = await request(app).post('/chat').send({ message: 'Hello' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.reply).toContain('Hello');
  });

  it('chat endpoint requires message', async () => {
    const res = await request(app).post('/chat').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: 'missing_message' });
  });

  it('rejects anchor without hash', async () => {
    const res = await request(app).post('/v1/anchor').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: 'invalid_hash' });
  });
});

describe('/v1/assistant endpoint', () => {
  it('verify mode returns pack info', async () => {
    const res = await request(app).post('/v1/assistant').send({ mode: 'verify' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, pack: 'founders-release' });
  });

  it('policy mode returns constitution and manifest', async () => {
    const res = await request(app).post('/v1/assistant').send({ mode: 'policy' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.constitution).toBeDefined();
    expect(res.body.manifest).toBeDefined();
  });

  it('anchor mode requires hash', async () => {
    const res = await request(app).post('/v1/assistant').send({ mode: 'anchor' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: 'hash_required_for_anchor' });
  });

  it('anchor mode creates receipt', async () => {
    const res = await request(app).post('/v1/assistant').send({ mode: 'anchor', hash: 'testhash123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, hash: 'testhash123' });
  });

  it('receipt mode retrieves stored receipt', async () => {
    // First anchor a hash
    await request(app).post('/v1/assistant').send({ mode: 'anchor', hash: 'retrievehash' });
    // Then retrieve it
    const res = await request(app).post('/v1/assistant').send({ mode: 'receipt', hash: 'retrievehash' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.receipt).toBeDefined();
  });

  it('notice mode returns licensing terms', async () => {
    const res = await request(app).post('/v1/assistant').send({ mode: 'notice' });
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.notice.citizen).toContain('Free forever');
    expect(res.body.notice.institution).toContain('20%');
  });

  it('rejects invalid mode', async () => {
    const res = await request(app).post('/v1/assistant').send({ mode: 'invalid' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: 'invalid_mode' });
  });
});
