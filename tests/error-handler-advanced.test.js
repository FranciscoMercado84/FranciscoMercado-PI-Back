/**
 * Tests avanzados para errorHandler
 * Aumenta cobertura de errorHandler.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorHandler } from '../src/middlewares/errorHandler.js';

describe('Error Handler - Casos Avanzados', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe('Errores de producción', () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('debe ocultar detalles de error 500 en producción', () => {
      const error = new Error('Database connection failed');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INTERNAL_ERROR',
          message: 'Database connection failed'
        })
      );
      // En producción no se incluye el stack
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String)
        })
      );
    });

    it('debe mostrar detalles para errores 4xx en producción', () => {
      const error = new Error('Validation failed');
      error.statusCode = 400;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed'
        })
      );
    });
  });

  describe('Errores de Mongoose', () => {
    it('debe manejar ValidationError con múltiples campos', () => {
      const error = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: {
          email: { message: 'Email inválido' },
          password: { message: 'Password muy corto' },
          nombre: { message: 'Nombre requerido' }
        }
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR'
        })
      );
    });

    it('debe manejar CastError con path personalizado', () => {
      const error = {
        name: 'CastError',
        value: 'invalid-id-format',
        path: 'productoId',
        kind: 'ObjectId'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INVALID_ID',
          message: 'ID inválido'
        })
      );
    });

    it('debe manejar MongoServerError 11000 con keyPattern complejo', () => {
      const error = {
        name: 'MongoServerError',
        code: 11000,
        keyPattern: { email: 1, telefono: 1 },
        keyValue: { email: 'test@test.com', telefono: '123456789' }
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'DUPLICATE_FIELD'
        })
      );
    });
  });

  describe('Errores con statusCode personalizado', () => {
    it('debe respetar statusCode 403', () => {
      const error = new Error('Access denied');
      error.statusCode = 403;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('debe respetar statusCode 404', () => {
      const error = new Error('Resource not found');
      error.statusCode = 404;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe respetar statusCode 409', () => {
      const error = new Error('Conflict');
      error.statusCode = 409;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('Errores con código personalizado', () => {
    it('debe incluir código de error personalizado', () => {
      const error = new Error('Custom error');
      error.statusCode = 400;
      error.code = 'CUSTOM_ERROR_CODE';

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'CUSTOM_ERROR_CODE'
        })
      );
    });
  });
});
