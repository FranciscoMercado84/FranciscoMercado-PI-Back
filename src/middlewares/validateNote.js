import { BadRequestError } from './errorHandler.js';

/**
 * Middleware para validar los datos de una nota en POST/PUT
 */
export const validateNoteBody = (req, res, next) => {
  const { nombre, contenido } = req.body;

  // Validar que nombre exista y sea string
  if (!nombre || typeof nombre !== 'string') {
    return next(new BadRequestError('El campo "nombre" es requerido y debe ser una cadena de texto'));
  }

  // Validar longitud del nombre
  if (nombre.trim().length === 0) {
    return next(new BadRequestError('El campo "nombre" no puede estar vacío'));
  }

  if (nombre.length > 100) {
    return next(new BadRequestError('El campo "nombre" no puede exceder 100 caracteres'));
  }

  // Validar caracteres inválidos en nombre de archivo
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(nombre)) {
    return next(new BadRequestError('El campo "nombre" contiene caracteres inválidos'));
  }

  // Validar contenido (puede estar vacío pero debe existir)
  if (contenido === undefined || contenido === null) {
    return next(new BadRequestError('El campo "contenido" es requerido'));
  }

  if (typeof contenido !== 'string') {
    return next(new BadRequestError('El campo "contenido" debe ser una cadena de texto'));
  }

  // Sanitizar nombre (quitar espacios extra)
  req.body.nombre = nombre.trim();
  req.body.contenido = contenido;

  next();
};

/**
 * Middleware para validar que contenido existe en PUT
 */
export const validateNoteUpdate = (req, res, next) => {
  const { contenido } = req.body;

  if (contenido === undefined || contenido === null) {
    return next(new BadRequestError('El campo "contenido" es requerido'));
  }

  if (typeof contenido !== 'string') {
    return next(new BadRequestError('El campo "contenido" debe ser una cadena de texto'));
  }

  next();
};
