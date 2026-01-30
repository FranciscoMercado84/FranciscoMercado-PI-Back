import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { initAuth } from '../src/services/authService.js';

// Initialize auth before tests
beforeAll(async () => {
  await initAuth();
});

describe('Authentication API', () => {
  let validToken;

  // ===========================================================================
  // LOGIN TESTS
  // ===========================================================================
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.username).toBe('admin');
      expect(response.body.data.user.role).toBe('admin');

      // Store token for later tests
      validToken = response.body.data.token;
    });

    it('should return 401 with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wronguser',
          password: 'admin123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'admin123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ===========================================================================
  // PROTECTED ROUTES TESTS
  // ===========================================================================
  describe('Protected Routes', () => {
    beforeAll(async () => {
      // Get a fresh token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });
      validToken = response.body.data.token;
    });

    describe('GET /api/auth/me', () => {
      it('should return user info with valid token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.username).toBe('admin');
        expect(response.body.data.role).toBe('admin');
      });

      it('should return 401 without token', async () => {
        const response = await request(app).get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should return 401 with invalid token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/verify', () => {
      it('should verify valid token', async () => {
        const response = await request(app)
          .post('/api/auth/verify')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Token is valid');
      });

      it('should reject invalid token', async () => {
        const response = await request(app)
          .post('/api/auth/verify')
          .set('Authorization', 'Bearer fake-token');

        expect(response.status).toBe(401);
      });
    });
  });

  // ===========================================================================
  // NOTES ROUTES PROTECTION TESTS
  // ===========================================================================
  describe('Notes Routes Protection', () => {
    it('should return 401 for /api/notes without token', async () => {
      const response = await request(app).get('/api/notes');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should allow access to /api/notes with valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 for /api/notes with invalid format', async () => {
      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
    });
  });
});

describe('Auth Middleware Edge Cases', () => {
  it('should reject empty bearer token', async () => {
    const response = await request(app)
      .get('/api/notes')
      .set('Authorization', 'Bearer ');

    expect(response.status).toBe(401);
  });

  it('should reject whitespace-only token', async () => {
    const response = await request(app)
      .get('/api/notes')
      .set('Authorization', 'Bearer    ');

    expect(response.status).toBe(401);
  });

  it('should reject malformed JWT', async () => {
    const response = await request(app)
      .get('/api/notes')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid');

    expect(response.status).toBe(401);
  });
});
