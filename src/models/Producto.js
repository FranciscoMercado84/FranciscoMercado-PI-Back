import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo'],
    set: v => Math.round(v * 100) / 100 // Redondear a 2 decimales
  },
  imagen_url: {
    type: String,
    default: '/images/default-pan.jpg'
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría es obligatoria']
  },
  disponible: {
    type: Boolean,
    default: true
  },
  peso: {
    type: Number, // en gramos
    min: [0, 'El peso no puede ser negativo']
  },
  ingredientes: {
    type: String,
    trim: true
  },
  alergenos: [{
    type: String,
    trim: true
  }],
  destacado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsqueda y rendimiento
productoSchema.index({ nombre: 'text', descripcion: 'text' });
productoSchema.index({ categoria: 1, disponible: 1 });
productoSchema.index({ destacado: 1, createdAt: -1 });

export default mongoose.model('Producto', productoSchema);
