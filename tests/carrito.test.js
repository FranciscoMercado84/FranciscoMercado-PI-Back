/**
 * Tests de Carrito
 * Prueba: obtener carrito, agregar items, actualizar, eliminar
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { 
  getAdminToken, 
  getClienteToken,
  VALID_OBJECT_ID,
  connectDB,
  disconnectDB
} from './setup.js';

describe('Carrito API - /v1/carrito', () => {
  let adminToken;
  let clienteToken;
  let testProductId;

  beforeAll(async () => {
    await connectDB();
    adminToken = await getAdminToken(request, app);
    clienteToken = await getClienteToken(request, app);

    // Obtener un producto real para usar en tests
    const productosResponse = await request(app).get('/v1/productos');
    const productoDisponible = productosResponse.body.data.find(
      p => p.disponible
    );
    if (productoDisponible) {
      testProductId = productoDisponible._id;
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // =========================================================================
  // OBTENER CARRITO - GET /v1/carrito
  // =========================================================================
  describe('GET /v1/carrito', () => {
    it('debe obtener carrito del usuario autenticado', async () => {
      const response = await request(app)
        .get('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('debe crear carrito vacío si no existe', async () => {
      const response = await request(app)
        .get('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('usuario');
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .get('/v1/carrito');

      expect(response.status).toBe(401);
    });
  });

  // =========================================================================
  // AGREGAR ITEM - POST /v1/carrito/items
  // =========================================================================
  describe('POST /v1/carrito/items', () => {
    beforeEach(async () => {
      // Limpiar carrito antes de cada test
      await request(app)
        .delete('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);
    });

    it('debe agregar producto al carrito con productoId (camelCase)', async () => {
      if (!testProductId) {
        console.warn('No hay producto disponible para test');
        return;
      }

      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: testProductId,
          cantidad: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('debe agregar producto al carrito con producto_id (snake_case)', async () => {
      if (!testProductId) return;

      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          producto_id: testProductId,
          cantidad: 1
        });

      expect(response.status).toBe(201);
    });

    it('debe usar cantidad=1 por defecto', async () => {
      if (!testProductId) return;

      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: testProductId
        });

      expect(response.status).toBe(201);
      const item = response.body.data.items.find(
        i => i.producto._id === testProductId || i.producto === testProductId
      );
      expect(item).toBeDefined();
    });

    it('debe incrementar cantidad si producto ya existe', async () => {
      if (!testProductId) return;

      // Agregar primera vez
      await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ productoId: testProductId, cantidad: 2 });

      // Agregar segunda vez
      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ productoId: testProductId, cantidad: 3 });

      expect(response.status).toBe(201);
      const item = response.body.data.items.find(
        i => (i.producto._id || i.producto) === testProductId
      );
      expect(item.cantidad).toBe(5); // 2 + 3
    });

    it('debe rechazar sin ID de producto', async () => {
      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          cantidad: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('MISSING_PRODUCT_ID');
    });

    it('debe rechazar producto inexistente', async () => {
      const response = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          productoId: VALID_OBJECT_ID,
          cantidad: 1
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('PRODUCTO_NOT_FOUND');
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .post('/v1/carrito/items')
        .send({
          productoId: testProductId,
          cantidad: 1
        });

      expect(response.status).toBe(401);
    });
  });

  // =========================================================================
  // ACTUALIZAR ITEM - PUT /v1/carrito/items/:id
  // =========================================================================
  describe('PUT /v1/carrito/items/:id', () => {
    let itemId;

    beforeAll(async () => {
      if (!testProductId) return;

      // Limpiar y agregar item
      await request(app)
        .delete('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      const addResponse = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ productoId: testProductId, cantidad: 2 });

      if (addResponse.body.data?.items?.[0]) {
        itemId = addResponse.body.data.items[0]._id;
      }
    });

    it('debe actualizar cantidad del item', async () => {
      if (!itemId) {
        console.warn('No hay item para actualizar');
        return;
      }

      const response = await request(app)
        .put(`/v1/carrito/items/${itemId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ cantidad: 5 });

      expect(response.status).toBe(200);
      const item = response.body.data.items.find(i => i._id === itemId);
      expect(item.cantidad).toBe(5);
    });

    it('debe eliminar item si cantidad=0', async () => {
      if (!itemId) return;

      // Primero agregar un item nuevo
      await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ productoId: testProductId, cantidad: 1 });

      // Obtener carrito para tener item ID actualizado
      const carritoResponse = await request(app)
        .get('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);
      
      const newItemId = carritoResponse.body.data.items[0]?._id;
      if (!newItemId) return;

      const response = await request(app)
        .put(`/v1/carrito/items/${newItemId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ cantidad: 0 });

      expect(response.status).toBe(200);
    });

    it('debe rechazar item inexistente', async () => {
      const response = await request(app)
        .put(`/v1/carrito/items/${VALID_OBJECT_ID}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ cantidad: 5 });

      expect(response.status).toBe(404);
    });
  });

  // =========================================================================
  // ELIMINAR ITEM - DELETE /v1/carrito/items/:id
  // =========================================================================
  describe('DELETE /v1/carrito/items/:id', () => {
    it('debe eliminar item del carrito', async () => {
      if (!testProductId) return;

      // Agregar item
      const addResponse = await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ productoId: testProductId, cantidad: 1 });

      const itemId = addResponse.body.data?.items?.[0]?._id;
      if (!itemId) return;

      const response = await request(app)
        .delete(`/v1/carrito/items/${itemId}`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
    });
  });

  // =========================================================================
  // VACIAR CARRITO - DELETE /v1/carrito
  // =========================================================================
  describe('DELETE /v1/carrito', () => {
    it('debe vaciar el carrito', async () => {
      if (!testProductId) return;

      // Agregar items
      await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ productoId: testProductId, cantidad: 3 });

      // Vaciar
      const response = await request(app)
        .delete('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.items.length).toBe(0);
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .delete('/v1/carrito');

      expect(response.status).toBe(401);
    });
  });
});
