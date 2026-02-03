import routes from '../routes/index.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { errorHandler } from '../middlewares/errorHandler.js';
import { config } from '../config/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Routes loader - Inicializa todas las rutas de la aplicación
 */
export const routesLoader = (app) => {
  // Swagger Documentation
  try {
    const swaggerPath = join(__dirname, '../../docs/api/swagger.yaml');
    const swaggerSpec = YAML.load(swaggerPath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  } catch (error) {
    console.warn('⚠️ No se pudo cargar Swagger docs:', error.message);
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Panadería Polvillo API',
      environment: config.nodeEnv,
      mongodb: 'connected'
    });
  });

  // API routes
  app.use('/v1', routes);

  // 404 handler - debe ir después de todas las rutas
  app.use((req, res) => {
    res.status(404).json({
      code: 'NOT_FOUND',
      message: `Ruta ${req.originalUrl} no encontrada`
    });
  });

  // Error handler global
  app.use(errorHandler);

  console.log('✅ Rutas cargadas');
};

