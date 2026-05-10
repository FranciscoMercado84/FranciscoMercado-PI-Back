import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../src/config/database.js';
import { Producto } from '../src/models/index.js';

const FIELDS_TO_REMOVE = [
  'stock',
  'stock_minimo',
  'peso',
  'ingredientes',
  'alergenos'
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run')
  };
};

const buildUnsetStage = () => {
  return Object.fromEntries(FIELDS_TO_REMOVE.map(field => [field, '']));
};

const countAffectedProducts = async () => {
  const filter = {
    $or: FIELDS_TO_REMOVE.map(field => ({ [field]: { $exists: true } }))
  };

  const [result] = await Producto.collection.aggregate([
    { $match: filter },
    { $count: 'total' }
  ]).toArray();

  return result?.total || 0;
};

const migrate = async () => {
  const affected = await countAffectedProducts();
  console.log(`Productos con campos obsoletos detectados: ${affected}`);

  if (affected === 0) {
    console.log('No hay documentos que actualizar.');
    return;
  }

  const result = await Producto.collection.updateMany(
    {
      $or: FIELDS_TO_REMOVE.map(field => ({ [field]: { $exists: true } }))
    },
    {
      $unset: buildUnsetStage()
    }
  );

  console.log('Migración completada');
  console.log(`Documentos coincidentes: ${affected}`);
  console.log(`Documentos modificados: ${result.modifiedCount ?? result.result?.nModified ?? 0}`);
};

const main = async () => {
  const { dryRun } = parseArgs();

  try {
    await connectDB();

    if (dryRun) {
      const affected = await countAffectedProducts();
      console.log('Dry run completado');
      console.log(`Productos con campos obsoletos detectados: ${affected}`);
      return;
    }

    await migrate();
  } catch (error) {
    console.error('Error en migración de productos:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

main();