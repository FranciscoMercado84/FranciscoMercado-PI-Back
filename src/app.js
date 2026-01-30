import express from 'express';
import { initLoaders } from './loaders/index.js';

// Crear aplicación Express
const app = express();

// Inicializar todos los loaders
initLoaders(app);

export default app;
