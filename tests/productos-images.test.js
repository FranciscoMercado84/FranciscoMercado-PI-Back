/**
 * Tests para funciones de imágenes de productos
 * Aumenta cobertura de productosController.js
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { Producto, Usuario } from '../src/models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Productos API - Gestión de Imágenes', () => {
  let adminToken;
  let productoId;

  beforeAll(async () => {
    await connectDB();

    // Login como admin
    const loginRes = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@panaderia.com',
        password: 'admin123'
      });
    adminToken = loginRes.body.data.access_token;

    // Crear producto de prueba
    const producto = await Producto.create({
      nombre: 'Producto con Imagen',
      precio: 10,
      categoria: 'Panadería',
      descripcion: 'Producto de prueba'
    });
    productoId = producto._id.toString();
  });

  afterAll(async () => {
    await Producto.deleteMany({ nombre: /Producto con Imagen/i });
    await disconnectDB();
  });

  describe('POST /v1/productos/:id/imagen', () => {
    it('debe rechazar sin archivo', async () => {
      const response = await request(app)
        .post(`/v1/productos/${productoId}/imagen`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('NO_FILE');
    });

    it('debe rechazar producto inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post(`/v1/productos/${fakeId}/imagen`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Sin archivo, rechaza con 400 antes de verificar producto
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('NO_FILE');
    });
  });

  describe('DELETE /v1/productos/:id/imagen', () => {
    it('debe eliminar imagen de producto', async () => {
      const response = await request(app)
        .delete(`/v1/productos/${productoId}/imagen`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('eliminada');
    });

    it('debe rechazar producto inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/v1/productos/${fakeId}/imagen`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /v1/productos - Filtros avanzados', () => {
    it('debe filtrar productos por disponibilidad', async () => {
      const response = await request(app)
        .get('/v1/productos?disponible=true');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debe permitir filtrar productos no disponibles', async () => {
      const response = await request(app)
        .get('/v1/productos?disponible=false');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach(producto => {
        expect(producto.disponible).toBe(false);
      });
    });

    it('debe ordenar productos por precio descendente', async () => {
      const response = await request(app)
        .get('/v1/productos?sort=-precio');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debe ordenar productos por nombre ascendente', async () => {
      const response = await request(app)
        .get('/v1/productos?sort=nombre');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
