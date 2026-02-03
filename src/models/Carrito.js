import mongoose from 'mongoose';

const carritoItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: [1, 'La cantidad mínima es 1'],
    default: 1
  },
  precio_unitario: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  }
}, { _id: true });

const carritoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  items: [carritoItemSchema],
  total: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Método para calcular total
carritoSchema.methods.calcularTotal = function() {
  this.total = this.items.reduce((sum, item) => {
    return sum + (item.cantidad * item.precio_unitario);
  }, 0);
  return Math.round(this.total * 100) / 100;
};

// Pre-save: Actualizar total automáticamente
carritoSchema.pre('save', function(next) {
  this.calcularTotal();
  next();
});

export default mongoose.model('Carrito', carritoSchema);
