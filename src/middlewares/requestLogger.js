import morgan from 'morgan';
import logger from '../config/logger.js';

// Token personalizado para el ID de la request
morgan.token('request-id', (req) => req.id || '-');

// Formato personalizado para logging HTTP
const format = ':method :url :status :res[content-length] - :response-time ms';

// Configuración de morgan con winston
const requestLogger = morgan(format, {
  stream: {
    write: (message) => {
      logger.http(message.trim());
    },
  },
  skip: (req) => {
    // Saltamos logging para health checks en producción
    if (process.env.NODE_ENV === 'production' && req.url === '/health') {
      return true;
    }
    return false;
  },
});

export default requestLogger;
