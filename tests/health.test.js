/**
 * Tests de Health y endpoints generales
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from './setup.js';

describe('Health & General API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });
  // =========================================================================
  // HEALTH CHECK
  // =========================================================================
  describe('GET /health', () => {
    it('debe retornar estado del servidor', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
    });
  });

  // =========================================================================
  // API ROOT
  // =========================================================================
  describe('GET /v1', () => {
    it('debe retornar información de la API', async () => {
      const response = await request(app).get('/v1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  // =========================================================================
  // 404 HANDLER
  // =========================================================================
  describe('404 Handler', () => {
    it('debe retornar 404 para rutas inexistentes', async () => {
      const response = await request(app).get('/v1/ruta-que-no-existe');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('debe incluir la ruta en el mensaje', async () => {
      const response = await request(app).get('/ruta-inventada');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('ruta-inventada');
    });
  });

  // =========================================================================
  // CORS
  // =========================================================================
  describe('CORS', () => {
    it('debe incluir headers CORS en respuestas', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('debe responder a preflight OPTIONS', async () => {
      const response = await request(app)
        .options('/v1/productos')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(204);
    });
  });

  // =========================================================================
  // SECURITY HEADERS
  // =========================================================================
  describe('Security Headers', () => {
    it('debe incluir X-Content-Type-Options', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});
