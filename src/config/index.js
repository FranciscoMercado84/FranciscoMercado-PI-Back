import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/panaderia',
    uriTest: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/panaderia_test',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    expiration: process.env.JWT_EXPIRATION || '30d',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@panaderia.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
};

export default config;

