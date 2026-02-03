import { Pedido, Carrito } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const { nombre_cliente, telefono, hora_recogida, notas } = req.body;

  // Obtener carrito
  const carrito = await Carrito.findOne({ usuario: req.user.id })
    .populate('items.producto');

  if (!carrito || carrito.items.length === 0) {
    return res.status(400).json({
      code: 'CARRITO_EMPTY',
      message: 'El carrito está vacío'
    });
  }

  // Crear items del pedido
  const items = carrito.items.map(item => ({
    producto: item.producto._id,
    nombre_producto: item.producto.nombre,
    cantidad: item.cantidad,
    precio_unitario: item.producto.precio,
    subtotal: item.cantidad * item.producto.precio
  }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Crear pedido
  const pedido = await Pedido.create({
    usuario: req.user.id,
    items,
    nombre_cliente,
    telefono,
    total: Math.round(total * 100) / 100,
    hora_recogida,
    notas
  });

  // Vaciar carrito
  carrito.items = [];
  await carrito.save();

  await pedido.populate('usuario', 'nombre email');

  res.status(201).json({ data: pedido });
});

export const getMisPedidos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [pedidos, total] = await Promise.all([
    Pedido.find({ usuario: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Pedido.countDocuments({ usuario: req.user.id })
  ]);

  res.json({
    data: pedidos,
    meta: { total, page, limit, pages: Math.ceil(total / limit) }
  });
});

export const getById = asyncHandler(async (req, res) => {
  const pedido = await Pedido.findById(req.params.id)
    .populate('usuario', 'nombre email telefono')
    .populate('items.producto', 'nombre imagen_url');

  if (!pedido) {
    return res.status(404).json({
      code: 'PEDIDO_NOT_FOUND',
      message: 'Pedido no encontrado'
    });
  }

  // Verificar permisos
  if (
    req.user.rol !== 'admin' &&
    pedido.usuario._id.toString() !== req.user.id
  ) {
    return res.status(403).json({
      code: 'ACCESS_DENIED',
      message: 'No tienes permiso para ver este pedido'
    });
  }

  res.json({ data: pedido });
});

export const getAllPedidos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.estado) {
    filter.estado = req.query.estado;
  }

  const [pedidos, total] = await Promise.all([
    Pedido.find(filter)
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Pedido.countDocuments(filter)
  ]);

  res.json({
    data: pedidos,
    meta: { total, page, limit, pages: Math.ceil(total / limit) }
  });
});

export const updateEstado = asyncHandler(async (req, res) => {
  const { estado } = req.body;

  const pedido = await Pedido.findById(req.params.id);
  if (!pedido) {
    return res.status(404).json({
      code: 'PEDIDO_NOT_FOUND',
      message: 'Pedido no encontrado'
    });
  }

  await pedido.cambiarEstado(estado, req.user.id);

  res.json({ data: pedido });
});
