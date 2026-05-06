import express from 'express';
import * as reportesController from '../controllers/reportesController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Todas las rutas de reportes requieren autenticación y rol de admin
router.use(protect, restrictTo('admin'));

/**
 * GET /v1/reportes/estadisticas
 * Obtener estadísticas generales
 * Query params: ?periodo={7d|30d|3m|1y}
 */
router.get('/estadisticas', reportesController.getEstadisticasGenerales);

/**
 * GET /v1/reportes/ventas-por-dia
 * Obtener ventas por día de la semana
 * Query params: ?periodo={7d|30d|3m|1y}
 */
router.get('/ventas-por-dia', reportesController.getVentasDia);

/**
 * GET /v1/reportes/productos-mas-vendidos
 * Obtener productos más vendidos
 * Query params: ?limit=5
 */
router.get('/productos-mas-vendidos', reportesController.getProductosMasVendidosReporte);

/**
 * GET /v1/reportes/resumen-pedidos
 * Obtener resumen de pedidos por estado
 */
router.get('/resumen-pedidos', reportesController.getResumenPedidosReporte);

/**
 * GET /v1/reportes/exportar
 * Exportar reporte a CSV
 * Query params: ?tipo=ventas&periodo={7d|30d|3m|1y}
 */
router.get('/exportar', reportesController.exportarReporte);

export default router;
