import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    unique: true,
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  orden: {
    type: Number,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save: Generar slug desde nombre
categoriaSchema.pre('save', function(next) {
  if (this.isModified('nombre')) {
    this.slug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model('Categoria', categoriaSchema);
