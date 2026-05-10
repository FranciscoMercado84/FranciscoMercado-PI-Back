import { Carrito, Producto } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCarrito = asyncHandler(async (req, res) => {
  let carrito = await Carrito.findOne({ usuario: req.user.id })
    .populate('items.producto', 'nombre precio imagen_url disponible');

  if (!carrito) {
    carrito = await Carrito.create({ usuario: req.user.id, items: [] });
  }

  res.json({ data: carrito });
});

export const addItem = asyncHandler(async (req, res) => {
  // Aceptar tanto producto_id (snake) como productoId (camel)
  const productoId = req.body.producto_id || req.body.productoId;
  const cantidad = req.body.cantidad || 1;

  if (!productoId) {
    return res.status(400).json({
      code: 'MISSING_PRODUCT_ID',
      message: 'El ID del producto es obligatorio (producto_id o productoId)'
    });
  }

  // Verificar producto
  const producto = await Producto.findById(productoId);
  if (!producto) {
    return res.status(404).json({
      code: 'PRODUCTO_NOT_FOUND',
      message: 'Producto no encontrado'
    });
  }

  if (!producto.disponible) {
    return res.status(400).json({
      code: 'PRODUCTO_NOT_AVAILABLE',
      message: 'Producto no disponible'
    });
  }

  let carrito = await Carrito.findOne({ usuario: req.user.id });

  if (!carrito) {
    carrito = new Carrito({ usuario: req.user.id, items: [] });
  }

  // Verificar si producto ya existe
  const itemExistente = carrito.items.find(
    item => item.producto.toString() === productoId
  );

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.items.push({
      producto: productoId,
      cantidad,
      precio_unitario: producto.precio
    });
  }

  await carrito.save();
  await carrito.populate('items.producto', 'nombre precio imagen_url disponible');

  res.status(201).json({ data: carrito });
});

export const updateItem = asyncHandler(async (req, res) => {
  const { cantidad } = req.body;
  const itemId = req.params.id;

  const carrito = await Carrito.findOne({ usuario: req.user.id });
  if (!carrito) {
    return res.status(404).json({
      code: 'CARRITO_NOT_FOUND',
      message: 'Carrito no encontrado'
    });
  }

  const item = carrito.items.id(itemId);
  if (!item) {
    return res.status(404).json({
      code: 'ITEM_NOT_FOUND',
      message: 'Item no encontrado'
    });
  }

  if (cantidad <= 0) {
    item.deleteOne();
  } else {
    item.cantidad = cantidad;
  }

  await carrito.save();
  await carrito.populate('items.producto', 'nombre precio imagen_url');

  res.json({ data: carrito });
});

export const removeItem = asyncHandler(async (req, res) => {
  const carrito = await Carrito.findOne({ usuario: req.user.id });

  if (!carrito) {
    return res.status(404).json({
      code: 'CARRITO_NOT_FOUND',
      message: 'Carrito no encontrado'
    });
  }

  carrito.items.id(req.params.id).deleteOne();
  await carrito.save();

  res.json({ data: carrito });
});

export const clearCarrito = asyncHandler(async (req, res) => {
  const carrito = await Carrito.findOne({ usuario: req.user.id });

  if (carrito) {
    carrito.items = [];
    await carrito.save();
  }

  res.json({ data: carrito });
});
