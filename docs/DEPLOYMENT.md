# Despliegue en Vercel

## 📋 Requisitos previos

1. **Cuenta en Vercel**: [https://vercel.com](https://vercel.com)
2. **MongoDB Atlas** (recomendado para producción): [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Vercel CLI** (opcional): `npm install -g vercel`

---

## ⚠️ Consideraciones importantes

### Limitaciones de Vercel para este proyecto

Vercel está optimizado para **funciones serverless** y aplicaciones **frontend**, no para servidores backend tradicionales con Express. Esto presenta algunos desafíos:

1. **Sin estado persistente**: Cada request se ejecuta en una función serverless aislada
2. **Timeouts**: Límite de 10 segundos (plan gratuito) o 60 segundos (plan pro) por request
3. **Conexiones MongoDB**: Se abren/cierran en cada request (puede ser lento)
4. **WebSockets**: No soportados directamente
5. **Logs limitados**: Logging más limitado que un servidor tradicional

### ✅ Alternativas recomendadas para backend Node.js + MongoDB

Para un backend Express + MongoDB completo, considera estas alternativas:

| Plataforma | Ventajas | Desventajas | Precio |
|-----------|----------|-------------|---------|
| **Railway** | ✅ Fácil deploy<br>✅ Soporta MongoDB<br>✅ Logs completos | ⚠️ Límite de horas gratis | $5/mes aprox |
| **Render** | ✅ Plan gratuito generoso<br>✅ Auto-deploy desde GitHub | ⚠️ Servidor duerme tras inactividad | Gratis (con limitaciones) |
| **Fly.io** | ✅ Muy flexible<br>✅ Buena red global | ⚠️ Configuración más compleja | Gratis (con límites) |
| **Heroku** | ✅ Muy popular<br>✅ Muchos addons | ⚠️ Ya no tiene plan gratuito | $7/mes mínimo |
| **DigitalOcean App Platform** | ✅ Muy estable<br>✅ Control completo | ⚠️ Precio más alto | $12/mes aprox |

---

## 🚀 Opción 1: Despliegue en Vercel (adaptado)

### Paso 1: Configurar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito (M0)
3. Configura acceso de red:
   - IP Whitelist: `0.0.0.0/0` (permitir desde cualquier lugar)
4. Crea un usuario de base de datos
5. Obtén tu connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/panaderia_db
   ```

### Paso 2: Preparar el proyecto

```bash
# Instalar Vercel CLI (opcional)
npm install -g vercel

# Verificar que el archivo vercel.json existe
ls vercel.json
```

### Paso 3: Configurar variables de entorno en Vercel

Vía **dashboard de Vercel**:
1. Ve a tu proyecto → Settings → Environment Variables
2. Agrega estas variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/panaderia_db
JWT_SECRET=tu-clave-super-secreta-de-produccion
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@panaderia.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
```

### Paso 4: Desplegar

#### Opción A: Desde la terminal

```bash
# Login en Vercel
vercel login

# Deploy (primera vez)
vercel

# Deploy a producción
vercel --prod
```

#### Opción B: Desde GitHub (recomendado)

1. Sube tu código a GitHub
2. Ve a [vercel.com/new](https://vercel.com/new)
3. Importa tu repositorio
4. Vercel detectará automáticamente el `vercel.json`
5. Configura las variables de entorno
6. Haz clic en "Deploy"

### Paso 5: Verificar despliegue

```bash
# Visitar tu API
https://tu-proyecto.vercel.app/health
https://tu-proyecto.vercel.app/api
https://tu-proyecto.vercel.app/api-docs
```

---

## 🚀 Opción 2: Despliegue en Railway (RECOMENDADO)

Railway es más adecuado para este tipo de aplicación.

### Paso 1: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Regístrate con GitHub

### Paso 2: Crear nuevo proyecto

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Agregar MongoDB
railway add
# Selecciona: MongoDB

# Configurar variables de entorno
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=tu-clave-secreta
railway variables set ADMIN_EMAIL=admin@panaderia.com
railway variables set ADMIN_PASSWORD=admin123
railway variables set ADMIN_NAME=Administrador

# Deploy
railway up
```

### Paso 3: Configurar desde Dashboard

1. Ve a tu proyecto en Railway
2. Settings → Generate Domain (para obtener una URL pública)
3. Variables → Agrega las variables de entorno
4. Deploy → Conecta tu repositorio de GitHub para auto-deploy

---

## 🚀 Opción 3: Despliegue en Render

### Paso 1: Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub

### Paso 2: Crear Web Service

1. Dashboard → New → Web Service
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: panaderia-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Paso 3: Configurar variables de entorno

En la sección "Environment Variables":

```env
NODE_ENV=production
MONGODB_URI=tu-connection-string
JWT_SECRET=tu-clave-secreta
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@panaderia.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador
```

### Paso 4: Deploy

Render automáticamente desplegará tu aplicación y te dará una URL como:
```
https://panaderia-backend.onrender.com
```

---

## 📝 Modificaciones necesarias para Vercel

Si decides usar Vercel, necesitas hacer estos cambios:

### 1. Crear archivo `api/index.js` (serverless entry point)

```javascript
import app from '../src/app.js';

export default async function handler(req, res) {
  return app(req, res);
}
```

### 2. Optimizar conexión MongoDB

En `src/config/database.js`, usar conexión en caché:

```javascript
let cachedDb = null;

export const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }
  
  const client = await mongoose.connect(mongoURI);
  cachedDb = client;
  return cachedDb;
};
```

---

## ✅ Recomendación final

Para este proyecto (Express + MongoDB + API REST completa):

1. **Producción seria**: Railway o DigitalOcean App Platform
2. **Desarrollo/testing**: Render (plan gratuito)
3. **Solo si es necesario Vercel**: Requiere adaptaciones significativas

Para el **frontend** de la panadería, Vercel es perfecto. Despliega:
- Backend → Railway/Render
- Frontend → Vercel

---

## 🔗 URLs útiles

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
