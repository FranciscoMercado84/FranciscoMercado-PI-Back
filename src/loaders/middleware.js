import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from '../config/logger.js';

/**
 * Middleware loader - Inicializa todos los middlewares de Express
 */
export const middlewareLoader = (app) => {
  // Security
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // HTTP request logger
  const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));

  logger.info('✅ Middlewares cargados');
};
