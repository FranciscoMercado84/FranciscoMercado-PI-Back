import { Producto } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import fs from 'fs/promises';

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
    // Eliminar archivo temporal
    await fs.unlink(req.file.path);
    return res.status(404).json({
      code: 'PRODUCTO_NOT_FOUND',
      message: 'Producto no encontrado'
    });
  }

  try {
    // Eliminar imagen anterior de Cloudinary si existe
    if (producto.imagen_public_id) {
      await deleteImage(producto.imagen_public_id);
    }

    // Subir nueva imagen
    const result = await uploadImage(req.file.path);

    // Actualizar producto
    producto.imagen_url = result.url;
    producto.imagen_public_id = result.publicId;
    await producto.save();

    // Eliminar archivo temporal
    await fs.unlink(req.file.path);

    res.json({
      data: {
        imagen_url: producto.imagen_url,
        imagen_public_id: producto.imagen_public_id
      }
    });
  } catch (error) {
    // Eliminar archivo temporal en caso de error
    await fs.unlink(req.file.path);
    throw error;
  }
});

/**
 * DELETE /v1/productos/:id/imagen
 * Eliminar imagen de producto
 */
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
 * PUT /v1/productos/:id/stock
 * Actualizar stock de producto
 */
export const updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cantidad, operacion } = req.body; // operacion: 'agregar' | 'reducir' | 'establecer'

  const producto = await Producto.findById(id);
  if (!producto) {
    return res.status(404).json({
      code: 'PRODUCTO_NOT_FOUND',
      message: 'Producto no encontrado'
    });
  }

  switch (operacion) {
    case 'agregar':
      producto.stock += cantidad;
      break;
    case 'reducir':
      producto.stock = Math.max(0, producto.stock - cantidad);
      break;
    case 'establecer':
      producto.stock = cantidad;
      break;
    default:
      return res.status(400).json({
        code: 'INVALID_OPERATION',
        message: 'Operación inválida. Use: agregar, reducir o establecer'
      });
  }

  // Actualizar disponibilidad automáticamente
  if (producto.stock > 0 && !producto.disponible) {
    producto.disponible = true;
  }

  await producto.save();

  res.json({
    data: {
      stock: producto.stock,
      stock_bajo: producto.stock_bajo,
      estado_inventario: producto.estado_inventario,
      disponible: producto.disponible
    }
  });
});

/**
 * GET /v1/productos/inventario/bajo-stock
 * Obtener productos con stock bajo
 */
export const getProductosBajoStock = asyncHandler(async (req, res) => {
  const productos = await Producto.find({
    $expr: { $lte: ['$stock', '$stock_minimo'] }
  }).sort({ stock: 1 });

  res.json({
    data: productos,
    meta: {
      total: productos.length
    }
  });
});

/**
 * GET /v1/productos/inventario/agotados
 * Obtener productos agotados
 */
export const getProductosAgotados = asyncHandler(async (req, res) => {
  const productos = await Producto.find({ stock: 0 }).sort({ updatedAt: -1 });

  res.json({
    data: productos,
    meta: {
      total: productos.length
    }
  });
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
