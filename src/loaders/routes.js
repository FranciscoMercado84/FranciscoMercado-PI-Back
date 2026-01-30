import routes from '../routes/index.js';
import swaggerUi from 'swagger-ui-express';
import logger from '../config/logger.js';

/**
 * Routes loader - Inicializa todas las rutas de la aplicación
 */
export const routesLoader = (app) => {
  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Panadería API',
    });
  });

  // API routes
  app.use('/api', routes);

  // 404 handler - debe ir después de todas las rutas
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado',
      path: req.path,
    });
  });

  // Error handler global
  app.use((err, req, res, next) => {
    logger.error('Error no manejado:', err);
    
    const status = err.status || 500;
    const message = err.message || 'Error interno del servidor';

    res.status(status).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  logger.info('✅ Rutas cargadas');
};
