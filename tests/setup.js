/**
 * Test Setup - Configuración global para tests
 */
import { connectDB, disconnectDB } from '../src/config/database.js';

// Exportar funciones de conexión para tests
export { connectDB, disconnectDB };

// Variables globales para tests
export const TEST_USERS = {
  admin: {
    email: 'admin@panaderia.com',
    password: 'admin123',
    nombre: 'Administrador',
    rol: 'admin'
  },
  cliente: {
    email: 'cliente@test.com',
    password: 'test123',
    nombre: 'Cliente Test',
    rol: 'customer'
  }
};

// Puerto de test
export const TEST_PORT = 3002;

// Helpers para tests
export const getAuthToken = async (request, app, user = TEST_USERS.admin) => {
  try {
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        email: user.email,
        password: user.password
      });
    
    return response.body?.data?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error.message);
    return null;
  }
};

export const getAdminToken = async (request, app) => {
  return getAuthToken(request, app, TEST_USERS.admin);
};

export const getClienteToken = async (request, app) => {
  return getAuthToken(request, app, TEST_USERS.cliente);
};

// ObjectId válido para tests
export const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';
export const INVALID_OBJECT_ID = 'invalid-id';

// Helper para crear producto de prueba
export const createTestProduct = async (request, app, token) => {
  const productData = {
    nombre: `Test Product ${Date.now()}`,
    descripcion: 'Producto de prueba',
    precio: 9.99,
    categoria: 'Panadería',
    stock: 100,
    stock_minimo: 10
  };

  const response = await request(app)
    .post('/v1/productos')
    .set('Authorization', `Bearer ${token}`)
    .send(productData);

  return response.body?.data;
};

// Genera email único para registro
export const generateUniqueEmail = () => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
};
