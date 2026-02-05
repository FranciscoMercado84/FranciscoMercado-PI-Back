/**
 * Controlador de Autenticación - Maneja operaciones de login, registro y tokens
 */

import { Usuario } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * POST /v1/auth/register
 * Registrar nuevo usuario
 */
export const register = asyncHandler(async (req, res) => {
  const { nombre, email, password, telefono } = req.body;

  // Verificar si usuario existe
  const usuarioExiste = await Usuario.findOne({ email });
  if (usuarioExiste) {
    return res.status(400).json({
      code: 'EMAIL_EXISTS',
      message: 'El email ya está registrado'
    });
  }

  // Crear usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    telefono,
    rol: 'customer'
  });

  // Generar token
  const token = usuario.generateAuthToken();

  res.status(201).json({
    data: {
      access_token: token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.rol
      }
    }
  });
});

/**
 * POST /v1/auth/login
 * Autenticar usuario y retornar token JWT
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login attempt:', { email, hasPassword: !!password });

  // Validar que vienen email y password
  if (!email || !password) {
    console.log('❌ Missing credentials');
    return res.status(400).json({
      code: 'MISSING_CREDENTIALS',
      message: 'Email y contraseña son requeridos'
    });
  }

  // Buscar usuario con password
  const usuario = await Usuario.findOne({ email: email.toLowerCase(), activo: true }).select('+password');

  if (!usuario) {
    console.log('❌ User not found:', email);
    return res.status(401).json({
      code: 'INVALID_CREDENTIALS',
      message: 'Email o contraseña incorrectos'
    });
  }

  console.log('✅ User found:', { id: usuario._id, email: usuario.email, rol: usuario.rol });

  // Verificar password
  const passwordValido = await usuario.comparePassword(password);
  if (!passwordValido) {
    console.log('❌ Invalid password for:', email);
    return res.status(401).json({
      code: 'INVALID_CREDENTIALS',
      message: 'Email o contraseña incorrectos'
    });
  }

  console.log('✅ Password valid, generating token');

  // Generar token
  const token = usuario.generateAuthToken();

  console.log('✅ Login successful for:', email);

  res.json({
    data: {
      access_token: token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.rol,
        name: usuario.nombre // Para compatibilidad con frontend
      }
    }
  });
});

/**
 * GET /v1/auth/profile
 * Obtener información del usuario autenticado
 */
export const getProfile = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.user.id);

  res.json({
    data: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      telefono: usuario.telefono
    }
  });
});

export default {
  register,
  login,
  getProfile
};

