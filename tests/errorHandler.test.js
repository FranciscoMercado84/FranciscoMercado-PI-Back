import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  ApiError, 
  BadRequestError, 
  NotFoundError, 
  ConflictError, 
  InternalError,
  notFoundHandler,
  errorHandler 
} from '../src/middlewares/errorHandler.js';

// Mock del logger
vi.mock('../src/config/logger.js', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    http: vi.fn(),
  }
}));

describe('Clases de Error', () => {
  describe('ApiError', () => {
    it('debe crear un error con statusCode y mensaje', () => {
      const error = new ApiError(500, 'Error de prueba');
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Error de prueba');
      expect(error.isOperational).toBe(true);
      expect(error.status).toBe('error');
    });

    it('debe tener status "fail" para errores 4xx', () => {
      const error = new ApiError(400, 'Bad request');
      
      expect(error.status).toBe('fail');
    });

    it('debe tener status "error" para errores 5xx', () => {
      const error = new ApiError(500, 'Server error');
      
      expect(error.status).toBe('error');
    });
  });

  describe('BadRequestError', () => {
    it('debe crear error 400', () => {
      const error = new BadRequestError('Datos inválidos');
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Datos inválidos');
    });

    it('debe tener mensaje por defecto', () => {
      const error = new BadRequestError();
      
      expect(error.message).toBe('Solicitud incorrecta');
    });
  });

  describe('NotFoundError', () => {
    it('debe crear error 404', () => {
      const error = new NotFoundError('Recurso no existe');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Recurso no existe');
    });

    it('debe tener mensaje por defecto', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Recurso no encontrado');
    });
  });

  describe('ConflictError', () => {
    it('debe crear error 409', () => {
      const error = new ConflictError('Conflicto');
      
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Conflicto');
    });

    it('debe tener mensaje por defecto', () => {
      const error = new ConflictError();
      
      expect(error.message).toBe('El recurso ya existe');
    });
  });

  describe('InternalError', () => {
    it('debe crear error 500', () => {
      const error = new InternalError('Error interno');
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Error interno');
      expect(error.isOperational).toBe(false);
    });

    it('debe tener mensaje por defecto', () => {
      const error = new InternalError();
      
      expect(error.message).toBe('Error interno del servidor');
    });
  });
});

describe('Middlewares de Error', () => {
  describe('notFoundHandler', () => {
    it('debe llamar next con NotFoundError', () => {
      const req = { originalUrl: '/ruta-inexistente' };
      const res = {};
      const next = vi.fn();

      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toContain('/ruta-inexistente');
    });
  });

  describe('errorHandler', () => {
    let req, res, next;

    beforeEach(() => {
      req = { path: '/test', method: 'GET' };
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      next = vi.fn();
    });

    it('debe manejar ApiError correctamente', () => {
      const error = new BadRequestError('Error de prueba');
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        status: 'fail',
        message: 'Error de prueba',
      }));
    });

    it('debe convertir errores genéricos a ApiError', () => {
      const error = new Error('Error genérico');
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
      }));
    });

    it('debe incluir stack en desarrollo', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new BadRequestError('Error');
      
      errorHandler(error, req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('no debe incluir stack en producción', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new BadRequestError('Error');
      
      errorHandler(error, req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
