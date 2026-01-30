/**
 * Servicio de Autenticación - Maneja la generación de tokens JWT y validación de usuarios
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/index.js';
import logger from '../config/logger.js';

// Almacenar contraseña hasheada en memoria (generada al inicio)
let hashedAdminPassword = null;

/**
 * Inicializar el servicio de autenticación hasheando la contraseña del admin
 */
export const initAuth = async () => {
  const saltRounds = 10;
  hashedAdminPassword = await bcrypt.hash(config.admin.password, saltRounds);
  logger.info('Auth service initialized');
};

/**
 * Validar credenciales de usuario
 * @param {string} username - Nombre de usuario a validar
 * @param {string} password - Contraseña a validar
 * @returns {Promise<boolean>} True si las credenciales son válidas
 */
export const validateCredentials = async (username, password) => {
  // Verificar si el nombre de usuario coincide con admin
  if (username !== config.admin.username) {
    return false;
  }

  // Si la contraseña aún no ha sido hasheada, hashearla ahora
  if (!hashedAdminPassword) {
    await initAuth();
  }

  // Comparar contraseña con la contraseña hasheada
  return await bcrypt.compare(password, hashedAdminPassword);
};

/**
 * Generar un token JWT para un usuario
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token JWT
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verificar un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object|null} Payload del token decodificado o null si es inválido
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch {
    return null;
  }
};

/**
 * Iniciar sesión de un usuario y retornar un token
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Resultado del login con token o error
 */
export const login = async (username, password) => {
  const isValid = await validateCredentials(username, password);

  if (!isValid) {
    return {
      success: false,
      error: 'Invalid username or password',
    };
  }

  const token = generateToken({
    username,
    role: 'admin',
    iat: Date.now(),
  });

  logger.info(`User ${username} logged in successfully`);

  return {
    success: true,
    token,
    user: {
      username,
      role: 'admin',
    },
  };
};

export default {
  initAuth,
  validateCredentials,
  generateToken,
  verifyToken,
  login,
};
