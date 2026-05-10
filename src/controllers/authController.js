/**
 * Controlador de Autenticación - Maneja operaciones de login, registro y tokens
 */

import { Usuario, PasswordResetToken } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../services/emailService.js';
import process from 'process';

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

/**
 * PUT /v1/auth/profile
 * Actualizar perfil del usuario autenticado
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { nombre, email, telefono, password } = req.body;

  const usuario = await Usuario.findById(req.user.id);
  if (!usuario) {
    return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' });
  }

  // Si cambia el email, verificar que no exista otro usuario con ese email
  if (email && email.toLowerCase() !== usuario.email) {
    const existente = await Usuario.findOne({ email: email.toLowerCase() });
    if (existente && existente._id.toString() !== usuario._id.toString()) {
      return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'El email ya está en uso' });
    }
    usuario.email = email.toLowerCase();
  }

  if (nombre) usuario.nombre = nombre;
  if (telefono !== undefined) usuario.telefono = telefono;
  if (password) usuario.password = password; // pre-save hook hasheará

  await usuario.save();

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

/**
 * POST /v1/auth/forgot-password
 * Genera token y envía email con enlace de reset (API email)
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email requerido' });

  const usuario = await Usuario.findOne({ email: email.toLowerCase(), activo: true });
  if (!usuario) {
    // No revelar existencia: responder igual
    return res.status(200).json({ success: true, message: 'Si el email existe, se envió un enlace de recuperación' });
  }

  // Eliminar tokens no usados previos
  await PasswordResetToken.deleteMany({ userId: usuario._id, used: false });

  // Generar token random
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await PasswordResetToken.create({ userId: usuario._id, token, expiresAt, used: false });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset/${token}`;

  try {
    await sendPasswordResetEmail(usuario.email, resetLink);
  } catch (err) {
    console.error('Error sending reset email:', err.message || err);
    // No fallar la respuesta por problemas de email
  }

  return res.status(200).json({ success: true, message: 'Si el email existe, se envió un enlace de recuperación' });
});

/**
 * GET /v1/auth/reset-password?token=XXX
 * Valida token
 */
export const validateResetToken = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ success: false, error: 'Token requerido' });

  const tokenDoc = await PasswordResetToken.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
  if (!tokenDoc) return res.status(400).json({ success: false, error: 'Token inválido o expirado' });

  const user = await Usuario.findById(tokenDoc.userId);
  if (!user) return res.status(400).json({ success: false, error: 'Usuario no encontrado' });

  return res.json({ success: true, valid: true, userId: user._id.toString(), email: user.email });
});

/**
 * POST /v1/auth/reset-password
 * Body: { token, newPassword }
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, error: 'Token y nueva contraseña requeridos' });
  if (newPassword.length < 6) return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' });

  const tokenDoc = await PasswordResetToken.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
  if (!tokenDoc) return res.status(400).json({ success: false, error: 'Token inválido, expirado o ya utilizado' });

  const user = await Usuario.findById(tokenDoc.userId).select('+password');
  if (!user) return res.status(400).json({ success: false, error: 'Usuario no encontrado' });

  user.password = newPassword; // pre-save hook will hash
  await user.save();

  tokenDoc.used = true;
  await tokenDoc.save();

  try {
    await sendPasswordChangedEmail(user.email);
  } catch (err) {
    console.error('Error sending password changed email:', err.message || err);
  }

  return res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
});

export default {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  validateResetToken,
  resetPassword
};

