# 📸 Gestión de Imágenes con Cloudinary

Este proyecto utiliza **Cloudinary** para almacenar y gestionar las imágenes de productos de forma eficiente y escalable.

## 🚀 Configuración Inicial

### 1. Crear cuenta en Cloudinary

1. Ve a [https://cloudinary.com](https://cloudinary.com)
2. Regístrate para obtener una cuenta gratuita (10GB de almacenamiento gratis)
3. Ve al Dashboard: [https://cloudinary.com/console](https://cloudinary.com/console)

### 2. Obtener credenciales

En el Dashboard de Cloudinary encontrarás:
- **Cloud Name**: Tu identificador único
- **API Key**: Clave pública
- **API Secret**: Clave privada (no compartir)

### 3. Configurar variables de entorno

Agrega estas variables a tu archivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## 📝 Endpoints Disponibles

### 1. Subir Imagen de Producto

```http
POST /v1/productos/:id/imagen
Authorization: Bearer {token_admin}
Content-Type: multipart/form-data

Body (form-data):
- imagen: [archivo de imagen]
```

**Ejemplo con cURL:**
```bash
curl -X POST \
  http://localhost:3001/v1/productos/PRODUCTO_ID/imagen \
  -H "Authorization: Bearer TU_TOKEN" \
  -F "imagen=@/ruta/a/tu/imagen.jpg"
```

**Respuesta exitosa:**
```json
{
  "data": {
    "imagen_url": "https://res.cloudinary.com/...",
    "imagen_public_id": "panaderia/productos/abc123"
  }
}
```

### 2. Eliminar Imagen de Producto

```http
DELETE /v1/productos/:id/imagen
Authorization: Bearer {token_admin}
```

**Respuesta exitosa:**
```json
{
  "data": {
    "message": "Imagen eliminada correctamente"
  }
}
```

### 3. Actualizar Stock

```http
PUT /v1/productos/:id/stock
Authorization: Bearer {token_admin}
Content-Type: application/json

Body:
{
  "operacion": "agregar|reducir|establecer",
  "cantidad": 50
}
```

**Respuesta exitosa:**
```json
{
  "data": {
    "stock": 150,
    "stock_bajo": false,
    "estado_inventario": "disponible",
    "disponible": true
  }
}
```

### 4. Productos con Stock Bajo

```http
GET /v1/productos/inventario/bajo-stock
Authorization: Bearer {token_admin}
```

### 5. Productos Agotados

```http
GET /v1/productos/inventario/agotados
Authorization: Bearer {token_admin}
```

## 💾 Modelo de Producto Actualizado

### Campos nuevos:

```javascript
{
  // Gestión de imágenes
  "imagen_url": "https://res.cloudinary.com/...",
  "imagen_public_id": "panaderia/productos/abc123",
  
  // Gestión de inventario
  "stock": 100,
  "stock_minimo": 10,
  "disponible": true,
  
  // Virtuales (calculados automáticamente)
  "stock_bajo": false,  // true si stock <= stock_minimo
  "estado_inventario": "disponible"  // 'agotado' | 'bajo' | 'disponible'
}
```

### Estados de Inventario:

- **`agotado`**: `stock === 0`
- **`bajo`**: `stock > 0 && stock <= stock_minimo`
- **`disponible`**: `stock > stock_minimo`

### Comportamiento Automático:

- Si `stock === 0`, `disponible` se establece automáticamente en `false`
- El campo `stock_bajo` se calcula automáticamente
- El campo `estado_inventario` se calcula automáticamente

## 🖼️ Formatos de Imagen Soportados

- JPEG / JPG
- PNG
- GIF
- WebP

**Límite de tamaño**: 5 MB por imagen

## ⚙️ Optimizaciones Automáticas

Cloudinary automáticamente:
- ✅ Redimensiona imágenes grandes a máximo 800x800px
- ✅ Optimiza la calidad automáticamente
- ✅ Convierte a WebP cuando el navegador lo soporte
- ✅ Almacena en caché para carga rápida

## 🔒 Seguridad

- ✅ Solo usuarios con rol `admin` pueden subir/eliminar imágenes
- ✅ Solo usuarios con rol `admin` pueden gestionar stock
- ✅ Las imágenes se suben a carpeta específica: `panaderia/productos/`
- ✅ Las credenciales de Cloudinary están en variables de entorno

## 📦 Flujo de Upload

1. **Cliente** envía imagen al backend
2. **Backend** guarda temporalmente en `/uploads/temp/`
3. **Backend** sube a Cloudinary
4. **Cloudinary** procesa y optimiza la imagen
5. **Backend** guarda URL y public_id en MongoDB
6. **Backend** elimina archivo temporal
7. **Backend** responde con URL de Cloudinary

## 🧪 Ejemplo de Uso en Frontend

### React + Fetch

```javascript
const subirImagen = async (productoId, archivo) => {
  const formData = new FormData();
  formData.append('imagen', archivo);

  const response = await fetch(
    `http://localhost:3001/v1/productos/${productoId}/imagen`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );

  const data = await response.json();
  return data;
};

// Uso en componente
<input 
  type="file" 
  accept="image/*"
  onChange={async (e) => {
    const archivo = e.target.files[0];
    const resultado = await subirImagen(productoId, archivo);
    console.log('Imagen subida:', resultado.data.imagen_url);
  }}
/>
```

### Actualizar Stock

```javascript
const actualizarStock = async (productoId, operacion, cantidad) => {
  const response = await fetch(
    `http://localhost:3001/v1/productos/${productoId}/stock`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ operacion, cantidad })
    }
  );

  const data = await response.json();
  return data;
};

// Agregar 20 unidades
await actualizarStock(productoId, 'agregar', 20);

// Reducir 5 unidades
await actualizarStock(productoId, 'reducir', 5);

// Establecer stock en 100
await actualizarStock(productoId, 'establecer', 100);
```

## 🌍 Configuración en Producción (Render)

En el dashboard de Render, agrega las variables de entorno:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## ❓ Troubleshooting

### Error: "No se proporcionó ninguna imagen"

**Causa**: No se envió el campo `imagen` en el form-data

**Solución**: Asegúrate de usar `Content-Type: multipart/form-data` y enviar el campo `imagen`

### Error: "Solo se permiten imágenes"

**Causa**: El archivo no es una imagen válida

**Solución**: Usa formatos: JPEG, PNG, GIF o WebP

### Error: "Error al subir la imagen"

**Causa**: Credenciales de Cloudinary incorrectas

**Solución**: Verifica que las variables de entorno estén correctas

## 📊 Límites del Plan Gratuito de Cloudinary

- **Almacenamiento**: 25GB
- **Transformaciones**: 25,000 por mes
- **Ancho de banda**: 25GB por mes

Para la mayoría de panaderías pequeñas/medianas, esto es más que suficiente.

---

**¿Necesitas ayuda?** Revisa la [documentación oficial de Cloudinary](https://cloudinary.com/documentation)
