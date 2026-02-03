import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No devolver en queries por defecto
  },
  rol: {
    type: String,
    enum: {
      values: ['customer', 'admin'],
      message: '{VALUE} no es un rol válido'
    },
    default: 'customer'
  },
  telefono: {
    type: String,
    trim: true,
    match: [/^[0-9]{9}$/, 'Teléfono debe tener 9 dígitos']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// HOOKS
// Pre-save: Hashear password si fue modificado
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// MÉTODOS DE INSTANCIA
// Comparar password
usuarioSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generar JWT
usuarioSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, rol: this.rol },
    config.jwt.secret,
    { expiresIn: config.jwt.expiration }
  );
};

export default mongoose.model('Usuario', usuarioSchema);
