import mongoose from 'mongoose';

const pedidoItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto'
  },
  nombre_producto: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precio_unitario: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  numero_pedido: {
    type: String,
    unique: true,
    default: () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  items: [pedidoItemSchema],
  nombre_cliente: {
    type: String,
    required: [true, 'El nombre del cliente es obligatorio'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true,
    match: [/^[0-9]{9}$/, 'Teléfono debe tener 9 dígitos']
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'En preparación', 'Listo', 'Entregado', 'Cancelado'],
    default: 'Pendiente'
  },
  hora_recogida: {
    type: Date,
    required: [true, 'La hora de recogida es obligatoria']
  },
  notas: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  historial_estados: [{
    estado: String,
    fecha: { type: Date, default: Date.now },
    usuario_cambio: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
  }]
}, {
  timestamps: true
});

// Método para cambiar estado con validación
pedidoSchema.methods.cambiarEstado = async function(nuevoEstado, usuarioId) {
  const transicionesPermitidas = {
    'Pendiente': ['En preparación', 'Cancelado'],
    'En preparación': ['Listo', 'Cancelado'],
    'Listo': ['Entregado'],
    'Entregado': [],
    'Cancelado': []
  };

  if (!transicionesPermitidas[this.estado]?.includes(nuevoEstado)) {
    throw new Error(`No se puede cambiar de ${this.estado} a ${nuevoEstado}`);
  }

  this.estado = nuevoEstado;
  this.historial_estados.push({
    estado: nuevoEstado,
    fecha: new Date(),
    usuario_cambio: usuarioId
  });

  await this.save();
};

// Índices para consultas frecuentes
pedidoSchema.index({ usuario: 1, createdAt: -1 });
pedidoSchema.index({ estado: 1, createdAt: -1 });
pedidoSchema.index({ numero_pedido: 1 });

export default mongoose.model('Pedido', pedidoSchema);
