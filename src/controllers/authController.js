/**
 * Controlador de Autenticación - Maneja operaciones de login y tokens
 */

import { login } from '../services/authService.js';
import logger from '../config/logger.js';

/**
 * POST /api/auth/login
 * Autenticar usuario y retornar token JWT
 */
export const loginHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar entrada
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Username and password are required',
      });
    }

    // Intentar login
    const result = await login(username, password);

    if (!result.success) {
      logger.warn(`Failed login attempt for user: ${username}`);
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: result.error,
      });
    }

    // Retornar token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: result.token,
        user: result.user,
        expiresIn: '24h',
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred during login',
    });
  }
};

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado actual
 */
export const getCurrentUser = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      username: req.user.username,
      role: req.user.role,
    },
  });
};

/**
 * POST /api/auth/verify
 * Verificar si el token es válido
 */
export const verifyTokenHandler = (req, res) => {
  // Si llegamos aquí, el token ya fue verificado por el middleware
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      username: req.user.username,
      role: req.user.role,
    },
  });
};

export default {
  loginHandler,
  getCurrentUser,
  verifyTokenHandler,
};
