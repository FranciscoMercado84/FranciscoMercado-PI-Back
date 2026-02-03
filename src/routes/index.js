import { Router } from 'express';
import authRoutes from './auth.js';
import productosRoutes from './productos.js';
import carritoRoutes from './carrito.js';
import pedidosRoutes from './pedidos.js';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);

// Rutas protegidas
router.use('/carrito', carritoRoutes);
router.use('/pedidos', pedidosRoutes);

// Ruta de bienvenida a la API
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Panadería Polvillo v1.0',
    endpoints: {
      auth: {
        register: 'POST /v1/auth/register',
        login: 'POST /v1/auth/login',
        profile: 'GET /v1/auth/profile (protected)',
      },
      productos: {
        list: 'GET /v1/productos',
        getById: 'GET /v1/productos/:id',
        create: 'POST /v1/productos (admin)',
        update: 'PUT /v1/productos/:id (admin)',
        delete: 'DELETE /v1/productos/:id (admin)',
      },
      carrito: {
        get: 'GET /v1/carrito (protected)',
        addItem: 'POST /v1/carrito/items (protected)',
        updateItem: 'PUT /v1/carrito/items/:id (protected)',
        removeItem: 'DELETE /v1/carrito/items/:id (protected)',
        clear: 'DELETE /v1/carrito (protected)',
      },
      pedidos: {
        create: 'POST /v1/pedidos (protected)',
        misPedidos: 'GET /v1/pedidos (protected)',
        getById: 'GET /v1/pedidos/:id (protected)',
        getAll: 'GET /v1/pedidos/admin/all (admin)',
        updateEstado: 'PUT /v1/pedidos/:id/estado (admin)',
      },
      health: '/health',
    },
    documentation: '/api-docs',
    authentication: 'Use Bearer token in Authorization header',
  });
});

export default router;
