const request = require('supertest');
const app = require('../src/index');

describe('Health Routes', () => {
  it('GET /health → 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('devsecops-demo-api');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /health/ready → 200 ready true', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.ready).toBe(true);
  });
});

describe('Users Routes', () => {
  it('GET /api/users → returns user list', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/users/:id → returns single user', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.password).toBeUndefined(); // No sensitive fields
  });

  it('GET /api/users/:id → 400 on invalid id', async () => {
    const res = await request(app).get('/api/users/abc');
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/users/:id → 404 on missing user', async () => {
    const res = await request(app).get('/api/users/9999');
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/users → creates user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Charlie', role: 'editor' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe('Charlie');
  });

  it('POST /api/users → 400 on empty name', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/users → 400 on invalid role', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Eve', role: 'superuser' });
    expect(res.statusCode).toBe(400);
  });
});

describe('404 Handler', () => {
  it('Unknown route → 404', async () => {
    const res = await request(app).get('/this-does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});
