import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateRequest.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
      .optional()
      .matches(/^[0-9]{9}$/)
      .withMessage('Teléfono debe tener 9 dígitos'),
    validate
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    validate
  ],
  authController.login
);

router.get('/profile', protect, authController.getProfile);

export default router;
