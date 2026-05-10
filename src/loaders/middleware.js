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
  let corsOrigin = config.frontend.url || '';
  // Normalize: remove trailing slash if present to match browser `Origin`
  if (corsOrigin.endsWith('/')) corsOrigin = corsOrigin.slice(0, -1);
  console.log('🌐 CORS configured for origin:', corsOrigin);

  app.use(cors({
    origin: corsOrigin,
    credentials: true,
  }));

  // Log all requests
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
    next();
  });

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // HTTP request logger
  const morganFormat = config.nodeEnv === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat));

  console.log('✅ Middlewares cargados');
};

