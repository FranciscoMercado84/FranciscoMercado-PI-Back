import { beforeEach, describe, expect, it, vi } from 'vitest';

const aggregateMock = vi.fn();
const findMock = vi.fn();

vi.mock('../src/models/index.js', () => ({
  Pedido: {
    aggregate: aggregateMock,
    find: findMock
  },
  Producto: {}
}));

describe('Reportes Service', () => {
  beforeEach(async () => {
    aggregateMock.mockReset();
    findMock.mockReset();
    vi.resetModules();
  });

  it('debe calcular fecha de inicio para cada periodo', async () => {
    const { obtenerFechaInicio } = await import('../src/services/reportesService.js');

    expect(obtenerFechaInicio('7d') instanceof Date).toBe(true);
    expect(obtenerFechaInicio('30d') instanceof Date).toBe(true);
    expect(obtenerFechaInicio('3m') instanceof Date).toBe(true);
    expect(obtenerFechaInicio('1y') instanceof Date).toBe(true);
    expect(obtenerFechaInicio('desconocido') instanceof Date).toBe(true);
  });

  it('debe devolver estadísticas de ventas', async () => {
    aggregateMock
      .mockResolvedValueOnce([{ ventas_totales: 100, pedidos: 4, clientes_unicos: ['u1', 'u2'] }])
      .mockResolvedValueOnce([{ ventas_totales: 50, pedidos: 2, clientes_unicos: ['u1'] }]);

    const { getEstadisticas } = await import('../src/services/reportesService.js');
    const result = await getEstadisticas('7d');

    expect(result).toEqual(expect.objectContaining({
      ventas_totales: 100,
      pedidos: 4,
      clientes: 2,
      ticket_promedio: 25,
      cambio_ventas: '+100.0%',
      cambio_pedidos: '+100.0%',
      cambio_clientes: '+100.0%',
      cambio_ticket: '+0.0%'
    }));
    expect(aggregateMock).toHaveBeenCalledTimes(2);
  });

  it('debe devolver ventas por día con ceros cuando no hay datos', async () => {
    aggregateMock.mockResolvedValueOnce([{ _id: 2, total: 10.5 }]);

    const { getVentasPorDia } = await import('../src/services/reportesService.js');
    const result = await getVentasPorDia('7d');

    expect(result).toHaveLength(7);
    expect(result[1]).toEqual({ dia: 'L', ventas: 10.5 });
    expect(result[0]).toEqual({ dia: 'D', ventas: 0 });
  });

  it('debe devolver productos más vendidos', async () => {
    aggregateMock.mockResolvedValueOnce([
      { id: 'p1', nombre: 'Pan', ventas: 7, ingresos: 21 },
      { id: 'p2', nombre: 'Croissant', ventas: 5, ingresos: 15 }
    ]);

    const { getProductosMasVendidos } = await import('../src/services/reportesService.js');
    const result = await getProductosMasVendidos(2);

    expect(result).toHaveLength(2);
    expect(aggregateMock).toHaveBeenCalledTimes(1);
  });

  it('debe resumir pedidos por estado', async () => {
    aggregateMock.mockResolvedValueOnce([
      { _id: 'pendiente', cantidad: 2 },
      { _id: 'En preparación', cantidad: 1 },
      { _id: 'Listo', cantidad: 3 },
      { _id: 'Entregado', cantidad: 4 },
      { _id: 'cancelado', cantidad: 5 }
    ]);

    const { getResumenPedidos } = await import('../src/services/reportesService.js');
    const result = await getResumenPedidos();

    expect(result).toEqual({
      pendientes: 2,
      en_proceso: 4,
      completados: 4,
      cancelados: 5
    });
  });

  it('debe generar CSV de ventas', async () => {
    const pedidos = [
      {
        createdAt: new Date('2026-01-01T10:00:00Z'),
        usuario: { nombre: 'Cliente 1', email: 'c1@test.com' },
        total: 12.5,
        estado: 'Entregado'
      }
    ];

    findMock.mockReturnValue({
      populate: () => ({
        sort: async () => pedidos
      })
    });

    const { generarCSVVentas } = await import('../src/services/reportesService.js');
    const csv = await generarCSVVentas('7d');

    expect(csv).toContain('Fecha,Usuario,Email,Total,Estado');
    expect(csv).toContain('Cliente 1');
    expect(findMock).toHaveBeenCalledTimes(1);
  });
});
