import { Pedido, Producto } from '../models/index.js';

/**
 * Obtener estadísticas generales de ventas para un período
 */
export const getEstadisticas = async (periodo = '7d') => {
  const fechaInicio = obtenerFechaInicio(periodo);
  
  // Estadísticas del período actual
  const statsActual = await Pedido.aggregate([
    {
      $match: {
        createdAt: { $gte: fechaInicio },
        estado: 'Entregado'
      }
    },
    {
      $group: {
        _id: null,
        ventas_totales: { $sum: '$total' },
        pedidos: { $sum: 1 },
        clientes_unicos: { $addToSet: '$usuario' }
      }
    }
  ]);

  const fechaInicioPeriodoAnterior = obtenerFechaInicio(periodo, true);
  const fechaAnterior = obtenerFechaInicio(periodo);

  // Estadísticas del período anterior para comparación
  const statsAnterior = await Pedido.aggregate([
    {
      $match: {
        createdAt: { 
          $gte: fechaInicioPeriodoAnterior,
          $lt: fechaInicio
        },
        estado: 'Entregado'
      }
    },
    {
      $group: {
        _id: null,
        ventas_totales: { $sum: '$total' },
        pedidos: { $sum: 1 },
        clientes_unicos: { $addToSet: '$usuario' }
      }
    }
  ]);

  const actual = statsActual[0] || {
    ventas_totales: 0,
    pedidos: 0,
    clientes_unicos: []
  };

  const anterior = statsAnterior[0] || {
    ventas_totales: 0,
    pedidos: 0,
    clientes_unicos: []
  };

  const calcularCambio = (actual, anterior) => {
    if (anterior === 0) return actual > 0 ? '+100%' : '0%';
    const porcentaje = ((actual - anterior) / anterior) * 100;
    return (porcentaje >= 0 ? '+' : '') + porcentaje.toFixed(1) + '%';
  };

  return {
    ventas_totales: Math.round(actual.ventas_totales * 100) / 100,
    pedidos: actual.pedidos,
    clientes: actual.clientes_unicos.length,
    ticket_promedio: actual.pedidos > 0 
      ? (Math.round((actual.ventas_totales / actual.pedidos) * 100) / 100)
      : 0,
    cambio_ventas: calcularCambio(actual.ventas_totales, anterior.ventas_totales),
    cambio_pedidos: calcularCambio(actual.pedidos, anterior.pedidos),
    cambio_clientes: calcularCambio(actual.clientes_unicos.length, anterior.clientes_unicos.length),
    cambio_ticket: calcularCambio(
      actual.pedidos > 0 ? actual.ventas_totales / actual.pedidos : 0,
      anterior.pedidos > 0 ? anterior.ventas_totales / anterior.pedidos : 0
    )
  };
};

/**
 * Obtener ventas por día de la semana
 */
export const getVentasPorDia = async (periodo = '7d') => {
  const fechaInicio = obtenerFechaInicio(periodo);
  const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  const ventas = await Pedido.aggregate([
    {
      $match: {
        createdAt: { $gte: fechaInicio },
        estado: 'Entregado'
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' }, // 1=Sunday, 7=Saturday
        total: { $sum: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Mapear índices de día a etiquetas
  const resultado = diasSemana.map((dia, index) => {
    const ventaDia = ventas.find(v => v._id === (index + 1) % 7 || (v._id === 1 && index === 0));
    return {
      dia,
      ventas: ventaDia ? Math.round(ventaDia.total * 100) / 100 : 0
    };
  });

  return resultado;
};

/**
 * Obtener productos más vendidos
 */
export const getProductosMasVendidos = async (limit = 5) => {
  // Agrupar por producto y contar cantidades vendidas
  const productos = await Pedido.aggregate([
    {
      $match: { estado: 'Entregado' }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.producto',
        cantidad_vendida: { $sum: '$items.cantidad' },
        ingresos: { $sum: '$items.subtotal' }
      }
    },
    {
      $sort: { cantidad_vendida: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'productos',
        localField: '_id',
        foreignField: '_id',
        as: 'producto_info'
      }
    },
    {
      $unwind: '$producto_info'
    },
    {
      $project: {
        id: '$_id',
        nombre: '$producto_info.nombre',
        ventas: '$cantidad_vendida',
        ingresos: { $round: ['$ingresos', 2] },
        _id: 0
      }
    }
  ]);

  return productos;
};

/**
 * Obtener resumen de pedidos por estado
 */
export const getResumenPedidos = async () => {
  const resumen = await Pedido.aggregate([
    {
      $group: {
        _id: '$estado',
        cantidad: { $sum: 1 }
      }
    }
  ]);

  const resultado = {
    pendientes: 0,
    en_proceso: 0,
    completados: 0,
    cancelados: 0
  };

  resumen.forEach(item => {
    if (item._id === 'pendiente') resultado.pendientes = item.cantidad;
    else if (item._id === 'En preparación' || item._id === 'Listo') resultado.en_proceso += item.cantidad;
    else if (item._id === 'Entregado') resultado.completados = item.cantidad;
    else if (item._id === 'cancelado') resultado.cancelados = item.cantidad;
  });

  return resultado;
};

/**
 * Obtener fecha de inicio según el período
 * @param {string} periodo - '7d', '30d', '3m', '1y'
 * @param {boolean} anterior - obtener fecha del período anterior
 */
export function obtenerFechaInicio(periodo = '7d', anterior = false) {
  const ahora = new Date();
  const offset = anterior ? 2 : 1;

  let dias = 7;
  switch (periodo) {
    case '30d':
      dias = 30;
      break;
    case '3m':
      dias = 90;
      break;
    case '1y':
      dias = 365;
      break;
    case '7d':
    default:
      dias = 7;
  }

  const fecha = new Date(ahora);
  fecha.setDate(fecha.getDate() - (dias * offset));
  return fecha;
}

/**
 * Generar datos para exportación a CSV
 */
export const generarCSVVentas = async (periodo = '7d') => {
  const fechaInicio = obtenerFechaInicio(periodo);
  
  const pedidos = await Pedido.find({
    createdAt: { $gte: fechaInicio },
    estado: 'Entregado'
  })
    .populate('usuario', 'nombre email')
    .sort({ createdAt: -1 });

  let csv = 'Fecha,Usuario,Email,Total,Estado\n';
  
  pedidos.forEach(pedido => {
    const fecha = pedido.createdAt.toISOString().split('T')[0];
    csv += `${fecha},"${pedido.usuario?.nombre || 'Anónimo'}","${pedido.usuario?.email || 'N/A'}",${pedido.total},${pedido.estado}\n`;
  });

  return csv;
};
