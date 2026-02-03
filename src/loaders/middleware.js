import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from '../config/index.js';

/**
 * Middleware loader - Inicializa todos los middlewares de Express
 */
export const middlewareLoader = (app) => {
  // Security
  app.use(helmet());
  
  // CORS
  app.use(cors({
    origin: config.frontend.url,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // HTTP request logger
  const morganFormat = config.nodeEnv === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat));

  console.log('✅ Middlewares cargados');
};

