/**
 * Tests de Autenticación
 * Prueba: registro, login, perfil
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { TEST_USERS, getAdminToken, generateUniqueEmail, connectDB, disconnectDB } from './setup.js';

describe('Auth API - /v1/auth', () => {
  let adminToken;

  beforeAll(async () => {
    // Conectar a MongoDB
    await connectDB();
    // Obtener token de admin para tests que lo requieran
    adminToken = await getAdminToken(request, app);
  });

  afterAll(async () => {
    // Desconectar de MongoDB
    await disconnectDB();
  });

  // =========================================================================
  // REGISTRO - POST /v1/auth/register
  // =========================================================================
  describe('POST /v1/auth/register', () => {
    it('debe registrar un nuevo usuario correctamente', async () => {
      const uniqueEmail = generateUniqueEmail();
      
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Nuevo Usuario',
          email: uniqueEmail,
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(uniqueEmail.toLowerCase());
      expect(response.body.data.user.role).toBe('customer');
    });

    it('debe registrar usuario con teléfono opcional', async () => {
      const uniqueEmail = generateUniqueEmail();
      
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Usuario Con Teléfono',
          email: uniqueEmail,
          password: 'password123',
          telefono: '666111222'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user).toHaveProperty('id');
    });

    it('debe permitir teléfono vacío', async () => {
      const uniqueEmail = generateUniqueEmail();
      
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Usuario Sin Teléfono',
          email: uniqueEmail,
          password: 'password123',
          telefono: ''
        });

      expect(response.status).toBe(201);
    });

    it('debe rechazar email ya registrado', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Duplicado',
          email: TEST_USERS.admin.email,
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('EMAIL_EXISTS');
    });

    it('debe rechazar sin nombre', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          email: generateUniqueEmail(),
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe rechazar email inválido', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Test',
          email: 'email-invalido',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe rechazar password corto (menos de 6 caracteres)', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Test',
          email: generateUniqueEmail(),
          password: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe rechazar teléfono inválido (no 9 dígitos)', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Test',
          email: generateUniqueEmail(),
          password: 'password123',
          telefono: '12345' // Solo 5 dígitos
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  // =========================================================================
  // LOGIN - POST /v1/auth/login
  // =========================================================================
  describe('POST /v1/auth/login', () => {
    it('debe hacer login con credenciales de admin', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data.user.email).toBe(TEST_USERS.admin.email);
      expect(response.body.data.user.role).toBe('admin');
    });

    it('debe hacer login con credenciales de cliente', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: TEST_USERS.cliente.email,
          password: TEST_USERS.cliente.password
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data.user.role).toBe('customer');
    });

    it('debe rechazar email incorrecto', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'noexiste@email.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('debe rechazar password incorrecto', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: TEST_USERS.admin.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('debe rechazar sin email', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar sin password', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: TEST_USERS.admin.email
        });

      expect(response.status).toBe(400);
    });

    it('debe ser case-insensitive para email', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: TEST_USERS.admin.email.toUpperCase(),
          password: TEST_USERS.admin.password
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('access_token');
    });
  });

  // =========================================================================
  // PERFIL - GET /v1/auth/profile
  // =========================================================================
  describe('GET /v1/auth/profile', () => {
    it('debe devolver perfil con token válido', async () => {
      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nombre');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('rol');
    });

    it('debe rechazar sin token', async () => {
      const response = await request(app)
        .get('/v1/auth/profile');

      expect(response.status).toBe(401);
    });

    it('debe rechazar con token inválido', async () => {
      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('debe rechazar con token malformado', async () => {
      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
    });
  });
});
