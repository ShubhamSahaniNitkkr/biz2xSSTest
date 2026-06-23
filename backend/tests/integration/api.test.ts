import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { getTestApp, getToken, USER1_EMAIL, USER2_EMAIL, teardownTestEnv } from '../helpers/testApp.js';

describe('integration: auth and payroll', () => {
  let app: ReturnType<typeof getTestApp>;

  beforeEach(() => {
    app = getTestApp();
  });

  afterEach(() => {
    teardownTestEnv();
  });

  it('health check returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('login returns token', async () => {
    const res = await request(app).post('/auth/login').send({ email: USER1_EMAIL });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('payroll months scoped to user', async () => {
    const token = getToken(USER1_EMAIL);
    const res = await request(app).get('/payroll/months').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0].netPay).toBe(78300);
  });

  it('tax simulation returns steps', async () => {
    const token = getToken(USER1_EMAIL);
    const res = await request(app)
      .post('/tax/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({ extra80C: 50000 });
    expect(res.status).toBe(200);
    expect(res.body.data.steps.length).toBeGreaterThan(0);
  });

  it('chat with mock LLM returns answer', async () => {
    const token = getToken(USER1_EMAIL);
    const res = await request(app)
      .post('/chat/ask')
      .set('Authorization', `Bearer ${token}`)
      .send({ question: 'How much HRA did I receive?' });
    expect(res.status).toBe(200);
    expect(res.body.data.answer).toBeTruthy();
  });

  it('checklist for user1 has pending items', async () => {
    const token = getToken(USER1_EMAIL);
    const res = await request(app).get('/checklist').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((i: { id: string }) => i.id === 'proof-80c')).toBe(true);
  });

  it('user2 checklist is different', async () => {
    const token = getToken(USER2_EMAIL);
    const res = await request(app).get('/checklist').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('all-done');
  });
});
