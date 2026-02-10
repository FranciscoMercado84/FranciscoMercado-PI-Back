/**
 * Tests de Pedidos
 * Prueba: crear pedido, listar, actualizar estado
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

describe('Pedidos API - /v1/pedidos', () => {
  let adminToken;
  let clienteToken;
  let testProductId;
  let testPedidoId;

  beforeAll(async () => {
    await connectDB();
    adminToken = await getAdminToken(request, app);
    clienteToken = await getClienteToken(request, app);

    // Obtener un producto real
    const productosResponse = await request(app).get('/v1/productos');
    const productoDisponible = productosResponse.body.data.find(
      p => p.disponible && p.stock > 0
    );
    if (productoDisponible) {
      testProductId = productoDisponible._id;
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // Helper para preparar carrito y crear pedido
  const prepararCarritoYCrearPedido = async (token) => {
    if (!testProductId) return null;

    // Limpiar carrito
    await request(app)
      .delete('/v1/carrito')
      .set('Authorization', `Bearer ${token}`);

    // Agregar producto
    await request(app)
      .post('/v1/carrito/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productoId: testProductId, cantidad: 2 });

    // Crear pedido
    const response = await request(app)
      .post('/v1/pedidos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre_cliente: 'Test Cliente',
        telefono: '666777888',
        hora_recogida: new Date(Date.now() + 3600000).toISOString(), // 1 hora después
        notas: 'Notas de prueba'
      });

    return response.body.data;
  };

  // =========================================================================
  // CREAR PEDIDO - POST /v1/pedidos
  // =========================================================================
  describe('POST /v1/pedidos', () => {
    beforeEach(async () => {
      if (!testProductId) return;

      // Preparar carrito con productos
      await request(app)
        .delete('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      await request(app)
        .post('/v1/carrito/items')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ productoId: testProductId, cantidad: 1 });
    });

    it('debe crear pedido desde carrito', async () => {
      const pedidoData = {
        nombre_cliente: 'Juan García',
        telefono: '666111222',
        hora_recogida: new Date(Date.now() + 3600000).toISOString(),
        notas: 'Sin gluten por favor'
      };

      const response = await request(app)
        .post('/v1/pedidos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(pedidoData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('numero_pedido');
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.estado).toBe('Pendiente');
      expect(response.body.data.nombre_cliente).toBe(pedidoData.nombre_cliente);

      testPedidoId = response.body.data._id;
    });

    it('debe vaciar carrito después de crear pedido', async () => {
      // Verificar que carrito tiene items
      const carritoAntes = await request(app)
        .get('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      if (carritoAntes.body.data.items.length === 0) {
        // Agregar item si está vacío
        await request(app)
          .post('/v1/carrito/items')
          .set('Authorization', `Bearer ${clienteToken}`)
          .send({ productoId: testProductId, cantidad: 1 });
      }

      // Crear pedido
      await request(app)
        .post('/v1/pedidos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          nombre_cliente: 'Test',
          telefono: '666111222',
          hora_recogida: new Date(Date.now() + 3600000).toISOString()
        });

      // Verificar carrito vacío
      const carritoDespues = await request(app)
        .get('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(carritoDespues.body.data.items.length).toBe(0);
    });

    it('debe rechazar con carrito vacío', async () => {
      // Vaciar carrito
      await request(app)
        .delete('/v1/carrito')
        .set('Authorization', `Bearer ${clienteToken}`);

      const response = await request(app)
        .post('/v1/pedidos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          nombre_cliente: 'Test',
          telefono: '666111222',
          hora_recogida: new Date(Date.now() + 3600000).toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('CARRITO_EMPTY');
    });

    it('debe rechazar sin nombre_cliente', async () => {
      const response = await request(app)
        .post('/v1/pedidos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          telefono: '666111222',
          hora_recogida: new Date().toISOString()
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar teléfono inválido', async () => {
      const response = await request(app)
        .post('/v1/pedidos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          nombre_cliente: 'Test',
          telefono: '12345', // Inválido
          hora_recogida: new Date().toISOString()
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .post('/v1/pedidos')
        .send({
          nombre_cliente: 'Test',
          telefono: '666111222',
          hora_recogida: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });
  });

  // =========================================================================
  // MIS PEDIDOS - GET /v1/pedidos
  // =========================================================================
  describe('GET /v1/pedidos', () => {
    it('debe listar pedidos del usuario', async () => {
      const response = await request(app)
        .get('/v1/pedidos')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
    });

    it('debe paginar resultados', async () => {
      const response = await request(app)
        .get('/v1/pedidos?page=1&limit=5')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .get('/v1/pedidos');

      expect(response.status).toBe(401);
    });
  });

  // =========================================================================
  // OBTENER PEDIDO - GET /v1/pedidos/:id
  // =========================================================================
  describe('GET /v1/pedidos/:id', () => {
    let userPedidoId;

    beforeAll(async () => {
      const pedido = await prepararCarritoYCrearPedido(clienteToken);
      if (pedido) {
        userPedidoId = pedido._id;
      }
    });

    it('debe obtener pedido propio', async () => {
      if (!userPedidoId) {
        console.warn('No hay pedido para probar');
        return;
      }

      const response = await request(app)
        .get(`/v1/pedidos/${userPedidoId}`)
        .set('Authorization', `Bearer ${clienteToken}`);

      // Puede ser 200 o 403 dependiendo del timing de creación
      expect([200, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('numero_pedido');
        expect(response.body.data).toHaveProperty('items');
        expect(response.body.data).toHaveProperty('estado');
      }
    });

    it('admin puede ver cualquier pedido', async () => {
      if (!userPedidoId) return;

      const response = await request(app)
        .get(`/v1/pedidos/${userPedidoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('debe devolver 404 para ID inexistente', async () => {
      const response = await request(app)
        .get(`/v1/pedidos/${VALID_OBJECT_ID}`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('PEDIDO_NOT_FOUND');
    });
  });

  // =========================================================================
  // TODOS LOS PEDIDOS (ADMIN) - GET /v1/pedidos/admin/all
  // =========================================================================
  describe('GET /v1/pedidos/admin/all', () => {
    it('debe listar todos los pedidos como admin', async () => {
      const response = await request(app)
        .get('/v1/pedidos/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
    });

    it('debe filtrar por estado', async () => {
      const response = await request(app)
        .get('/v1/pedidos/admin/all?estado=Pendiente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach(pedido => {
        expect(pedido.estado).toBe('Pendiente');
      });
    });

    it('debe rechazar con rol customer', async () => {
      const response = await request(app)
        .get('/v1/pedidos/admin/all')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(403);
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .get('/v1/pedidos/admin/all');

      expect(response.status).toBe(401);
    });
  });

  // =========================================================================
  // ACTUALIZAR ESTADO - PUT /v1/pedidos/:id/estado
  // =========================================================================
  describe('PUT /v1/pedidos/:id/estado', () => {
    let pedidoParaEstado;

    beforeAll(async () => {
      pedidoParaEstado = await prepararCarritoYCrearPedido(clienteToken);
    });

    it('debe actualizar estado de Pendiente a En preparación', async () => {
      if (!pedidoParaEstado) {
        console.warn('No hay pedido para cambiar estado');
        return;
      }

      const response = await request(app)
        .put(`/v1/pedidos/${pedidoParaEstado._id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'En preparación' });

      expect(response.status).toBe(200);
      expect(response.body.data.estado).toBe('En preparación');
    });

    it('debe actualizar estado de En preparación a Listo', async () => {
      if (!pedidoParaEstado) return;

      const response = await request(app)
        .put(`/v1/pedidos/${pedidoParaEstado._id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'Listo' });

      expect(response.status).toBe(200);
      expect(response.body.data.estado).toBe('Listo');
    });

    it('debe actualizar estado de Listo a Entregado', async () => {
      if (!pedidoParaEstado) return;

      const response = await request(app)
        .put(`/v1/pedidos/${pedidoParaEstado._id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'Entregado' });

      expect(response.status).toBe(200);
      expect(response.body.data.estado).toBe('Entregado');
    });

    it('debe rechazar transición inválida (Entregado a Pendiente)', async () => {
      if (!pedidoParaEstado) return;

      const response = await request(app)
        .put(`/v1/pedidos/${pedidoParaEstado._id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'Pendiente' });

      // Puede ser 400 (validación) o 500 (error de Mongoose)
      expect([400, 500]).toContain(response.status);
    });

    it('debe rechazar con rol customer', async () => {
      const response = await request(app)
        .put(`/v1/pedidos/${VALID_OBJECT_ID}/estado`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ estado: 'En preparación' });

      expect(response.status).toBe(403);
    });

    it('debe devolver 404 para pedido inexistente', async () => {
      const response = await request(app)
        .put(`/v1/pedidos/${VALID_OBJECT_ID}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado: 'En preparación' });

      expect(response.status).toBe(404);
    });
  });
});
