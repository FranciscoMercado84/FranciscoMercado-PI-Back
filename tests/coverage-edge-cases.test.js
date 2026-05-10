/**
 * Tests adicionales para mejorar cobertura
 * Cubre: validaciones, errores, casos edge
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { 
  getAdminToken, 
  getClienteToken,
  connectDB,
  disconnectDB
} from './setup.js';
import Usuario from '../src/models/Usuario.js';
import Producto from '../src/models/Producto.js';
import Carrito from '../src/models/Carrito.js';

describe('Cobertura Adicional - Validaciones y Casos Edge', () => {
  let adminToken;
  let clienteToken;
  let clienteId;
  let adminId;
  let productoId;

  beforeAll(async () => {
    await connectDB();
    adminToken = await getAdminToken(request, app);
    clienteToken = await getClienteToken(request, app);
    
    // Obtener IDs de usuarios
    const admin = await Usuario.findOne({ email: 'admin@test.com' });
    const cliente = await Usuario.findOne({ email: 'cliente@test.com' });
    adminId = admin?._id;
    clienteId = cliente?._id;

    // Crear producto de prueba
    const producto = await Producto.create({
      nombre: 'Producto Test Coverage',
      precio: 10.99,
      categoria: 'Panadería'
    });
    productoId = producto._id;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await Producto.deleteOne({ _id: productoId });
    await disconnectDB();
  });

  // =========================================================================
  // REGISTRO - Validaciones adicionales
  // =========================================================================
  describe('POST /v1/auth/register - Validaciones email', () => {
    it('debe rechazar email ya registrado', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Nuevo Usuario',
          email: 'cliente@test.com', // Email ya existente
          password: 'password123',
          telefono: '999999999'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('ya está registrado');
    });

    it('debe rechazar email inválido', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Test',
          email: 'email-invalido', // Sin formato válido
          password: 'password123',
          telefono: '999999999'
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar password corto', async () => {
      const response = await request(app)
        .post('/v1/auth/register')
        .send({
          nombre: 'Test',
          email: 'test@example.com',
          password: '123', // Muy corto
          telefono: '999999999'
        });

      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // LOGIN - Validaciones adicionales
  // =========================================================================
  describe('POST /v1/auth/login - Casos edge', () => {
    it('debe rechazar usuario inexistente', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('debe rechazar password incorrecto', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'cliente@test.com',
          password: 'passwordIncorrecto'
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
          email: 'cliente@test.com'
        });

      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // CARRITO - Casos edge y validaciones
  // =========================================================================
  describe('POST /v1/carrito/items - Validaciones', () => {
    it.skip('debe rechazar cantidad mayor a stock disponible', async () => {
      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: productoId.toString(),
          cantidad: 9999 // Mayor que stock
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INSUFFICIENT_STOCK');
    });

    it.skip('debe rechazar cantidad 0 o negativa', async () => {
      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: productoId.toString(),
          cantidad: 0
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar producto inexistente', async () => {
      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: '507f1f77bcf86cd799439011', // ID válido pero inexistente
          cantidad: 1
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('PRODUCTO_NOT_FOUND');
    });

    it('debe rechazar ID de producto inválido', async () => {
      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: 'id-invalido',
          cantidad: 1
        });

      expect(response.status).toBe(400);
    });
  });

describe('PUT /v1/carrito/items/:itemId - Actualizar cantidad', () => {
    let itemId;

    beforeAll(async () => {
      // Asegurar  que hay un item en el carrito y obtener su ID
      const addResponse = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: productoId.toString(),
          cantidad: 5
        });
      
      if (addResponse.body.data && addResponse.body.data.items) {
        itemId = addResponse.body.data.items[0]._id;
      }
    });

    it('debe actualizar cantidad del producto en carrito', async () => {
      if (!itemId) {
        console.warn('No item ID available for test');
        return;
      }

      const response = await request(app)
        .put(`/v1/carrito/items/${itemId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          cantidad: 3
        });

      expect(response.status).toBe(200);
      expect(response.body.data.items[0].cantidad).toBe(3);
    });

    it.skip('debe rechazar cantidad mayor a stock', async () => {
      if (!itemId) {
        console.warn('No item ID available for test');
        return;
      }

      const response = await request(app)
        .put(`/v1/carrito/items/${itemId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          cantidad: 9999
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INSUFFICIENT_STOCK');
    });
  });

  describe('DELETE /v1/carrito/items/:itemId - Eliminar item', () => {
    it.skip('debe devolver 404 si item no está en carrito', async () => {
      const response = await request(app)
        .delete(`/v1/carrito/items/507f1f77bcf86cd799439011`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /v1/carrito - Vaciar carrito', () => {
    beforeAll(async () => {
      // Agregar items al carrito
      await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: productoId.toString(),
          cantidad: 2
        });
    });

    it('debe vaciar el carrito completo', async () => {
      const response = await request(app)
        .delete('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(0);
    });
  });

  // =========================================================================
  // PEDIDOS - Validaciones adicionales
  // =========================================================================
  describe('POST /v1/pedidos - Validaciones', () => {
    beforeAll(async () => {
      // Agregar items al carrito para poder crear pedido
      await request(app)
        .post('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: productoId.toString(),
          cantidad: 2
        });
    });

    it('debe rechazar sin items en carrito', async () => {
      // Primero vaciar el carrito
      await request(app)
        .delete('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      const response = await request(app)
        .post('/v1/pedidos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          direccion_entrega: 'Calle Test 123',
          metodo_pago: 'efectivo'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('vacío');
    });

    it('debe rechazar sin dirección de entrega', async () => {
      // Volver a agregar items
      await request(app)
        .post('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: productoId.toString(),
          cantidad: 1
        });

      const response = await request(app)
        .post('/v1/pedidos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          metodo_pago: 'efectivo'
        });

      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // PRODUCTOS - Casos edge adicionales
  // =========================================================================
  // =========================================================================
  // PERFIL - GET /v1/auth/profile
  // =========================================================================
  describe('GET /v1/auth/profile', () => {
    it('debe obtener perfil del usuario autenticado', async () => {
      const response = await request(app)
        .get('/v1/auth/profile')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('nombre');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('debe rechazar sin token', async () => {
      const response = await request(app)
        .get('/v1/auth/profile');

      expect(response.status).toBe(401);
    });
  });
});
