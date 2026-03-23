process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../app');

describe('GET /health', () => {
  it('returns HTTP 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('response body has status === "ok"', async () => {
    const res = await request(app).get('/health');
    expect(res.body.status).toBe('ok');
  });

  it('response body has a valid ISO 8601 timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.body.timestamp).toBeDefined();
    const date = new Date(res.body.timestamp);
    expect(date.toISOString()).toBe(res.body.timestamp);
  });

  it('response Content-Type is application/json', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('unknown route returns 404', async () => {
    const res = await request(app).get('/not-a-real-route');
    expect(res.status).toBe(404);
  });
});
