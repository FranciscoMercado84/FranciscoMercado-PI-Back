# Panadería - Backend (Node.js + Express + Sequelize)

Este README explica paso a paso cómo configurar el entorno local de desarrollo y cómo arrancar el backend llamado `panaderia-backend`.

## Resumen

Proyecto backend con: Node.js, Express, Sequelize y MySQL.

- Estructura mínima: carpeta `panaderia-backend` con un `package.json` y un fichero de entrada (por ejemplo `index.js` o `app.js`).
- ORM: Sequelize (con `mysql2`).

---

## 📐 Diseño y Modelado del Sistema

Este proyecto incluye diagramas de arquitectura y modelado que documentan la estructura del sistema:

### Diagramas disponibles

1. **[Diagrama de Vista Global](./docs/diagramas/DiagramaVistaGlobal.png)** - Vista general de la arquitectura del sistema, mostrando la interacción entre frontend, backend y base de datos.

2. **[Diagrama de Componentes](./docs/diagramas/DiagramaDeComponentes.png)** - Detalle de los componentes principales del backend (controladores, servicios, modelos, middlewares) y sus relaciones.

3. **[Diagrama Entidad-Interrelación (ER)](./docs/diagramas/DiagramaIE.png)** - Modelo de datos con entidades, atributos y relaciones de la base de datos MySQL.

**Ubicación**: Todos los diagramas se encuentran en `panaderia-backend/docs/diagramas/`

Para más detalles sobre la API REST, consulta:
- [Convenciones API](./docs/api/conventions.md)
- [Especificación OpenAPI](./docs/api/openapi.yaml)
- [Guía de errores](./docs/api/errors.md)

---

## Requisitos previos

- Node.js (versión 14+ recomendada) y npm instalados.
- MySQL (local o remoto) y credenciales para crear/usar una base de datos.
- Git (opcional para clonar el repo).

Comprueba que Node y npm están disponibles:

```powershell
node -v
npm -v
```

Si usas Windows PowerShell, los ejemplos de comandos están adaptados a PowerShell.

### Gestión de versiones de Node (entorno "virtual" para Node)

Aunque Node no usa un "entorno virtual" tipo Python, es buena práctica fijar la versión de Node para todo el equipo. Recomendaciones:

- Usa nvm (Node Version Manager) en macOS/Linux o nvm-windows en Windows para instalar y seleccionar versiones de Node.
- Crea un archivo `.nvmrc` en la raíz del proyecto con la versión recomendada (por ejemplo `18` o `18.20.0`) para que otros desarrolladores sepan qué versión usar.

Instalación rápida (Windows):

- Descarga e instala nvm-windows desde su repositorio de releases (buscar "nvm-windows" en GitHub). Después, en PowerShell:

```powershell
nvm install 18.20.0
nvm use 18.20.0
node -v
```

Instalación en macOS/Linux (ejemplo con nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
# Luego en la shell:
nvm install 18
nvm use 18
node -v
```

Nota: `nvm-windows` no lee `.nvmrc` automáticamente; en ese caso documenta la versión en `README.md` y usa `nvm use <version>`.

---

## Pasos para crear el proyecto (comandos originales)

Abre PowerShell y ejecuta los comandos siguientes (línea a línea):

```powershell
mkdir panaderia-backend
cd panaderia-backend
npm init -y
npm install express cors mysql2 sequelize dotenv
npm install --save-dev nodemon
```

Explicación rápida:
- `npm init -y` crea un `package.json` por defecto.
- `express`, `cors` y `sequelize` son las dependencias de runtime.
- `mysql2` es el driver que usa Sequelize para MySQL.
- `dotenv` para cargar variables de entorno.
- `nodemon` como dependencia de desarrollo para recarga automática.

### Instalación reproducible

Para instalaciones reproducibles en CI y entre desarrolladores:

- Comprueba que exista `package-lock.json` en el repositorio (se genera al hacer `npm install`).
- Para instalaciones locales rápidas y reproducibles usa:

```powershell
npm ci
```

`npm ci` instalará exactamente las versiones del `package-lock.json` y fallará si `package-lock.json` no concuerda con `package.json`.

### Scripts recomendados en `package.json`

Abre `package.json` y añade o actualiza la sección `scripts` así (ejemplo):

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

- `npm start` => arranque en modo producción (o estándar).
- `npm run dev` => arranque con `nodemon` para desarrollo.

Ejemplo completo de `package.json` (sección `scripts`):

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "lint": "eslint . || true"
}
```

---

## Variables de entorno (.env)

Se recomienda usar un archivo `.env` para las credenciales de la base de datos y la configuración. Crea un archivo `.env` en `panaderia-backend` con este contenido de ejemplo:

```env
# Servidor
PORT=3000
NODE_ENV=development

# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=panaderia_db

# Opcional: URL completa
# DATABASE_URL=mysql://root:tu_contraseña@127.0.0.1:3306/panaderia_db
```

Explicación:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` se usan para configurar Sequelize.

Recuerda: nunca comitees `.env` con credenciales reales. Añade `.env` a tu `.gitignore`.

Ejemplo de `.gitignore` mínimo para este proyecto:

```
node_modules/
.env
dist/
coverage/
```

---

## Ejemplo mínimo de `index.js` (arranque y conexión con Sequelize)

Este snippet es un punto de partida. Crea `index.js` en `panaderia-backend` con el siguiente contenido:

```javascript
require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Sequelize desde variables de entorno
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false,
});

// Prueba de conexión
async function testDb() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos MySQL: OK');
  } catch (err) {
    console.error('Error al conectar con la BD:', err.message);
    process.exit(1);
  }
}

testDb();

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.json({ message: 'API Panadería - backend funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
```

Notas:
- Sustituye este contenido por tu estructura (separar `models`, `routes`, etc.).
- Usa `sequelize.define` o `sequelize-cli` para gestionar modelos y migraciones según necesites.

Si planeas usar migraciones y seeders, considera instalar `sequelize-cli` y configurar un `config` para entornos:

```powershell
npm install --save-dev sequelize-cli
npx sequelize-cli init
```

Esto genera carpetas `models`, `migrations` y `seeders` para comenzar.

---

## Crear la base de datos en MySQL

Antes de arrancar, crea la base de datos (puedes usar MySQL Workbench, phpMyAdmin, o la consola):

```sql
CREATE DATABASE panaderia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

O, si usas la consola de Windows (con `mysql` en PATH):

```powershell
mysql -u root -p -e "CREATE DATABASE panaderia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
```

Si prefieres, puedes usar `DATABASE_URL` en `.env` y extraerla desde ahí.

---

## Arrancar la aplicación

- En modo desarrollo (recarga automática):

```powershell
npm run dev
```

- En modo normal / producción:

```powershell
npm start
```

Si todo está correcto, verás en consola mensajes como "Conexión a la base de datos MySQL: OK" y "Servidor escuchando en http://localhost:3000".

### Flujo típico de desarrollo (servidor local)

1. Asegúrate de usar la versión de Node indicada (`nvm use` o instalarla si hace falta).
2. Copia el `.env.example` a `.env` y rellena las credenciales.
3. Instala dependencias reproducibles:

```powershell
npm ci
```

4. Crea la base de datos si no existe (ver sección "Crear la base de datos").
5. Ejecuta en modo desarrollo con recarga automática:

```powershell
npm run dev
```

6. Probar el endpoint raíz desde PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/
```

Deberías recibir JSON con el mensaje de bienvenida.

Para detener el servidor en PowerShell si conoces el PID:

```powershell
Stop-Process -Id <PID>
```

O encuentra el proceso que escucha el puerto (ejemplo para 3000):

```powershell
$pid = (Get-NetTCPConnection -LocalPort 3000).OwningProcess; Stop-Process -Id $pid
```

---

## Problemas comunes y soluciones rápidas

- Error de conexión a la base de datos (ECONNREFUSED / access denied):
  - Revisa que MySQL esté corriendo.
  - Verifica `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_PORT` en `.env`.
  - Asegúrate de que la base de datos indicada en `DB_NAME` existe.

- `nodemon` no arranca o no recarga:
  - Asegúrate de tener `nodemon` como devDependency: `npm i -D nodemon`.
  - Revisa el script `dev` en `package.json`.

- Puerto en uso (EADDRINUSE):
  - Cambia `PORT` en `.env` o mata el proceso que ocupa el puerto.

- Variables de entorno no cargadas:
  - Comprueba que `require('dotenv').config()` esté antes del uso de `process.env`.

- Problemas de versiones de Node (paquetes nativos / dependencias fallan):
  - Asegúrate de usar la versión de Node indicada con `nvm use`.
  - Si hay errores nativos al instalar paquetes, revisa `node-gyp` y herramientas de compilación para Windows (Build Tools).

---

## Buenas prácticas y próximos pasos

- Separa la configuración de la aplicación (por ejemplo, mover configuración Sequelize a `config/database.js`).
- Organiza el proyecto en carpetas: `models/`, `routes/`, `controllers/`, `middlewares/`.
- Considera usar `sequelize-cli` para manejar migraciones y seeders.
- Añade pruebas unitarias y scripts de lint (ESLint).

Sugerencias adicionales:

- Mantén `package-lock.json` en el control de versiones para reproducibilidad.
- Usa ramas por feature y PRs para revisar cambios.
- Añade un `README.md` pequeño en `models/` si vas a crear varios modelos.

---

## Resumen rápido de comandos (PowerShell)

```powershell
mkdir panaderia-backend
cd panaderia-backend
npm init -y
npm install express cors mysql2 sequelize dotenv
npm install --save-dev nodemon
# Crear .env, index.js y luego:
npm run dev   # para desarrollo
npm start     # para arranque normal
```

### Checklist rápido (primer arranque)

1. Clona el repositorio y entra en `panaderia-backend`.
2. Asegúrate de tener la versión Node correcta (`nvm use` o instalarla).
3. Crea `.env` (usar `.env.example` si existe) y rellena credenciales.
4. Ejecuta `npm ci`.
5. Crea la base de datos MySQL (`CREATE DATABASE ...`).
6. Ejecuta `npm run dev` y prueba `Invoke-RestMethod http://localhost:3000/`.

---

