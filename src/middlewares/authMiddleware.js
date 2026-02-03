/**
 * Middleware de Autenticación - Valida tokens JWT Bearer
 */

import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';
import { config } from '../config/index.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware para autenticar peticiones usando token JWT Bearer
 * El token debe enviarse en el header Authorization como: Bearer <token>
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      code: 'NO_TOKEN',
      message: 'No estás autenticado. Por favor inicia sesión.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        code: 'USER_INVALID',
        message: 'El usuario no existe o está inactivo'
      });
    }

    req.user = { id: usuario._id, rol: usuario.rol };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Token inválido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 'TOKEN_EXPIRED',
        message: 'Tu sesión ha expirado. Inicia sesión de nuevo.'
      });
    }
    throw error;
  }
});

export default protect;

