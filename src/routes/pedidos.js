import express from 'express';
import * as pedidosController from '../controllers/pedidosController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', pedidosController.create);
router.get('/', pedidosController.getMisPedidos);
router.get('/admin/all', restrictTo('admin'), pedidosController.getAllPedidos);
router.get('/:id', pedidosController.getById);
router.put('/:id/estado', restrictTo('admin'), pedidosController.updateEstado);

export default router;
