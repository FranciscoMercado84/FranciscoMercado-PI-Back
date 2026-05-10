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
      .optional({ values: 'falsy' })
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

router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Email inválido'),
    validate
  ],
  authController.forgotPassword
);

router.get('/reset-password', authController.validateResetToken);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token requerido'),
    body('newPassword').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    validate
  ],
  authController.resetPassword
);

router.get('/profile', protect, authController.getProfile);

router.put(
  '/profile',
  protect,
  [
    body('nombre').optional().isString().withMessage('Nombre inválido'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('telefono')
      .optional({ values: 'falsy' })
      .matches(/^[0-9]{9}$/)
      .withMessage('Teléfono debe tener 9 dígitos'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    validate
  ],
  authController.updateProfile
);

export default router;
