import express from 'express';
import * as carritoController from '../controllers/carritoController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(carritoController.getCarrito).delete(carritoController.clearCarrito);
router.post('/items', carritoController.addItem);
router
  .route('/items/:id')
  .put(carritoController.updateItem)
  .delete(carritoController.removeItem);

export default router;
