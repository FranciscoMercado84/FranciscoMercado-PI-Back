# 🚀 Tutorial: Despliegue en Render

Este tutorial te guiará paso a paso para desplegar tu backend de Panadería Sabor Artesano en Render.

## 📋 Requisitos Previos

- ✅ Cuenta en [Render](https://render.com) (gratis)
- ✅ Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)
- ✅ Código subido a un repositorio Git (GitHub, GitLab o Bitbucket)
- ✅ Tener configurado tu proyecto localmente

---

## 🗄️ Paso 1: Configurar MongoDB Atlas

### 1.1. Crear cuenta y cluster

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto: "Panaderia"
4. Crea un cluster **M0 (Free)**:
   - **Cloud Provider**: AWS
   - **Region**: Elige la más cercana (ej: `us-east-1` o `eu-west-1`)
   - **Cluster Name**: `panaderia-cluster`

### 1.2. Configurar acceso a la base de datos

1. **Database Access** (usuario de base de datos):
   - Click en "Database Access" en el menú izquierdo
   - Click "Add New Database User"
   - **Authentication Method**: Password
   - **Username**: `panaderia_user`
   - **Password**: Genera una contraseña segura (guárdala)
   - **Database User Privileges**: `Read and write to any database`
   - Click "Add User"

2. **Network Access** (permitir conexiones):
   - Click en "Network Access" en el menú izquierdo
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   - ⚠️ **Nota**: En producción real, limita a IPs específicas

### 1.3. Obtener la cadena de conexión

1. Vuelve a "Database" en el menú
2. Click en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. **Driver**: Node.js, **Version**: 5.5 or later
5. Copia la cadena de conexión, se verá así:
   ```
   mongodb+srv://panaderia_user:<password>@panaderia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Reemplaza `<password>`** con la contraseña que creaste
7. **Añade el nombre de la base de datos** después de `.net/`:
   ```
   mongodb+srv://panaderia_user:TU_PASSWORD@panaderia-cluster.xxxxx.mongodb.net/panaderia?retryWrites=true&w=majority
   ```
8. **Guarda esta URL** - la necesitarás para Render

---

## 🌐 Paso 2: Preparar tu Repositorio

### 2.1. Asegurar que tu código esté actualizado

```bash
# En la raíz del proyecto
git status
git add .
git commit -m "Preparar para despliegue en Render"
git push origin main
```

### 2.2. Verificar archivos necesarios

Asegúrate de que existen estos archivos (ya los tienes):

- ✅ `render.yaml` - Configuración de Render
- ✅ `package.json` - Dependencias y scripts
- ✅ `.gitignore` - Excluye node_modules, .env, logs
- ✅ `src/server.js` - Punto de entrada

### 2.3. Verificar scripts en package.json

Tu `package.json` debe tener:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  }
}
```

---

## 🚢 Paso 3: Desplegar en Render

### 3.1. Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Click "Get Started for Free"
3. Registra con GitHub/GitLab/Bitbucket (recomendado) o email

### 3.2. Crear un nuevo Web Service

1. En el Dashboard, click **"New +"** → **"Web Service"**
2. Conecta tu repositorio:
   - Si usas GitHub: autoriza Render y selecciona tu repo
   - Repositorio: `FranciscoMercado-PI-Back/panaderia-backend`

### 3.3. Configurar el servicio

Render detectará automáticamente el archivo `render.yaml`, pero verifica:

- **Name**: `panaderia-backend`
- **Region**: Elige la más cercana a tus usuarios
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm ci`
- **Start Command**: `npm start`
- **Plan**: `Free`

### 3.4. Configurar Variables de Entorno

Click en "Advanced" o espera a que se cree el servicio y ve a "Environment":

**Variables obligatorias**:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Entorno de ejecución |
| `PORT` | `10000` | Puerto (Render lo asigna automáticamente) |
| `MONGODB_URI` | `mongodb+srv://...` | **Pega tu URL de MongoDB Atlas** |
| `JWT_SECRET` | 6dac3d1e9b270bb2b074fe31868dc40a459e59227cf83617754985e0ad8d6b0a98ece7e7c7209760e74b58fdcc00a88c0edb4b7c5ea7ccdda95ce0cc9c031f53 | Secreto para tokens |
| `JWT_EXPIRATION` | `7d` | Duración del token principal |
| `JWT_REFRESH_SECRET` | e7280aa67ae2ab425b149ead63ab29b99807936898037b16d64e8cfaae9ea898be91270a5a3de2c12069ed465433483be224db2b700d411a7f38534a8e8320ad | Secreto para refresh tokens |
| `JWT_REFRESH_EXPIRATION` | `30d` | Duración del refresh token |
| `ADMIN_EMAIL` | `admin@panaderia.com` | Email del administrador |
| `ADMIN_PASSWORD` | i0GzLZCeNiQVbOucaqWSCeE+pio= | Contraseña del admin |

**Generar secretos seguros**:

```bash
# En tu terminal local, ejecuta:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ejecuta este comando **DOS veces** para generar:
1. `JWT_SECRET` (primera ejecución)
2. `JWT_REFRESH_SECRET` (segunda ejecución)

**Generar contraseña de admin**:
```bash
# Genera una contraseña segura de 20 caracteres
node -e "console.log(require('crypto').randomBytes(20).toString('base64'))"
```

### 3.5. Desplegar

1. Click **"Create Web Service"**
2. Render comenzará a:
   - 📦 Clonar tu repositorio
   - 📥 Instalar dependencias (`npm ci`)
   - 🚀 Iniciar el servidor (`npm start`)
3. Espera 3-5 minutos
4. Verás logs en tiempo real

---

## ✅ Paso 4: Verificar el Despliegue

### 4.1. URL de tu servicio

Render te asignará una URL como:
```
https://panaderia-backend.onrender.com
```

### 4.2. Probar endpoints

**Health Check**:
```bash
curl https://panaderia-backend.onrender.com/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2026-01-30T10:30:00.000Z",
  "uptime": 123.45,
  "mongodb": "connected"
}
```

**Documentación API**:

Abre en el navegador:
```
https://panaderia-backend.onrender.com/api-docs
```

### 4.3. Probar autenticación

**Registrar un usuario**:
```bash
curl -X POST https://panaderia-backend.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@test.com",
    "password": "Test1234!",
    "nombre": "Cliente",
    "apellido": "Test"
  }'
```

**Login**:
```bash
curl -X POST https://panaderia-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@test.com",
    "password": "Test1234!"
  }'
```

---

## 🔧 Paso 5: Gestión Post-Despliegue

### 5.1. Ver logs en tiempo real

1. En Render Dashboard → Tu servicio
2. Click en "Logs" en la barra lateral
3. Verás logs de Winston en tiempo real

### 5.2. Actualizar el código

Cada vez que hagas `git push` a `main`, Render **redespliegará automáticamente**:

```bash
# Hacer cambios en el código
git add .
git commit -m "Agregar nueva funcionalidad"
git push origin main

# Render detectará el push y redespliegará en ~3 minutos
```

### 5.3. Configurar dominios personalizados (opcional)

1. En tu servicio → "Settings" → "Custom Domains"
2. Click "Add Custom Domain"
3. Ingresa tu dominio: `api.panaderia.com`
4. Sigue las instrucciones para configurar DNS:
   - Tipo: `CNAME`
   - Nombre: `api`
   - Valor: `panaderia-backend.onrender.com`

### 5.4. Escalar el servicio (opcional)

**Plan Free**:
- ✅ HTTPS automático
- ✅ 512 MB RAM
- ✅ 0.1 CPU compartida
- ❌ Se "duerme" tras 15 min de inactividad (tarda ~30s en despertar)

**Para evitar el "sleep"**, considera:

**Opción 1: Pings automáticos (gratis)**
```bash
# Usa un servicio como UptimeRobot (gratis) para hacer ping cada 5 min
# URL a monitorear: https://panaderia-backend.onrender.com/health
```

**Opción 2: Actualizar a Starter Plan ($7/mes)**
- Sin "sleep"
- 512 MB RAM
- CPU dedicada
- Más estable para producción

---

## 🐛 Solución de Problemas

### Error: "Application failed to respond"

**Causa**: El servidor no está escuchando en `process.env.PORT`

**Solución**: Verifica [src/config/index.js](../src/config/index.js):
```javascript
export const config = {
  port: process.env.PORT || 3000, // ✅ DEBE usar process.env.PORT
  // ...
};
```

### Error: "MongooseServerSelectionError"

**Causa**: No puede conectar a MongoDB Atlas

**Soluciones**:
1. Verifica que `MONGODB_URI` esté correcta en Render
2. Confirma que en MongoDB Atlas → Network Access → 0.0.0.0/0 esté permitido
3. Verifica que la contraseña no tenga caracteres especiales sin encodear

### Error: "Build failed"

**Causa**: Fallo al instalar dependencias

**Soluciones**:
1. Verifica que `package.json` y `package-lock.json` estén en el repo
2. Asegúrate de que no haya errores de sintaxis en `package.json`
3. Revisa los logs de Render para ver el error específico

### El servicio está "slow" o no responde

**Causa**: Plan Free está en "sleep"

**Soluciones**:
1. Primera solicitud tarda ~30s (despertar)
2. Configura UptimeRobot para pings cada 5 min
3. O actualiza a Starter Plan

---

## 📊 Monitoreo y Métricas

### Render Dashboard

En tu servicio, ve a "Metrics":
- 📈 **CPU Usage**: Uso de procesador
- 💾 **Memory Usage**: Uso de RAM
- 🌐 **Bandwidth**: Tráfico entrante/saliente
- ⚡ **Response Times**: Latencia de respuestas

### MongoDB Atlas Monitoring

En Atlas → Cluster → "Metrics":
- 📊 **Operations**: Queries por segundo
- 💽 **Storage**: Espacio usado (máx 512 MB en Free)
- 🔗 **Connections**: Conexiones activas (máx 500 en Free)

---

## 🔐 Mejores Prácticas de Seguridad

### 1. Rotar secretos periódicamente

Cada 3-6 meses, regenera:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_PASSWORD`

### 2. Limitar IPs en MongoDB Atlas

En producción, reemplaza `0.0.0.0/0` con IPs específicas:
- Ve a Network Access
- Agrega las IPs de Render (consulta su documentación)

### 3. Habilitar logs de auditoría

En MongoDB Atlas:
- Performance Advisor → Analiza queries lentas
- Real-time Performance Panel → Monitorea operaciones

### 4. Configurar alertas

En Render:
- Settings → Notifications
- Configura alertas por email para:
  - Fallos en deploy
  - Uso alto de CPU/RAM
  - Servicio caído

---

## 🎯 Próximos Pasos

1. ✅ Desplegar el backend en Render
2. 🔜 Poblar la base de datos con datos iniciales (seed)
3. 🔜 Conectar el frontend (si aplica)
4. 🔜 Configurar CI/CD con tests automáticos
5. 🔜 Implementar monitoreo con Sentry o similar

---

## 📚 Recursos Adicionales

- [Documentación oficial de Render](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 💬 Soporte

¿Problemas con el despliegue?

1. Revisa los logs en Render Dashboard
2. Verifica las variables de entorno
3. Consulta la [sección de troubleshooting](#-solución-de-problemas)
4. Abre un issue en el repositorio

---

**¡Felicidades! 🎉 Tu backend ya está desplegado en Render.**
