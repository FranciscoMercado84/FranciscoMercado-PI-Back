/**
 * Tests de Productos
 * Prueba: CRUD, imágenes, stock, inventario
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { 
  getAdminToken, 
  getClienteToken, 
  createTestProduct,
  VALID_OBJECT_ID,
  connectDB,
  disconnectDB
} from './setup.js';

describe('Productos API - /v1/productos', () => {
  let adminToken;
  let clienteToken;
  let testProductId;

  beforeAll(async () => {
    await connectDB();
    adminToken = await getAdminToken(request, app);
    clienteToken = await getClienteToken(request, app);
    
    // Crear producto de prueba
    const product = await createTestProduct(request, app, adminToken);
    if (product) {
      testProductId = product._id;
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // =========================================================================
  // LISTAR PRODUCTOS - GET /v1/productos
  // =========================================================================
  describe('GET /v1/productos', () => {
    it('debe listar productos sin autenticación', async () => {
      const response = await request(app)
        .get('/v1/productos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
    });

    it('debe paginar resultados', async () => {
      const response = await request(app)
        .get('/v1/productos?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('debe filtrar por categoría', async () => {
      const response = await request(app)
        .get('/v1/productos?categoria=Panadería');

      expect(response.status).toBe(200);
      response.body.data.forEach(producto => {
        expect(producto.categoria).toBe('Panadería');
      });
    });

    it('debe buscar por texto', async () => {
      const response = await request(app)
        .get('/v1/productos?q=pan');

      expect(response.status).toBe(200);
      // La búsqueda de texto debería funcionar
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // =========================================================================
  // OBTENER PRODUCTO - GET /v1/productos/:id
  // =========================================================================
  describe('GET /v1/productos/:id', () => {
    it('debe obtener producto por ID', async () => {
      // Primero obtener un ID válido
      const listResponse = await request(app).get('/v1/productos');
      const productId = listResponse.body.data[0]?._id;

      if (!productId) {
        console.warn('No hay productos para probar');
        return;
      }

      const response = await request(app)
        .get(`/v1/productos/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('nombre');
      expect(response.body.data).toHaveProperty('precio');
      expect(response.body.data).toHaveProperty('categoria');
    });

    it('debe devolver 404 para ID inexistente', async () => {
      const response = await request(app)
        .get(`/v1/productos/${VALID_OBJECT_ID}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('PRODUCTO_NOT_FOUND');
    });
  });

  // =========================================================================
  // CREAR PRODUCTO - POST /v1/productos
  // =========================================================================
  describe('POST /v1/productos', () => {
    it('debe crear producto como admin', async () => {
      const productData = {
        nombre: `Producto Test ${Date.now()}`,
        descripcion: 'Descripción del producto',
        precio: 5.99,
        categoria: 'Panadería',
        stock: 50,
        stock_minimo: 10,
        peso: 200,
        ingredientes: 'Harina, agua, sal',
        alergenos: ['gluten']
      };

      const response = await request(app)
        .post('/v1/productos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.data.nombre).toBe(productData.nombre);
      expect(response.body.data.precio).toBe(productData.precio);
      expect(response.body.data.stock).toBe(productData.stock);
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .post('/v1/productos')
        .send({
          nombre: 'Test',
          precio: 1.00,
          categoria: 'Panadería'
        });

      expect(response.status).toBe(401);
    });

    it('debe rechazar con rol customer', async () => {
      const response = await request(app)
        .post('/v1/productos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          nombre: 'Test',
          precio: 1.00,
          categoria: 'Panadería'
        });

      expect(response.status).toBe(403);
    });

    it('debe rechazar sin campos requeridos', async () => {
      const response = await request(app)
        .post('/v1/productos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          descripcion: 'Solo descripción'
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar categoría inválida', async () => {
      const response = await request(app)
        .post('/v1/productos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Test',
          precio: 1.00,
          categoria: 'Categoría Inexistente'
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar precio negativo', async () => {
      const response = await request(app)
        .post('/v1/productos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Test',
          precio: -5.00,
          categoria: 'Panadería'
        });

      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // ACTUALIZAR PRODUCTO - PUT /v1/productos/:id
  // =========================================================================
  describe('PUT /v1/productos/:id', () => {
    it('debe actualizar producto como admin', async () => {
      if (!testProductId) {
        console.warn('No hay producto de prueba para actualizar');
        return;
      }

      const response = await request(app)
        .put(`/v1/productos/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Producto Actualizado',
          precio: 12.99
        });

      expect(response.status).toBe(200);
      expect(response.body.data.nombre).toBe('Producto Actualizado');
      expect(response.body.data.precio).toBe(12.99);
    });

    it('debe rechazar sin autenticación', async () => {
      if (!testProductId) return;

      const response = await request(app)
        .put(`/v1/productos/${testProductId}`)
        .send({ nombre: 'Nuevo Nombre' });

      expect(response.status).toBe(401);
    });

    it('debe rechazar con rol customer', async () => {
      if (!testProductId) return;

      const response = await request(app)
        .put(`/v1/productos/${testProductId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ nombre: 'Nuevo Nombre' });

      expect(response.status).toBe(403);
    });

    it('debe devolver 404 para ID inexistente', async () => {
      const response = await request(app)
        .put(`/v1/productos/${VALID_OBJECT_ID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  // =========================================================================
  // ELIMINAR PRODUCTO - DELETE /v1/productos/:id
  // =========================================================================
  describe('DELETE /v1/productos/:id', () => {
    let productToDelete;

    beforeAll(async () => {
      // Crear producto específico para eliminar
      productToDelete = await createTestProduct(request, app, adminToken);
    });

    it('debe eliminar (soft delete) producto como admin', async () => {
      if (!productToDelete) {
        console.warn('No hay producto para eliminar');
        return;
      }

      const response = await request(app)
        .delete(`/v1/productos/${productToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('eliminado');
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .delete(`/v1/productos/${VALID_OBJECT_ID}`);

      expect(response.status).toBe(401);
    });

    it('debe rechazar con rol customer', async () => {
      const response = await request(app)
        .delete(`/v1/productos/${VALID_OBJECT_ID}`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(403);
    });
  });

  // =========================================================================
  // GESTIÓN DE STOCK - PUT /v1/productos/:id/stock
  // =========================================================================
  describe('PUT /v1/productos/:id/stock', () => {
    let stockTestProduct;

    beforeAll(async () => {
      stockTestProduct = await createTestProduct(request, app, adminToken);
    });

    it('debe agregar stock', async () => {
      if (!stockTestProduct) return;

      const response = await request(app)
        .put(`/v1/productos/${stockTestProduct._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          operacion: 'agregar',
          cantidad: 20
        });

      expect(response.status).toBe(200);
      expect(response.body.data.stock).toBe(stockTestProduct.stock + 20);
    });

    it('debe reducir stock', async () => {
      if (!stockTestProduct) return;

      const currentStock = stockTestProduct.stock + 20; // Después del test anterior

      const response = await request(app)
        .put(`/v1/productos/${stockTestProduct._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          operacion: 'reducir',
          cantidad: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.data.stock).toBe(currentStock - 5);
    });

    it('debe establecer stock', async () => {
      if (!stockTestProduct) return;

      const response = await request(app)
        .put(`/v1/productos/${stockTestProduct._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          operacion: 'establecer',
          cantidad: 50
        });

      expect(response.status).toBe(200);
      expect(response.body.data.stock).toBe(50);
    });

    it('debe rechazar operación inválida', async () => {
      if (!stockTestProduct) return;

      const response = await request(app)
        .put(`/v1/productos/${stockTestProduct._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          operacion: 'invalida',
          cantidad: 10
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_OPERATION');
    });

    it('no debe permitir stock negativo', async () => {
      if (!stockTestProduct) return;

      // Establecer stock bajo
      await request(app)
        .put(`/v1/productos/${stockTestProduct._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          operacion: 'establecer',
          cantidad: 5
        });

      // Intentar reducir más de lo disponible
      const response = await request(app)
        .put(`/v1/productos/${stockTestProduct._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          operacion: 'reducir',
          cantidad: 100
        });

      expect(response.status).toBe(200);
      expect(response.body.data.stock).toBe(0); // No negativo
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .put(`/v1/productos/${VALID_OBJECT_ID}/stock`)
        .send({ operacion: 'agregar', cantidad: 10 });

      expect(response.status).toBe(401);
    });
  });

  // =========================================================================
  // INVENTARIO - GET endpoints
  // =========================================================================
  describe('GET /v1/productos/inventario/bajo-stock', () => {
    it('debe listar productos con stock bajo como admin', async () => {
      const response = await request(app)
        .get('/v1/productos/inventario/bajo-stock')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .get('/v1/productos/inventario/bajo-stock');

      expect(response.status).toBe(401);
    });

    it('debe rechazar con rol customer', async () => {
      const response = await request(app)
        .get('/v1/productos/inventario/bajo-stock')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /v1/productos/inventario/agotados', () => {
    it('debe listar productos agotados como admin', async () => {
      const response = await request(app)
        .get('/v1/productos/inventario/agotados')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .get('/v1/productos/inventario/agotados');

      expect(response.status).toBe(401);
    });
  });
});
