import express from 'express';
import * as productosController from '../controllers/productosController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/adminMiddleware.js';
import { uploadProductImage } from '../config/multer.js';

const router = express.Router();

// ⚠️ IMPORTANTE: Las rutas especiales/estáticas deben ir ANTES de las rutas dinámicas (/:id)

// Rutas especiales de productos (deben ir ANTES de /:id)
router.get('/mas-vendidos', productosController.getProductosMasVendidos);

// CRUD básico de productos
router
  .route('/')
  .get(productosController.getAll)
  .post(protect, restrictTo('admin'), productosController.create);

router
  .route('/:id')
  .get(productosController.getById)
  .put(protect, restrictTo('admin'), productosController.update)
  .delete(protect, restrictTo('admin'), productosController.deleteProducto);

// Gestión de imágenes
router.post(
  '/:id/imagen',
  protect,
  restrictTo('admin'),
  uploadProductImage.single('imagen'),
  productosController.uploadProductImage
);

router.delete(
  '/:id/imagen',
  protect,
  restrictTo('admin'),
  productosController.deleteProductImage
);

export default router;
