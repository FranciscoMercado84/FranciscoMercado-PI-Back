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
  disponible: {
    type: Boolean,
    default: true
  },
  destacado: {
    type: Boolean,
    default: false
  },
  ventas_totales: {
    type: Number,
    default: 0,
    min: [0, 'Las ventas totales no pueden ser negativas']
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.stock;
      delete ret.stock_minimo;
      delete ret.peso;
      delete ret.ingredientes;
      delete ret.alergenos;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Índices para búsqueda y rendimiento
productoSchema.index({ nombre: 'text', descripcion: 'text' });
productoSchema.index({ categoria: 1, disponible: 1 });
productoSchema.index({ destacado: 1, createdAt: -1 });

export default mongoose.model('Producto', productoSchema);
