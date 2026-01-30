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
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/panaderia
MONGODB_URI_TEST=mongodb://localhost:27017/panaderia_test

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=otro_secreto_diferente_aqui
JWT_REFRESH_EXPIRATION=30d

# Admin (credenciales iniciales)
ADMIN_EMAIL=admin@panaderia.com
ADMIN_PASSWORD=Admin123!
```

**Generar secretos seguros**:
```bash
# Ejecuta esto DOS veces para generar JWT_SECRET y JWT_REFRESH_SECRET
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

El servidor estará disponible en: `http://localhost:3000`

### 7. Verificar Instalación

**Health Check**:
```powershell
Invoke-RestMethod -Uri http://localhost:3000/health
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

Abre en tu navegador: `http://localhost:3000/api-docs`

---

## 🚀 Despliegue

### Despliegue Recomendado: Render

Para desplegar en **Render** (gratis con MongoDB Atlas), sigue el **[Tutorial Completo de Render](docs/TUTORIAL_RENDER.md)**.

El tutorial incluye:
- ✅ Configuración de MongoDB Atlas (gratis)
- ✅ Despliegue paso a paso en Render
- ✅ Configuración de variables de entorno
- ✅ Verificación y troubleshooting
- ✅ Gestión post-despliegue

### Otras Opciones

Para Railway, Vercel u otras plataformas, consulta la [Guía de Despliegue](docs/DEPLOYMENT.md).

---

## 📜 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **Desarrollo** | `npm run dev` | Inicia el servidor con hot-reload (watch mode) |
| **Producción** | `npm start` | Inicia el servidor en modo producción |
| **Tests** | `npm test` | Ejecuta todos los tests con Vitest |
| **Coverage** | `npm run coverage` | Genera reporte de cobertura de tests |
| **Lint** | `npm run lint` | Ejecuta ESLint para verificar código |
| **Seed** | `npm run seed` | Pobla la base de datos con datos de prueba |

---

## 📁 Estructura del Proyecto

```
panaderia-backend/
├── src/
│   ├── config/          # Configuración (DB, Swagger, etc.)
│   ├── controllers/     # Controladores (lógica de endpoints)
│   ├── loaders/         # Inicializadores (middleware, routes)
│   ├── middlewares/     # Middlewares personalizados
│   ├── models/          # Modelos Mongoose (User, Product, etc.)
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades y helpers
│   └── server.js        # Punto de entrada de la aplicación
├── tests/               # Tests unitarios y de integración
├── docs/
│   ├── api/             # Documentación API (OpenAPI, Swagger)
│   ├── diagramas/       # Diagramas de arquitectura
│   ├── DEPLOYMENT.md    # Guía de despliegue multi-plataforma
│   └── TUTORIAL_RENDER.md  # Tutorial específico de Render
├── scripts/             # Scripts de utilidad (seed, etc.)
├── logs/                # Logs de Winston (no versionados)
├── postman/             # Colecciones Postman para testing
├── .env                 # Variables de entorno (NO versionar)
├── .gitignore           # Archivos ignorados por Git
├── package.json         # Dependencias y scripts
├── render.yaml          # Configuración de Render
└── README.md            # Este archivo
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests con coverage
npm run coverage

# Tests en modo watch
npm run test:watch
```

### Cobertura de Tests

Los reportes de cobertura se generan en `coverage/`:
- `coverage/index.html` - Reporte visual en HTML
- `coverage/lcov.info` - Formato LCOV para integraciones

---

## 🐛 Solución de Problemas

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

