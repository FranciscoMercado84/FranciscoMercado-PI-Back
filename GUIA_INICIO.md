# 🚀 BACKEND POLVILLO - GUÍA DE INICIO RÁPIDO

## ✅ Backend Completado

Se ha generado un backend completo Node.js v22 + Express + Mongoose para conectar con tu frontend React.

### 📦 Lo que se creó:

**Modelos** (6 archivos):
- ✅ `Usuario.js` - Autenticación con bcrypt y JWT
- ✅ `Categoria.js` - Categorías de productos
- ✅ `Producto.js` - Productos con índices de búsqueda
- ✅ `Carrito.js` - Carrito de compras
- ✅ `Pedido.js` - Gestión de pedidos con historial
- ✅ `index.js` - Export centralizado

**Controladores** (4 archivos):
- ✅ `authController.js` - Register, login, profile
- ✅ `productosController.js` - CRUD completo de productos
- ✅ `carritoController.js` - Gestión del carrito
- ✅ `pedidosController.js` - Crear y gestionar pedidos

**Rutas** (5 archivos):
- ✅ `auth.js` - Rutas de autenticación con validación
- ✅ `productos.js` - Rutas de productos (públicas y admin)
- ✅ `carrito.js` - Rutas de carrito (protegidas)
- ✅ `pedidos.js` - Rutas de pedidos (customer y admin)
- ✅ `index.js` - Router principal actualizado

**Middlewares** (3 nuevos):
- ✅ `authMiddleware.js` - Protección JWT actualizado
- ✅ `adminMiddleware.js` - Verificación de rol admin
- ✅ `validateRequest.js` - Validación con express-validator
- ✅ `errorHandler.js` - Manejo de errores actualizado

**Utils**:
- ✅ `asyncHandler.js` - Wrapper para async/await

**Scripts**:
- ✅ `seed.js` - 18 productos Polvillo + categorías + usuarios

**Configuración actualizada**:
- ✅ `.env.example` - Template con MongoDB Atlas
- ✅ `config/index.js` - Configuración centralizada
- ✅ `loaders/middleware.js` - CORS configurado para React
- ✅ `loaders/routes.js` - Rutas `/v1/*` + error handler
- ✅ `package.json` - Dependencia `express-validator` añadida

---

## 🗄️ 1. CONFIGURAR MONGODB ATLAS (GRATIS)

### Paso 1: Crear cuenta y cluster

1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto llamado **"Panaderia Polvillo"**
4. Click en **"Build a Database"**
5. Selecciona plan **M0 (FREE)**:
   - Provider: **AWS**
   - Region: Elige la más cercana (ej: `us-east-1`)
   - Cluster Name: **panaderia-cluster**
6. Click **"Create"**

### Paso 2: Crear usuario de base de datos

1. En la pantalla de seguridad que aparece:
   - **Username**: `Paco`
   - **Password**: 12Abril84
   - Click **"Create User"**

2. **Importante**: Guarda este usuario y contraseña

### Paso 3: Permitir acceso desde cualquier IP

1. En "Where would you like to connect from?":
   - Click **"Add My Current IP Address"**
   - Luego click **"Add a Different IP Address"**
   - IP Address: `0.0.0.0/0` (permite desde cualquier lugar)
   - Description: `Permitir acceso desde cualquier IP`
   - Click **"Add Entry"**

2. Click **"Finish and Close"**

### Paso 4: Obtener la cadena de conexión

1. Click en **"Connect"** en tu cluster
2. Selecciona **"Connect your application"**
3. Driver: **Node.js**
4. Version: **5.5 or later**
5. Copia la cadena de conexión:

```
mongodb+srv://panaderia_user:<password>@panaderia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **Reemplaza `<password>`** con tu contraseña
7. **Añade el nombre de la base de datos**: `/panaderia` antes del `?`

Resultado final:
```
mongodb+srv://panaderia_user:TU_PASSWORD@panaderia-cluster.xxxxx.mongodb.net/panaderia?retryWrites=true&w=majority
```

---

## ⚙️ 2. CONFIGURAR EL PROYECTO

### Paso 1: Actualizar el archivo .env

Crea/edita el archivo `.env` en la raíz con:

```env
# Servidor
PORT=3001
NODE_ENV=development

# MongoDB Atlas - PEGA TU URL AQUÍ
MONGODB_URI=mongodb+srv://panaderia_user:TU_PASSWORD@panaderia-cluster.xxxxx.mongodb.net/panaderia?retryWrites=true&w=majority
MONGODB_URI_TEST=mongodb+srv://panaderia_user:TU_PASSWORD@panaderia-cluster.xxxxx.mongodb.net/panaderia_test?retryWrites=true&w=majority

# JWT - Genera un secreto seguro
JWT_SECRET=tu_clave_super_secreta_cambiar_en_produccion_minimo_32_caracteres
JWT_EXPIRATION=30d

# Frontend React
FRONTEND_URL=http://localhost:5173

# Admin
ADMIN_EMAIL=admin@panaderia.com
ADMIN_PASSWORD=admin123
```

### Paso 2: Generar secreto JWT seguro

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado y reemplázalo en `JWT_SECRET` del `.env`

---

## 🚀 3. EJECUTAR EL BACKEND

### Paso 1: Instalar dependencias (si no lo has hecho)

```bash
npm install
```

### Paso 2: Ejecutar seeds para poblar la base de datos

```bash
npm run seed
```

**Salida esperada**:
```
🗑️  Limpiando base de datos...
✅ Base de datos limpiada
👥 Creando usuarios...
✅ Usuarios creados
📁 Creando categorías...
✅ Categorías creadas
🍞 Creando productos Polvillo...
✅ Productos Polvillo creados

🎉 Seeds completados!

📧 Credenciales:
   Admin: admin@panaderia.com / admin123
   Cliente: cliente@test.com / test123

📊 Resumen:
   2 usuarios
   6 categorías
   18 productos
```

### Paso 3: Iniciar el servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm start
```

**Salida esperada**:
```
✅ MongoDB Atlas conectado: panaderia-cluster.xxxxx.mongodb.net
✅ Middlewares cargados
✅ Rutas cargadas
🚀 Servidor corriendo en puerto 3001
📍 Entorno: development
🌐 Frontend: http://localhost:5173
```

---

## ✅ 4. PROBAR EL BACKEND

### Health Check

```powershell
Invoke-RestMethod -Uri http://localhost:3001/health
```

**Respuesta esperada**:
```json
{
  "status": "OK",
  "timestamp": "2026-02-03T...",
  "service": "Panadería Polvillo API",
  "environment": "development",
  "mongodb": "connected"
}
```

### Ver endpoints disponibles

```powershell
Invoke-RestMethod -Uri http://localhost:3001/v1/
```

### Login como admin

```powershell
$loginBody = @{
    email = "admin@panaderia.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3001/v1/auth/login `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$token = $response.data.access_token
Write-Host "Token: $token"
```

### Obtener productos

```powershell
Invoke-RestMethod -Uri http://localhost:3001/v1/productos
```

**Respuesta esperada** (18 productos):
```json
{
  "data": [
    {
      "nombre": "Barra Campesina",
      "precio": 1.2,
      "categoria": { "nombre": "Tradicionales" },
      ...
    },
    ...
  ],
  "meta": {
    "total": 18,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 📡 5. ENDPOINTS DE LA API

### **Autenticación** (Públicas)

```http
POST /v1/auth/register
POST /v1/auth/login
GET  /v1/auth/profile (protegida)
```

### **Productos** (Públicas + Admin)

```http
GET    /v1/productos          # Listar todos
GET    /v1/productos/:id      # Ver uno
POST   /v1/productos          # Crear (admin)
PUT    /v1/productos/:id      # Actualizar (admin)
DELETE /v1/productos/:id      # Eliminar (admin)
```

**Query params para GET /productos**:
- `?page=1&limit=20` - Paginación
- `?categoria=64abc123...` - Filtrar por categoría
- `?q=mollete` - Búsqueda por texto

### **Carrito** (Protegidas)

```http
GET    /v1/carrito            # Ver mi carrito
POST   /v1/carrito/items      # Añadir producto
PUT    /v1/carrito/items/:id  # Actualizar cantidad
DELETE /v1/carrito/items/:id  # Eliminar item
DELETE /v1/carrito            # Vaciar carrito
```

### **Pedidos** (Protegidas + Admin)

```http
POST   /v1/pedidos                 # Crear pedido desde carrito
GET    /v1/pedidos                 # Mis pedidos
GET    /v1/pedidos/:id             # Ver un pedido
GET    /v1/pedidos/admin/all       # Todos los pedidos (admin)
PUT    /v1/pedidos/:id/estado      # Cambiar estado (admin)
```

---

## 🔐 6. AUTENTICACIÓN CON EL FRONTEND

Tu frontend React debe:

### 1. Login y guardar token

```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:3001/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  const token = data.data.access_token;
  const user = data.data.user;

  // Guardar en localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return { token, user };
};
```

### 2. Incluir token en requests protegidas

```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3001/v1/auth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return await response.json();
};
```

### 3. Verificar rol del usuario

```javascript
const user = JSON.parse(localStorage.getItem('user'));

if (user.role === 'admin') {
  // Mostrar panel de administración
} else {
  // Usuario normal (customer)
}
```

---

## 📚 7. DATOS DE PRUEBA

### Usuarios creados por seeds

| Email | Password | Rol | Uso |
|-------|----------|-----|-----|
| `admin@panaderia.com` | `admin123` | `admin` | Panel de administración |
| `cliente@test.com` | `test123` | `customer` | Usuario normal |

### Categorías (6)

1. Tradicionales
2. Barras y Andaluzas
3. Panes de Salud
4. Integrales 100%
5. Molletes
6. Baguettes

### Productos destacados (18 total, 7 destacados)

- Barra Campesina (€1.20) ⭐
- Barra Parisienne (€0.85) ⭐
- Barra Gourmet (€1.50) ⭐
- Chapata 5 Cereales (€2.30) ⭐
- Hogaza Integral (€3.50) ⭐
- Mollete Clásico (€0.60) ⭐
- Baguette (€1.10) ⭐

---

## 🔧 8. TROUBLESHOOTING

### Error: "Cannot connect to MongoDB"

**Causa**: No se puede conectar a MongoDB Atlas

**Soluciones**:
1. Verifica que `MONGODB_URI` esté correcta en `.env`
2. Verifica que la contraseña no tenga caracteres especiales sin encodear
3. Verifica que hayas añadido `/panaderia` al final de la URI (antes del `?`)
4. Verifica que `0.0.0.0/0` esté en Network Access en Atlas

### Error: "JWT secret not defined"

**Causa**: No se cargó el `.env`

**Solución**: Verifica que el archivo `.env` existe en la raíz del proyecto

### Error: "Port 3001 already in use"

**Solución**:
```powershell
# Cambiar puerto en .env a 3002
PORT=3002

# O matar el proceso
$pid = (Get-NetTCPConnection -LocalPort 3001).OwningProcess
Stop-Process -Id $pid -Force
```

### Seeds no crean datos

**Solución**:
```bash
# Ver errores completos
npm run seed
```

Si hay error de conexión, verifica MongoDB Atlas.

---

## 📋 9. PRÓXIMOS PASOS

1. ✅ **Conectar tu frontend React**:
   - Actualiza las llamadas API a `http://localhost:3001/v1/...`
   - Implementa login y registro
   - Guarda el token JWT en localStorage
   - Incluye `Authorization: Bearer <token>` en requests protegidas

2. 🎨 **Añadir imágenes de productos**:
   - Los productos tienen URLs en `/images/barra-campesina.jpg`, etc.
   - Coloca imágenes reales en la carpeta `public/images/` del frontend
   - O actualiza las URLs a imágenes externas

3. 📊 **Probar flujo completo**:
   - Registro de usuario
   - Login
   - Ver productos
   - Añadir al carrito
   - Crear pedido
   - Admin: gestionar pedidos

4. 🚀 **Desplegar en producción**:
   - Backend en Render/Railway/Heroku
   - Frontend en Vercel/Netlify
   - MongoDB Atlas ya está en la nube

---

## 🎉 ¡BACKEND LISTO!

Tu backend está completamente funcional y listo para conectar con el frontend React en `http://localhost:5173`.

**Estructura completa mantenida**:
- ✅ Loaders pattern
- ✅ MVC architecture
- ✅ ES Modules
- ✅ Express 5
- ✅ Mongoose con validaciones
- ✅ JWT authentication
- ✅ express-validator
- ✅ Error handling centralizado
- ✅ CORS configurado para React

**Comandos rápidos**:
```bash
npm run seed    # Poblar base de datos
npm run dev     # Servidor desarrollo
npm start       # Servidor producción
npm test        # Tests (si los añades)
```

---

**¿Dudas?** Revisa los logs en la consola o verifica los endpoints en http://localhost:3001/v1/
