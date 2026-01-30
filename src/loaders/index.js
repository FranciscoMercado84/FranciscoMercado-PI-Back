import { middlewareLoader } from './middleware.js';
import { routesLoader } from './routes.js';
import logger from '../config/logger.js';

/**
 * Inicializa todos los loaders de la aplicación
 */
export const initLoaders = (app) => {
  logger.info('🔧 Inicializando loaders...');

  // 1. Cargar middlewares
  middlewareLoader(app);

  // 2. Cargar rutas
  routesLoader(app);

  logger.info('✅ Todos los loaders inicializados correctamente');
};
