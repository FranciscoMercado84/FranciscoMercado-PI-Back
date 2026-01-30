import app from './app.js';
import config from './config/index.js';
import logger from './config/logger.js';
import { connectDB, disconnectDB } from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que el directorio de logs existe
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();

    // Iniciar servidor
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${config.port}`);
      logger.info(`📝 Entorno: ${config.nodeEnv}`);
      logger.info(`🍞 API Panadería disponible en: http://localhost:${config.port}/api`);
      logger.info(`❤️  Health check en: http://localhost:${config.port}/health`);
      logger.info(`📚 Documentación en: http://localhost:${config.port}/api-docs`);
    });

    // Manejo de errores no capturados
    process.on('uncaughtException', (err) => {
      logger.error('Error no capturado:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Promesa rechazada no manejada:', { reason, promise });
    });

    // Cierre elegante
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} recibido. Cerrando servidor...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Servidor cerrado correctamente');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
const server = await startServer();

export default server;
