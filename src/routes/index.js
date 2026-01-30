import { Router } from 'express';
import authRoutes from './authRoutes.js';
// import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Ruta Auth (public - no authentication required)
router.use('/auth', authRoutes);

// TODO: Agregar rutas de la panadería
// router.use('/products', authMiddleware, productRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/orders', authMiddleware, orderRoutes);
// router.use('/cart', authMiddleware, cartRoutes);

// Ruta de bienvenida a la API
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Panadería El Sabor Artesano v1.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me (protected)',
      },
      // TODO: Agregar endpoints de la panadería
      health: '/health',
    },
    documentation: '/api-docs',
    authentication: 'Use Bearer token in Authorization header',
  });
});

export default router;
