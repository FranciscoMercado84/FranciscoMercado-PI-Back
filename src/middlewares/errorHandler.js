import logger from '../config/logger.js';

/**
 * Clase base para errores de la API
 */
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error 400 - Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Solicitud incorrecta') {
    super(400, message);
  }
}

/**
 * Error 404 - Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
  }
}

/**
 * Error 409 - Conflict
 */
export class ConflictError extends ApiError {
  constructor(message = 'El recurso ya existe') {
    super(409, message);
  }
}

/**
 * Error 500 - Internal Server Error
 */
export class InternalError extends ApiError {
  constructor(message = 'Error interno del servidor') {
    super(500, message, false);
  }
}

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Ruta ${req.originalUrl} no encontrada`));
};

/**
 * Middleware centralizado para manejo de errores
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Error de validación',
      details: errors
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      code: 'DUPLICATE_FIELD',
      message: `El ${field} ya existe`
    });
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    return res.status(400).json({
      code: 'INVALID_ID',
      message: 'ID inválido'
    });
  }

  // Error por defecto
  res.status(err.statusCode || 500).json({
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
