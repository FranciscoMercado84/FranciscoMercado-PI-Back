import asyncHandler from '../utils/asyncHandler.js';
import {
  getEstadisticas,
  getVentasPorDia,
  getProductosMasVendidos,
  getResumenPedidos,
  generarCSVVentas
} from '../services/reportesService.js';

/**
 * GET /v1/reportes/estadisticas
 * Obtener estadísticas generales del dashboard
 */
export const getEstadisticasGenerales = asyncHandler(async (req, res) => {
  const periodo = req.query.periodo || '7d';
  
  // Validar período
  if (!['7d', '30d', '3m', '1y'].includes(periodo)) {
    return res.status(400).json({
      code: 'INVALID_PERIOD',
      message: 'Período inválido. Use: 7d, 30d, 3m, 1y'
    });
  }

  const estadisticas = await getEstadisticas(periodo);
  
  res.json({
    data: estadisticas,
    meta: { periodo }
  });
});

/**
 * GET /v1/reportes/ventas-por-dia
 * Obtener ventas por día de la semana
 */
export const getVentasDia = asyncHandler(async (req, res) => {
  const periodo = req.query.periodo || '7d';
  
  if (!['7d', '30d', '3m', '1y'].includes(periodo)) {
    return res.status(400).json({
      code: 'INVALID_PERIOD',
      message: 'Período inválido. Use: 7d, 30d, 3m, 1y'
    });
  }

  const ventas = await getVentasPorDia(periodo);
  
  res.json({
    data: ventas,
    meta: { periodo }
  });
});

/**
 * GET /v1/reportes/productos-mas-vendidos
 * Obtener productos más vendidos con estadísticas
 */
export const getProductosMasVendidosReporte = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      code: 'INVALID_LIMIT',
      message: 'Limit debe estar entre 1 y 100'
    });
  }

  const productos = await getProductosMasVendidos(limit);
  
  res.json({
    data: productos,
    meta: {
      total: productos.length,
      limit
    }
  });
});

/**
 * GET /v1/reportes/resumen-pedidos
 * Obtener resumen de pedidos por estado
 */
export const getResumenPedidosReporte = asyncHandler(async (req, res) => {
  const resumen = await getResumenPedidos();
  
  res.json({
    data: resumen
  });
});

/**
 * GET /v1/reportes/exportar
 * Exportar reporte a CSV (opcional)
 */
export const exportarReporte = asyncHandler(async (req, res) => {
  const { tipo, periodo } = req.query;

  if (!tipo || tipo !== 'ventas') {
    return res.status(400).json({
      code: 'INVALID_TYPE',
      message: 'Tipo inválido. Por ahora solo soportamos: ventas'
    });
  }

  if (!['7d', '30d', '3m', '1y'].includes(periodo || '7d')) {
    return res.status(400).json({
      code: 'INVALID_PERIOD',
      message: 'Período inválido. Use: 7d, 30d, 3m, 1y'
    });
  }

  const csv = await generarCSVVentas(periodo || '7d');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="reporte-${tipo}-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});
