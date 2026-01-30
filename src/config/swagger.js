import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar especificación Swagger desde archivo YAML
const swaggerPath = path.join(__dirname, '../../docs/api/swagger.yaml');
const swaggerSpec = YAML.load(swaggerPath);

export default swaggerSpec;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST de Notas',
      version: '1.0.0',
      description: `API REST para gestión de notas con autenticación JWT.

## Autenticación

Esta API usa **JWT Bearer Token** para proteger los endpoints.

### Pasos para autenticarse:
1. Usa el endpoint \`POST /api/auth/login\` con las credenciales (admin/admin123)
2. Copia el **token** de la respuesta
3. Haz clic en el botón **"Authorize"** 🔓 arriba
4. Pega el token (sin "Bearer ", solo el token)
5. Haz clic en **"Authorize"** y luego **"Close"**

Ahora todas las peticiones incluirán el token automáticamente.`,
      contact: {
        name: 'Paco',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint POST /api/auth/login. Ingresa solo el token (sin el prefijo "Bearer ").',
        },
      },
      schemas: {
        Note: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la nota',
              example: 1,
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la nota (sin extensión)',
              example: 'mi-nota',
            },
            contenido: {
              type: 'string',
              description: 'Contenido de la nota',
              example: 'Este es el contenido de mi nota',
            },
          },
        },
        NoteWithMetadata: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la nota',
              example: 1,
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la nota (sin extensión)',
              example: 'mi-nota',
            },
            archivo: {
              type: 'string',
              description: 'Nombre del archivo',
              example: 'mi-nota.note',
            },
            tamaño: {
              type: 'integer',
              description: 'Tamaño del archivo en bytes',
              example: 256,
            },
            fechaCreacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
              example: '2025-12-09T10:30:00.000Z',
            },
            fechaModificacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última modificación',
              example: '2025-12-09T15:45:00.000Z',
            },
            categoria: {
              type: 'string',
              nullable: true,
              description: 'Categoría de la nota (extraída del contenido)',
              example: 'trabajo',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Página actual',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Elementos por página',
              example: 10,
            },
            totalItems: {
              type: 'integer',
              description: 'Total de elementos',
              example: 25,
            },
            totalPages: {
              type: 'integer',
              description: 'Total de páginas',
              example: 3,
            },
            hasNext: {
              type: 'boolean',
              description: 'Indica si hay página siguiente',
              example: true,
            },
            hasPrev: {
              type: 'boolean',
              description: 'Indica si hay página anterior',
              example: false,
            },
          },
        },
        NoteInput: {
          type: 'object',
          required: ['nombre', 'contenido'],
          properties: {
            nombre: {
              type: 'string',
              description: 'Nombre de la nota (máx 100 caracteres, sin caracteres especiales)',
              example: 'mi-nota',
            },
            contenido: {
              type: 'string',
              description: 'Contenido de la nota',
              example: 'Este es el contenido de mi nota',
            },
          },
        },
        NoteUpdate: {
          type: 'object',
          required: ['contenido'],
          properties: {
            contenido: {
              type: 'string',
              description: 'Nuevo contenido de la nota',
              example: 'Contenido actualizado',
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Nombre de usuario',
              example: 'admin',
            },
            password: {
              type: 'string',
              description: 'Contraseña',
              example: 'admin123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    username: {
                      type: 'string',
                      example: 'admin',
                    },
                    role: {
                      type: 'string',
                      example: 'admin',
                    },
                  },
                },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                expiresIn: {
                  type: 'string',
                  example: '24h',
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            status: {
              type: 'string',
              example: 'fail',
            },
            message: {
              type: 'string',
              example: 'Error description',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Endpoints de estado del servidor (no requieren autenticación)',
      },
      {
        name: 'Auth',
        description: 'Endpoints de autenticación - Usa /login para obtener el token JWT',
      },
      {
        name: 'Notes',
        description: 'Endpoints de gestión de notas - Requieren autenticación (usa el botón Authorize 🔓)',
      },
    ],
  },
  apis: ['./src/config/swagger/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
