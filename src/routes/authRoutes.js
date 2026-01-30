/**
 * Authentication Routes
 */

import { Router } from 'express';
import { loginHandler, getCurrentUser, verifyTokenHandler } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Rutas de autenticación
router.post('/login', loginHandler);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/verify', authMiddleware, verifyTokenHandler);

export default router;
