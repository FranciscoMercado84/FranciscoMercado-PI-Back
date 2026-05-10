import { Producto } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import fs from 'fs/promises';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getAll = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { disponible: true };

  // Filtro por disponibilidad (por defecto solo disponibles)
  // Soporta: true | false | all
  if (req.query.disponible === 'false') {
    filter.disponible = false;
  } else if (req.query.disponible === 'all') {
    delete filter.disponible;
  }

  // Filtro por categoría
  if (req.query.categoria) {
    filter.categoria = req.query.categoria;
  }

  // Búsqueda por nombre
  if (req.query.q) {
    filter.nombre = { $regex: escapeRegExp(req.query.q), $options: 'i' };
  }

  const sortParam = req.query.sort;
  let sort = { destacado: -1, createdAt: -1 };

  if (sortParam === 'mas-vendidos') {
    sort = { ventas_totales: -1, createdAt: -1 };
  } else if (sortParam === 'precio') {
    sort = { precio: 1, createdAt: -1 };
  } else if (sortParam === 'nuevos') {
    sort = { createdAt: -1 };
  } else if (sortParam) {
    const sortField = sortParam.startsWith('-') ? sortParam.slice(1) : sortParam;
    const sortDirection = sortParam.startsWith('-') ? -1 : 1;
    sort = { [sortField]: sortDirection };
  }

  const [productos, total] = await Promise.all([
    Producto.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort),
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
  const producto = await Producto.findByIdAndDelete(req.params.id);

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

export const deleteProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const producto = await Producto.findById(id);
  if (!producto) {
    return res.status(404).json({
      code: 'PRODUCTO_NOT_FOUND',
      message: 'Producto no encontrado'
    });
  }

  if (producto.imagen_public_id) {
    await deleteImage(producto.imagen_public_id);
    producto.imagen_url = '/images/default-pan.jpg';
    producto.imagen_public_id = null;
    await producto.save();
  }

  res.json({
    data: { message: 'Imagen eliminada correctamente' }
  });
});

/**
 * POST /v1/productos/:id/imagen
 * Subir imagen de producto a Cloudinary
 */
export const uploadProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({
      code: 'NO_FILE',
      message: 'No se proporcionó ninguna imagen'
    });
  }

  const producto = await Producto.findById(id);
  if (!producto) {
    await fs.unlink(req.file.path);
    return res.status(404).json({
      code: 'PRODUCTO_NOT_FOUND',
      message: 'Producto no encontrado'
    });
  }

  try {
    if (producto.imagen_public_id) {
      await deleteImage(producto.imagen_public_id);
    }

    const result = await uploadImage(req.file.path);

    producto.imagen_url = result.url;
    producto.imagen_public_id = result.publicId;
    await producto.save();

    await fs.unlink(req.file.path);

    res.json({
      data: {
        imagen_url: producto.imagen_url,
        imagen_public_id: producto.imagen_public_id
      }
    });
  } catch (error) {
    await fs.unlink(req.file.path);
    throw error;
  }
});

/**
 * GET /v1/productos/mas-vendidos
 * Obtener productos más vendidos (públicos)
 */
export const getProductosMasVendidos = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 4;

  const productos = await Producto.find({ disponible: true })
    .sort({ ventas_totales: -1, createdAt: -1 })
    .limit(limit)
    .select('nombre descripcion precio imagen_url categoria ventas_totales');

  res.json({
    data: productos,
    meta: {
      total: productos.length
    }
  });
});
