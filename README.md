# 🍞 Panadería Sabor Artesano - Backend

API RESTful para el sistema de gestión de la panadería, desarrollada con Node.js, Express y MongoDB.

## 📋 Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Diseño y Arquitectura](#-diseño-y-arquitectura)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Despliegue](#-despliegue)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Testing](#-testing)
- [Solución de Problemas](#-solución-de-problemas)

---

## 🛠️ Tecnologías

- **Runtime**: Node.js v18.20.0
- **Framework**: Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Documentación**: Swagger/OpenAPI 3.0.3
- **Testing**: Vitest
- **Logging**: Winston
- **Linting**: ESLint

---

## 📐 Diseño y Arquitectura

Este proyecto incluye diagramas de arquitectura y modelado que documentan la estructura del sistema:

### Diagramas Disponibles

1. **[Diagrama de Vista Global](docs/diagramas/DiagramaVistaGlobal.png)** - Vista general de la arquitectura del sistema
2. **[Diagrama de Componentes](docs/diagramas/DiagramaDeComponentes.png)** - Detalle de componentes del backend
3. **[Diagrama Entidad-Interrelación](docs/diagramas/DiagramaIE.png)** - Modelo de datos MongoDB

### Documentación API

- **[Convenciones API](docs/api/conventions.md)** - Estándares de desarrollo y naming
- **[Especificación OpenAPI](docs/api/openapi.yaml)** - Especificación completa de la API
- **[Especificación Swagger](docs/api/swagger.yaml)** - Documentación interactiva
- **[Guía de Errores](docs/api/errors.md)** - Códigos y manejo de errores

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js**: v18.20.0 (recomendado usar nvm)
- **MongoDB**: Local o MongoDB Atlas
- **Git**: Para clonar el repositorio
- **npm**: v9+ (viene con Node.js)

### 1. Gestión de Versiones de Node con nvm

**Windows (nvm-windows)**:
```powershell
# Descargar e instalar desde: https://github.com/coreybutler/nvm-windows/releases
nvm install 18.20.0
nvm use 18.20.0
node -v
```

**macOS/Linux (nvm)**:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
nvm install 18.20.0
nvm use 18.20.0
node -v
```

### 2. Clonar el Repositorio

```bash
git clone https://github.com/FranciscoMercado-PI-Back/panaderia-backend.git
cd panaderia-backend
```

### 3. Instalar Dependencias

**Instalación reproducible** (recomendado):
```bash
npm ci
```

**Instalación normal** (actualiza package-lock.json):
```bash
npm install
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/panaderia
MONGODB_URI_TEST=mongodb://localhost:27017/panaderia_test

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRATION=30d

# Frontend
FRONTEND_URL=http://localhost:5173

# Admin (credenciales iniciales - cambiar en producción)
ADMIN_EMAIL=admin@panaderia.com
ADMIN_PASSWORD=admin123
```

**Generar secreto JWT seguro**:
```bash
# Ejecuta esto para generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Iniciar MongoDB

**Opción A: Docker (recomendado)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Opción B: MongoDB Atlas** (gratis)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Obtén la cadena de conexión
4. Actualiza `MONGODB_URI` en `.env`

**Opción C: Instalación local**
- Windows: [Descargar MongoDB Community](https://www.mongodb.com/try/download/community)
- macOS: `brew install mongodb-community`
- Linux: Sigue la [guía oficial](https://docs.mongodb.com/manual/administration/install-on-linux/)

### 6. Iniciar el Servidor

**Modo desarrollo** (con hot-reload):
```bash
npm run dev
```

**Modo producción**:
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3001`

### 7. Verificar Instalación

**Health Check**:
```powershell
Invoke-RestMethod -Uri http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2026-01-30T10:30:00.000Z",
  "uptime": 5.123,
  "mongodb": "connected"
}
```

**Documentación Swagger**:

Abre en tu navegador: `http://localhost:3001/api-docs`

---

## 🌐 Despliegue en Producción

### Despliegue del Backend en Render

#### 1. Preparar el Proyecto

El proyecto ya está configurado con `render.yaml` para auto-despliegue.

#### 2. Configurar Variables de Entorno en Render

Una vez creado el servicio en [Render](https://render.com), configura las siguientes variables de entorno en el Dashboard:

```env
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/panaderia?retryWrites=true&w=majority
JWT_SECRET=tu_secreto_jwt_seguro_generado_con_crypto
JWT_EXPIRATION=30d
FRONTEND_URL=https://tu-frontend.vercel.app
ADMIN_EMAIL=admin@panaderia.com
ADMIN_PASSWORD=admin123_cambiar_en_produccion
```

#### 3. Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor (Render lo asigna automáticamente) | `3001` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `MONGODB_URI` | Cadena de conexión a MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Secreto para firmar tokens JWT (mínimo 32 caracteres) | Generar con crypto |
| `JWT_EXPIRATION` | Tiempo de expiración del token | `30d` |
| `FRONTEND_URL` | **URL del frontend desplegado en Vercel** | `https://tu-app.vercel.app` |
| `ADMIN_EMAIL` | Email del usuario administrador inicial | `admin@panaderia.com` |
| `ADMIN_PASSWORD` | Contraseña del administrador (cambiar después del primer login) | `Admin123!` |

#### 4. Generar JWT_SECRET Seguro

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado y úsalo como valor para `JWT_SECRET` en Render.

#### 5. Configurar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito (M0)
3. En **Network Access**, agrega `0.0.0.0/0` para permitir conexiones desde Render
4. En **Database Access**, crea un usuario con permisos de lectura/escritura
5. Obtén la cadena de conexión desde **Connect > Connect your application**
6. Reemplaza `<password>` con la contraseña del usuario
7. Usa esta cadena como `MONGODB_URI`

#### 6. Configuración CORS

El backend ya está configurado para aceptar peticiones del frontend:

**Archivo**: [src/loaders/middleware.js](src/loaders/middleware.js)
```javascript
app.use(cors({
  origin: config.frontend.url,  // Lee de FRONTEND_URL
  credentials: true,             // Permite envío de cookies
}));
```

**Archivo**: [src/config/index.js](src/config/index.js)
```javascript
frontend: {
  url: process.env.FRONTEND_URL || 'http://localhost:5173',
}
```

**⚠️ Importante**: 
- En **desarrollo**, `FRONTEND_URL=http://localhost:5173`
- En **producción** (Render), `FRONTEND_URL=https://tu-frontend.vercel.app`

#### 7. Poblar Base de Datos con Usuario Administrador

**⚠️ IMPORTANTE**: Después del primer despliegue, necesitas crear el usuario administrador en la base de datos.

**Opción A: Ejecutar seed localmente contra MongoDB Atlas**

1. Configura temporalmente tu `.env` local con las mismas variables de producción:
```env
MONGODB_URI=tu_mongodb_atlas_uri_de_produccion
ADMIN_EMAIL=admin@panaderia.com
ADMIN_PASSWORD=admin123
```

2. Ejecuta el seed localmente:
```bash
npm run seed
```

3. Restaura tu `.env` local a desarrollo.

**Opción B: Usar MongoDB Compass**

1. Conecta MongoDB Compass a tu cluster de Atlas
2. Ve a la base de datos `panaderia`
3. Crea la colección `usuarios` si no existe
4. Inserta un documento manualmente:
```json
{
  "nombre": "Administrador",
  "email": "admin@panaderia.com",
  "password": "$2b$10$[hash_bcrypt_de_admin123]",
  "rol": "admin",
  "telefono": "666111222",
  "activo": true,
  "createdAt": { "$date": "2026-02-05T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-02-05T00:00:00.000Z" }
}
```

**Opción C: Crear usuario mediante API**

Si implementas un endpoint temporal de registro de admin o usas Postman/Thunder Client:

```bash
curl -X POST https://tu-backend.onrender.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Administrador",
    "email": "admin@panaderia.com",
    "password": "admin123",
    "telefono": "666111222"
  }'
```

Luego actualiza manualmente el `rol` a `admin` en MongoDB Compass.

#### 8. URL del Backend en Render

Después del despliegue, tu backend estará disponible en:
```
https://tu-app.onrender.com
```

**Rutas principales**:
- Health check: `https://tu-app.onrender.com/health`
- Login: `https://tu-app.onrender.com/v1/auth/login`
- API base: `https://tu-app.onrender.com/v1/`

---

### Despliegue del Frontend en Vercel

#### Configurar Variables de Entorno en Vercel

En el dashboard de [Vercel](https://vercel.com), configura:

```env
VITE_API_BASE_URL=https://tu-backend.onrender.com/v1
```

**⚠️ Importante**: 
- Incluye `/v1` al final de la URL (no `/api`)
- Usa la URL exacta que te proporciona Render
- No incluyas una barra `/` al final después de `/v1`

---

### Verificar Integración Backend-Frontend

#### 1. Probar CORS

Desde la consola del navegador en tu frontend desplegado:

```javascript
fetch('https://tu-backend.onrender.com/health', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
```

Debes recibir:
```json
{
  "status": "OK",
  "timestamp": "...",
  "mongodb": "connected"
}
```

#### 2. Probar Endpoint de Login

```javascript
fetch('https://tu-backend.onrender.com/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@panaderia.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(console.log)
```

Respuesta esperada:
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@panaderia.com",
      "nombre": "Administrador",
      "role": "admin",
      "name": "Administrador"
    }
  }
}
```

---

### Resumen de URLs

| Entorno | Backend | Frontend | FRONTEND_URL en Backend | VITE_API_BASE_URL en Frontend |
|---------|---------|----------|-------------------------|-------------------------------|
| **Desarrollo** | `http://localhost:3001` | `http://localhost:5173` | `http://localhost:5173` | `http://localhost:3001/v1` |
| **Producción** | `https://tu-backend.onrender.com` | `https://tu-frontend.vercel.app` | `https://tu-frontend.vercel.app` | `https://tu-backend.onrender.com/v1` |

---

### Checklist de Despliegue

#### Backend (Render)
- [ ] Repositorio conectado a Render
- [ ] Variables de entorno configuradas
- [ ] MongoDB Atlas configurado y accesible
- [ ] `FRONTEND_URL` apunta a la URL de Vercel
- [ ] JWT_SECRET generado de forma segura
- [ ] Despliegue exitoso
- [ ] Health check responde correctamente

#### Frontend (Vercel)
- [ ] Repositorio conectado a Vercel
- [ ] `VITE_API_BASE_URL` configurada con URL de Render
- [ ] Build exitoso
- [ ] Puede conectar con el backend

#### Integración
- [ ] CORS configurado correctamente
- [ ] Login funciona desde el frontend desplegado
- [ ] Requests se envían con `credentials: 'include'`
- [ ] Tokens JWT se reciben correctamente

---


## 📜 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **Desarrollo** | `npm run dev` | Inicia el servidor con hot-reload (watch mode) |
| **Producción** | `npm start` | Inicia el servidor en modo producción |
| **Tests** | `npm test` | Ejecuta todos los tests con Vitest |
| **Coverage** | `npm run test:coverage` | Genera reporte de cobertura de tests |
| **Lint** | `npm run lint` | Ejecuta ESLint para verificar código |
| **Lint Fix** | `npm run lint:fix` | Corrige automáticamente problemas de ESLint |
| **Seed** | `npm run seed` | Pobla la base de datos con datos de prueba |

---

## 📁 Estructura del Proyecto

```
panaderia-backend/
├── src/
│   ├── config/          # Configuración (DB, Swagger, Cloudinary, etc.)
│   ├── controllers/     # Controladores (lógica de endpoints)
│   ├── loaders/         # Inicializadores (middleware, routes)
│   ├── middlewares/     # Middlewares personalizados
│   ├── models/          # Modelos Mongoose (Usuario, Producto, Carrito, Pedido)
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades y helpers
│   └── server.js        # Punto de entrada de la aplicación
├── tests/               # Tests unitarios y de integración
├── docs/
│   ├── api/             # Documentación API (OpenAPI, Swagger)
│   ├── diagramas/       # Diagramas de arquitectura
│   └── CLOUDINARY_SETUP.md  # Guía de configuración de Cloudinary
├── scripts/             # Scripts de utilidad (seed, migrate, etc.)
├── uploads/temp/        # Archivos temporales (imágenes antes de subir a Cloudinary)
├── logs/                # Logs de Winston (no versionados)
├── postman/             # Colecciones Postman para testing
├── .env                 # Variables de entorno (NO versionar)
├── .gitignore           # Archivos ignorados por Git
├── package.json         # Dependencias y scripts
├── render.yaml          # Configuración de Render
└── README.md            # Este archivo
```

---

## 📸 Gestión de Imágenes y Stock

### Cloudinary para Imágenes

Este proyecto usa **Cloudinary** para gestionar las imágenes de productos de forma eficiente.

**Características:**
- ✅ Almacenamiento en la nube
- ✅ Optimización automática de imágenes
- ✅ Conversión a WebP automática
- ✅ Redimensionamiento y transformaciones
- ✅ 25GB gratis en el plan free

**Configuración rápida:**
1. Crea cuenta en [Cloudinary](https://cloudinary.com)
2. Obtén tus credenciales del Dashboard
3. Agrégalas al `.env`:
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**Guía completa:** Ver [docs/CLOUDINARY_SETUP.md](docs/CLOUDINARY_SETUP.md)

### Gestión de Inventario

El sistema incluye gestión automática de stock:

**Campos nuevos en Producto:**
- `stock`: Cantidad disponible
- `stock_minimo`: Nivel mínimo de reorden
- `stock_bajo`: Virtual (true si stock <= stock_minimo)
- `estado_inventario`: Virtual ('agotado', 'bajo', 'disponible')

**Endpoints de inventario (admin):**
- `PUT /v1/productos/:id/stock` - Actualizar stock
- `GET /v1/productos/inventario/bajo-stock` - Productos con stock bajo
- `GET /v1/productos/inventario/agotados` - Productos agotados

**Comportamiento automático:**
- Si `stock === 0`, `disponible` se marca como `false`
- Si vuelve a haber stock, `disponible` se marca como `true`

---

## 📊 Modelo de Datos

### Categorías de Productos

Las categorías se implementan como **enum de strings** para mayor simplicidad y rendimiento:

```javascript
enum CategoriaProducto {
  'Despensa y básicos',
  'Conservas y Enlatados',
  'Aceites, Vinagres y Salsas',
  'Bebidas y Bodega',
  'Charcutería',
  'Dulces',
  'Panadería'
}
```

### Modelos Principales

#### Usuario
- Campos: nombre, email, password (hash), rol (cliente/admin), teléfono, dirección
- Autenticación con JWT
- Roles: `cliente` y `admin`

#### Producto
- **Categoría como String enum** (no referencia a colección)
- Campos: nombre, descripción, precio, imagen_url, categoría, disponible, peso, ingredientes, alérgenos, destacado
- Validación automática de categoría por Mongoose

#### Carrito
- Vinculado a usuario autenticado
- Items con populate automático de productos
- Cálculo automático de subtotales y total

#### Pedido
- Número de pedido único auto-generado
- Estados: pendiente, en_preparacion, listo, enviado, entregado, cancelado
- Snapshot de productos al momento del pedido

### Ventajas de Categorías como Enum

✅ **Rendimiento**: 1 query en lugar de 2 (sin populate)  
✅ **Simplicidad**: Sin joins ni referencias  
✅ **Validación**: Mongoose valida automáticamente valores permitidos  
✅ **Menor espacio**: Strings vs ObjectIds  

---

## 🔗 API Reference

### Base URL
- **Desarrollo**: `http://localhost:3001/v1`
- **Producción**: `https://tu-backend.onrender.com/v1`

### Autenticación
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/auth/login` | Iniciar sesión | ❌ |
| GET | `/auth/profile` | Obtener perfil del usuario | ✅ |

### Productos
| Método | Endpoint | Descripción | Auth | Admin |
|--------|----------|-------------|------|-------|
| GET | `/productos` | Listar productos (con filtros) | ❌ | ❌ |
| GET | `/productos/:id` | Obtener producto por ID | ❌ | ❌ |
| POST | `/productos` | Crear producto | ✅ | ✅ |
| PUT | `/productos/:id` | Actualizar producto | ✅ | ✅ |
| DELETE | `/productos/:id` | Eliminar producto | ✅ | ✅ |
| POST | `/productos/:id/imagen` | Subir imagen (multipart) | ✅ | ✅ |
| PUT | `/productos/:id/stock` | Actualizar stock | ✅ | ✅ |

### Inventario (Admin)
| Método | Endpoint | Descripción | Auth | Admin |
|--------|----------|-------------|------|-------|
| GET | `/productos/inventario/bajo-stock` | Productos con stock bajo | ✅ | ✅ |
| GET | `/productos/inventario/agotados` | Productos sin stock | ✅ | ✅ |

### Carrito
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/carrito` | Obtener carrito del usuario | ✅ |
| POST | `/carrito/items` | Añadir producto al carrito | ✅ |
| PUT | `/carrito/items/:productoId` | Actualizar cantidad | ✅ |
| DELETE | `/carrito/items/:productoId` | Eliminar producto del carrito | ✅ |
| DELETE | `/carrito` | Vaciar carrito completo | ✅ |

### Pedidos
| Método | Endpoint | Descripción | Auth | Admin |
|--------|----------|-------------|------|-------|
| POST | `/pedidos` | Crear pedido (desde carrito) | ✅ | ❌ |
| GET | `/pedidos` | Listar mis pedidos | ✅ | ❌ |
| GET | `/pedidos/:id` | Obtener detalle de pedido | ✅ | ❌ |
| PUT | `/pedidos/:id/estado` | Actualizar estado del pedido | ✅ | ✅ |
| GET | `/pedidos/admin/todos` | Listar todos los pedidos | ✅ | ✅ |

### Filtros de Productos

```
GET /v1/productos?categoria=Panadería&disponible=true&destacado=true&min_precio=1&max_precio=10&sort=precio&order=asc&page=1&limit=10
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `categoria` | string | Filtrar por categoría |
| `disponible` | boolean | Solo productos disponibles |
| `destacado` | boolean | Solo productos destacados |
| `min_precio` | number | Precio mínimo |
| `max_precio` | number | Precio máximo |
| `search` | string | Buscar por nombre/descripción |
| `sort` | string | Campo para ordenar (nombre, precio, createdAt) |
| `order` | string | Dirección (asc, desc) |
| `page` | number | Número de página |
| `limit` | number | Resultados por página |

### Estados de Pedido

```
pendiente → en_preparacion → listo → enviado → entregado
                ↓                       ↓
             cancelado              cancelado
```

### Códigos de Respuesta

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Error de validación |
| 401 | No autenticado |
| 403 | Sin permisos (no admin) |
| 404 | Recurso no encontrado |
| 500 | Error del servidor |

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Estructura de Tests

```
tests/
├── setup.js          # Helpers, constantes y utilidades compartidas
├── auth.test.js      # Tests de autenticación (registro, login, perfil)
├── productos.test.js # Tests CRUD de productos e inventario
├── carrito.test.js   # Tests del carrito de compras
├── pedidos.test.js   # Tests de gestión de pedidos
└── health.test.js    # Tests de health check, CORS y 404
```

### Helpers de Tests

En `tests/setup.js` se exportan utilidades para todos los tests:

```javascript
// Credenciales de prueba
const TEST_USERS = {
  admin: { email: 'admin@panaderia.com', password: 'admin123' },
  cliente: { email: 'cliente@test.com', password: 'test123' }
};

// Obtener token de autenticación
const token = await getAuthToken(app, 'admin');

// Crear producto de prueba
const producto = await createTestProduct(app, adminToken);

// Generar email único
const email = generateUniqueEmail();
```

### Cobertura de Tests

Los reportes de cobertura se generan en `coverage/`:
- `coverage/index.html` - Reporte visual en HTML
- `coverage/lcov.info` - Formato LCOV para SonarQube

### Usuarios de Prueba

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Admin | admin@panaderia.com | admin123 | admin |
| Cliente | cliente@test.com | test123 | cliente |

⚠️ **Nota**: Ejecuta `npm run seed` antes de los tests para crear los usuarios de prueba.

---

## 📊 SonarQube - Análisis de Calidad

### Ejecutar SonarQube con Docker

```bash
# Iniciar SonarQube
docker-compose up -d sonarqube

# Esperar a que inicie (puede tardar 1-2 minutos)
# Acceder a: http://localhost:9000
# Usuario: admin / Password: admin (cambiar en primer login)
```

### Ejecutar Análisis

```bash
# Primero, generar el reporte de cobertura
npm run test:coverage

# Luego, ejecutar el scanner (requiere sonar-scanner instalado)
# Opción 1: Docker
docker run --rm \
  -v "$(pwd):/usr/src" \
  -e SONAR_HOST_URL="http://host.docker.internal:9000" \
  -e SONAR_LOGIN="tu_token_de_sonarqube" \
  sonarsource/sonar-scanner-cli

# Opción 2: npx
npx sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=tu_token_de_sonarqube
```

### Configuración de SonarQube

El archivo `sonar-project.properties` ya está configurado:

```properties
sonar.projectKey=panaderia-backend
sonar.projectName=Panadería Backend
sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/tests/**,**/config/**
```

### Métricas Analizadas

- **Bugs**: Errores potenciales en el código
- **Vulnerabilities**: Problemas de seguridad
- **Code Smells**: Código que dificulta mantenimiento
- **Coverage**: Porcentaje de código cubierto por tests
- **Duplications**: Código duplicado

---

## 🐛 Solución de Problemas

### Error: "Credenciales incorrectas" en producción (Render/Vercel)

**Causa**: La base de datos en MongoDB Atlas está vacía, no hay usuarios creados.

**Solución**:
1. Verifica que el backend esté funcionando: `https://tu-backend.onrender.com/health`
2. Crea el usuario administrador siguiendo las instrucciones en [Poblar Base de Datos](#7-poblar-base-de-datos-con-usuario-administrador)
3. Verifica que la URL en el frontend sea: `https://tu-backend.onrender.com/v1` (con `/v1`, no `/api`)
4. Verifica que `FRONTEND_URL` en Render esté configurada con la URL de Vercel

**Verificar credenciales desde la consola del navegador**:
```javascript
fetch('https://tu-backend.onrender.com/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@panaderia.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(console.log)
```

### Error: "Cannot connect to MongoDB"

**Causa**: MongoDB no está ejecutándose

**Soluciones**:
```powershell
# Verificar si MongoDB está corriendo (Docker)
docker ps | Select-String mongodb

# Iniciar MongoDB (Docker)
docker start mongodb

# O crear nuevo contenedor
docker run -d -p 27017:27017 --name mongodb mongo
```

### Error: "Port 3000 already in use"

**Causa**: Otro proceso usa el puerto 3000

**Soluciones**:
```powershell
# Cambiar puerto en .env
PORT=3001

# O matar el proceso que usa el puerto
$pid = (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id $pid -Force
```

### Error: "JWT secret not defined"

**Causa**: Variables de entorno no cargadas

**Soluciones**:
1. Verifica que `.env` existe en la raíz
2. Verifica que `JWT_SECRET` está definido en `.env`
3. Reinicia el servidor

### Tests fallan con "MongooseServerSelectionError"

**Causa**: MongoDB no está disponible para tests

**Soluciones**:
1. Verifica que `MONGODB_URI_TEST` está en `.env`
2. Asegúrate de que MongoDB está corriendo
3. Los tests limpian la base de datos, usa una DB diferente para tests

### Problemas con versiones de Node

**Causa**: Versión incorrecta de Node.js

**Solución**:
```bash
# Verificar versión actual
node -v

# Cambiar a la versión correcta
nvm use 18.20.0

# Si no está instalada
nvm install 18.20.0
nvm use 18.20.0
```

---

## 📚 Recursos Adicionales

### Documentación Técnica
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Guías de Desarrollo
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Guidelines](https://restfulapi.net/)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)

### Herramientas Recomendadas
- **API Testing**: [Postman](https://www.postman.com/) (colección incluida en `/postman`)
- **DB Management**: [MongoDB Compass](https://www.mongodb.com/products/compass)
- **Code Editor**: [VS Code](https://code.visualstudio.com/) con extensiones ESLint y MongoDB

---

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y pertenece a Panadería Sabor Artesano.

---

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:
1. Revisa la [sección de troubleshooting](#-solución-de-problemas)
2. Consulta la documentación en `/docs`
3. Abre un issue en el repositorio

---

**Desarrollado con ❤️ para Panadería Sabor Artesano**

