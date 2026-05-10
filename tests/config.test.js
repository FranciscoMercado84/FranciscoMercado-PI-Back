/**
 * Tests de Configuración
 * Prueba: GET y PUT de configuración general
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { getAdminToken, connectDB, disconnectDB } from './setup.js';

describe('Configuración API - /v1/configuracion-general', () => {
  let adminToken;

  beforeAll(async () => {
    await connectDB();
    adminToken = await getAdminToken(request, app);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // =========================================================================
  // GET CONFIGURACIÓN - GET /v1/configuracion-general
  // =========================================================================
  describe('GET /v1/configuracion-general', () => {
    it('debe obtener configuración sin autenticación', async () => {
      const response = await request(app)
        .get('/v1/configuracion-general');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('contactPhone');
      expect(response.body.data).toHaveProperty('contactEmail');
      expect(response.body.data).toHaveProperty('hours');
    });

    it('debe retornar estructura correcta de horarios', async () => {
      const response = await request(app)
        .get('/v1/configuracion-general');

      expect(response.status).toBe(200);
      const { data } = response.body;
      expect(data.hours).toHaveProperty('weekday');
      expect(data.hours).toHaveProperty('saturday');
      expect(data.hours).toHaveProperty('sunday');
      expect(data.hours.weekday).toHaveProperty('morningOpen');
      expect(data.hours.weekday).toHaveProperty('morningClose');
      expect(data.hours.weekday).toHaveProperty('afternoonOpen');
      expect(data.hours.weekday).toHaveProperty('afternoonClose');
    });
  });

  // =========================================================================
  // ACTUALIZAR CONFIGURACIÓN - PUT /v1/configuracion-general
  // =========================================================================
  describe('PUT /v1/configuracion-general', () => {
    it('debe actualizar configuración como admin', async () => {
      const updateData = {
        contactPhone: '+34 987 654 321',
        contactEmail: 'info@panaderia.com',
        hours: {
          weekday: {
            morningOpen: '08:00',
            morningClose: '14:00',
            afternoonOpen: '18:00',
            afternoonClose: '21:00'
          }
        }
      };

      const response = await request(app)
        .put('/v1/configuracion-general')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.contactPhone).toBe(updateData.contactPhone);
      expect(response.body.data.contactEmail).toBe(updateData.contactEmail);
      expect(response.body.data.hours.weekday.morningOpen).toBe('08:00');
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .put('/v1/configuracion-general')
        .send({
          contactPhone: '+34 111 111 111'
        });

      expect(response.status).toBe(401);
    });

    it('debe rechazar sin rol admin', async () => {
      const clienteToken = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'cliente@test.com',
          password: 'test123'
        })
        .then(res => res.body.data?.access_token);

      if (!clienteToken) {
        console.warn('No se pudo obtener token de cliente');
        return;
      }

      const response = await request(app)
        .put('/v1/configuracion-general')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          contactPhone: '+34 111 111 111'
        });

      expect(response.status).toBe(403);
    });

    it('debe validar email inválido', async () => {
      const response = await request(app)
        .put('/v1/configuracion-general')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contactEmail: 'email-invalido'
        });

      expect(response.status).toBe(400);
    });

    it('debe validar teléfono inválido', async () => {
      const response = await request(app)
        .put('/v1/configuracion-general')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          contactPhone: '123' // muy corto
        });

      expect(response.status).toBe(400);
    });

    it('debe actualizar solo los campos proporcionados', async () => {
      // Primero obtener configuración actual
      const getResponse = await request(app)
        .get('/v1/configuracion-general');
      const originalEmail = getResponse.body.data.contactEmail;

      // Actualizar solo teléfono
      const updateData = {
        contactPhone: '+34 999 999 999'
      };

      const response = await request(app)
        .put('/v1/configuracion-general')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.contactPhone).toBe(updateData.contactPhone);
      expect(response.body.data.contactEmail).toBe(originalEmail);
    });
  });
});
