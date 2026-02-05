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
  // Gestión de imágenes con Cloudinary
  imagen_url: {
    type: String,
    default: '/images/default-pan.jpg'
  },
  imagen_public_id: {
    type: String, // Public ID de Cloudinary para poder eliminar la imagen
    default: null
  },
  categoria: {
    type: String,
    enum: {
      values: [
        'Despensa y básicos',
        'Conservas y Enlatados',
        'Aceites, Vinagres y Salsas',
        'Bebidas y Bodega',
        'Charcutería',
        'Dulces',
        'Panadería'
      ],
      message: '{VALUE} no es una categoría válida'
    },
    required: [true, 'La categoría es obligatoria']
  },
  // Gestión de inventario
  stock: {
    type: Number,
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  stock_minimo: {
    type: Number,
    default: 10,
    min: [0, 'El stock mínimo no puede ser negativo']
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

// Virtual: Indica si el stock está bajo
productoSchema.virtual('stock_bajo').get(function() {
  return this.stock <= this.stock_minimo;
});

// Virtual: Estado del inventario
productoSchema.virtual('estado_inventario').get(function() {
  if (this.stock === 0) return 'agotado';
  if (this.stock <= this.stock_minimo) return 'bajo';
  return 'disponible';
});

// Hook: Actualizar disponibilidad automáticamente basado en stock
productoSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.disponible = false;
  }
  next();
});

// Índices para búsqueda y rendimiento
productoSchema.index({ nombre: 'text', descripcion: 'text' });
productoSchema.index({ categoria: 1, disponible: 1 });
productoSchema.index({ destacado: 1, createdAt: -1 });
productoSchema.index({ stock: 1 }); // Para consultas de inventario

export default mongoose.model('Producto', productoSchema);
