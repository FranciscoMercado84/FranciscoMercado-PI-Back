import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../src/config/database.js';
import { Pedido, Producto, Usuario } from '../src/models/index.js';

const SEED_TAG = '[SEED_REPORTES_2026]';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {
    mode: 'seed',
    count: 1500
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--cleanup') {
      parsed.mode = 'cleanup';
    }

    if (arg === '--count' && args[i + 1]) {
      const value = parseInt(args[i + 1], 10);
      if (!Number.isNaN(value) && value > 0) {
        parsed.count = value;
      }
      i++;
    }
  }

  return parsed;
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = (arr) => arr[randInt(0, arr.length - 1)];

const getDateRange = () => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() - 1); // ayer

  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1); // ayer del año pasado
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

const randomDateBetween = (start, end) => {
  const ts = randInt(start.getTime(), end.getTime());
  return new Date(ts);
};

const buildPedidoDoc = (index, users, products, start, end) => {
  const user = pickRandom(users);
  const createdAt = randomDateBetween(start, end);
  const itemsCount = randInt(1, Math.min(4, products.length));
  const selected = [];

  // Evitar repetir el mismo producto en un pedido
  while (selected.length < itemsCount) {
    const product = pickRandom(products);
    if (!selected.find(p => p._id.toString() === product._id.toString())) {
      selected.push(product);
    }
  }

  const items = selected.map((product) => {
    const cantidad = randInt(1, 5);
    const precio = Number(product.precio) || 1;
    const subtotal = Math.round(cantidad * precio * 100) / 100;

    return {
      producto: product._id,
      nombre_producto: product.nombre,
      cantidad,
      precio_unitario: precio,
      subtotal
    };
  });

  const total = Math.round(items.reduce((acc, item) => acc + item.subtotal, 0) * 100) / 100;

  const horaRecogida = new Date(createdAt);
  horaRecogida.setHours(randInt(8, 20), randInt(0, 59), 0, 0);

  return {
    numero_pedido: `RPT-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    usuario: user._id,
    items,
    nombre_cliente: user.nombre || 'Cliente Reportes',
    telefono: user.telefono || '600000000',
    total,
    estado: 'Entregado',
    hora_recogida: horaRecogida,
    notas: `${SEED_TAG} datos temporales para validar estadisticas`,
    historial_estados: [{
      estado: 'Entregado',
      fecha: createdAt,
      usuario_cambio: user._id
    }],
    createdAt,
    updatedAt: createdAt
  };
};

const seedPedidos = async (count) => {
  const users = await Usuario.find({ activo: true }).select('_id nombre telefono').lean();
  const products = await Producto.find({}).select('_id nombre precio').lean();

  if (users.length === 0) {
    throw new Error('No hay usuarios activos para generar pedidos');
  }

  if (products.length === 0) {
    throw new Error('No hay productos para generar pedidos');
  }

  const { start, end } = getDateRange();

  const docs = Array.from({ length: count }, (_, index) =>
    buildPedidoDoc(index + 1, users, products, start, end)
  );

  const inserted = await Pedido.insertMany(docs, { ordered: false });

  const resumen = await Pedido.aggregate([
    {
      $match: {
        notas: { $regex: '\\[SEED_REPORTES_2026\\]' }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        desde: { $min: '$createdAt' },
        hasta: { $max: '$createdAt' },
        ventas: { $sum: '$total' }
      }
    }
  ]);

  const data = resumen[0];
  console.log('✅ Seed completado');
  console.log(`   Insertados en esta corrida: ${inserted.length}`);
  console.log(`   Total seed actual (${SEED_TAG}): ${data?.total || 0}`);
  console.log(`   Rango detectado: ${data?.desde?.toISOString()} -> ${data?.hasta?.toISOString()}`);
  console.log(`   Ventas acumuladas seed: €${Math.round((data?.ventas || 0) * 100) / 100}`);
};

const cleanupPedidos = async () => {
  const result = await Pedido.deleteMany({
    notas: { $regex: '\\[SEED_REPORTES_2026\\]' }
  });

  console.log('🧹 Limpieza completada');
  console.log(`   Pedidos eliminados: ${result.deletedCount}`);
};

const main = async () => {
  const { mode, count } = parseArgs();

  try {
    await connectDB();

    if (mode === 'cleanup') {
      await cleanupPedidos();
    } else {
      await seedPedidos(count);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

main();
