import { Producto } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { disponible: true };

  // Filtro por categoría
  if (req.query.categoria) {
    filter.categoria = req.query.categoria;
  }

  // Búsqueda por texto
  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  const [productos, total] = await Promise.all([
    Producto.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ destacado: -1, createdAt: -1 }),
    Producto.countDocuments(filter)
  ]);

  res.json({
    data: productos,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getById = asyncHandler(async (req, res) => {
  const producto = await Producto.findById(req.params.id);

  if (!producto) {
    return res.status(404).json({
      code: 'PRODUCTO_NOT_FOUND',
      message: 'Producto no encontrado'
    });
  }

  res.json({ data: producto });
});

export const create = asyncHandler(async (req, res) => {
  const producto = await Producto.create(req.body);

  res.status(201).json({ data: producto });
});

export const update = asyncHandler(async (req, res) => {
  const producto = await Producto.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!producto) {
    return res.status(404).json({
      code: 'PRODUCTO_NOT_FOUND',
      message: 'Producto no encontrado'
    });
  }

  res.json({ data: producto });
});

export const deleteProducto = asyncHandler(async (req, res) => {
  const producto = await Producto.findByIdAndUpdate(
    req.params.id,
    { disponible: false },
    { new: true }
  );

  if (!producto) {
    return res.status(404).json({
      code: 'PRODUCTO_NOT_FOUND',
      message: 'Producto no encontrado'
    });
  }

  res.json({
    data: { message: 'Producto eliminado correctamente' }
  });
});
