import express from 'express';
import * as productosController from '../controllers/productosController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(productosController.getAll)
  .post(protect, restrictTo('admin'), productosController.create);

router
  .route('/:id')
  .get(productosController.getById)
  .put(protect, restrictTo('admin'), productosController.update)
  .delete(protect, restrictTo('admin'), productosController.deleteProducto);

export default router;
