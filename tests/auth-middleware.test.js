/**
 * Tests para authMiddleware
 * Aumenta cobertura de authMiddleware.js
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { Usuario } from '../src/models/index.js';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/index.js';

describe('Auth Middleware - Casos Edge', () => {
  let inactiveUserId;

  beforeAll(async () => {
    await connectDB();

    // Crear usuario inactivo
    const inactiveUser = await Usuario.create({
      nombre: 'Usuario Inactivo',
      email: 'inactivo@test.com',
      password: 'password123',
      activo: false
    });
    inactiveUserId = inactiveUser._id.toString();
  });

  afterAll(async () => {
    await Usuario.deleteMany({ email: 'inactivo@test.com' });
    await disconnectDB();
  });

  describe('protect middleware', () => {
    it('debe rechazar usuario inactivo', async () => {
      // Crear token para usuario inactivo
      const token = jwt.sign({ id: inactiveUserId }, config.jwt.secret);

      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('USER_INVALID');
    });

    it('debe rechazar token con usuario inexistente', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const token = jwt.sign({ id: fakeUserId }, config.jwt.secret);

      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('USER_INVALID');
    });

    it('debe rechazar token con firma inválida', async () => {
      const token = jwt.sign({ id: '123' }, 'wrong-secret');

      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_TOKEN');
    });

    it('debe rechazar token expirado', async () => {
      const token = jwt.sign(
        { id: inactiveUserId },
        config.jwt.secret,
        { expiresIn: '0s' }
      );

      // Esperar un momento para asegurar que expira
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('TOKEN_EXPIRED');
    });

    it('debe rechazar header Authorization sin Bearer', async () => {
      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', 'Basic abc123');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('NO_TOKEN');
    });

    it('debe rechazar sin header Authorization', async () => {
      const response = await request(app)
        .get('/v1/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('NO_TOKEN');
    });
  });
});
