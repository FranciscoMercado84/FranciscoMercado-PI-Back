import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/panaderia_db',
    uriTest: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/panaderia_test',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@panaderia.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'Administrador',
  },
};

export default config;
