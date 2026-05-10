import { test, expect } from '@playwright/test';

test('Health + Register + Login API flow', async ({ request }) => {
  // baseURL is read from playwright.config.js use.baseURL or env TEST_BASE_URL
  const health = await request.get('/health');
  expect(health.status()).toBe(200);

  // Register new user
  const email = `e2e-${Date.now()}@test.com`;
  const register = await request.post('/v1/auth/register', {
    data: {
      nombre: 'E2E User',
      email,
      password: 'E2EPass123'
    }
  });
  expect([200, 201]).toContain(register.status());

  // Login with created user
  const login = await request.post('/v1/auth/login', {
    data: { email, password: 'E2EPass123' }
  });
  expect(login.status()).toBe(200);
  const body = await login.json();
  expect(body).toHaveProperty('data');
  expect(body.data).toHaveProperty('access_token');
});
