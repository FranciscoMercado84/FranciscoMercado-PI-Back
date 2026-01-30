/**
 * Middleware de Autenticación - Valida tokens JWT Bearer
 */

import { verifyToken } from '../services/authService.js';
import logger from '../config/logger.js';

/**
 * Middleware para autenticar peticiones usando token JWT Bearer
 * El token debe enviarse en el header Authorization como: Bearer <token>
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verificar si existe el header Authorization
  if (!authHeader) {
    logger.warn('Authentication failed: No authorization header');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authorization header is required',
    });
  }

  // Verificar si sigue el formato Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: Invalid authorization format');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid authorization format. Use: Bearer <token>',
    });
  }

  // Extraer el token
  const token = authHeader.substring(7); // Remover el prefijo 'Bearer '

  if (!token || token.trim() === '') {
    logger.warn('Authentication failed: Empty token');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token is required',
    });
  }

  // Verificar el token JWT
  const decoded = verifyToken(token);

  if (!decoded) {
    logger.warn('Authentication failed: Invalid or expired token');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }

  // Adjuntar información del usuario a la petición
  req.user = decoded;
  logger.debug(`User ${decoded.username} authenticated successfully`);

  next();
};

/**
 * Middleware para verificar si el usuario tiene rol de admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`Access denied for user: ${req.user?.username || 'unknown'}`);
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }
  next();
};

export default authMiddleware;
