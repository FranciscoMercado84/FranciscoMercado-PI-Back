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
  let error = err;

  // Si no es un ApiError, lo convertimos
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor';
    error = new ApiError(statusCode, message, false);
  }

  // Log del error
  if (error.statusCode >= 500) {
    logger.error(`${error.message}`, {
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
  } else {
    logger.warn(`${error.message}`, {
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Respuesta al cliente
  const response = {
    success: false,
    status: error.status,
    message: error.message,
  };

  // En desarrollo incluimos el stack trace
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};
