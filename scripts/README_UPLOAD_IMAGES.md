# 📤 Script de Subida de Imágenes a Cloudinary

Este script sube todas las imágenes de productos desde la carpeta `uploads/` a Cloudinary y actualiza automáticamente la base de datos.

## 🚀 Uso

### 1. Configurar Credenciales de Cloudinary

Primero, asegúrate de tener tus credenciales de Cloudinary en el archivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**¿No tienes cuenta?** Créala gratis en [https://cloudinary.com](https://cloudinary.com)

### 2. Ejecutar el Script

```bash
npm run upload:images
```

## 📋 ¿Qué hace el script?

1. ✅ **Conecta a MongoDB** para acceder a los productos
2. ✅ **Lee todas las imágenes** de la carpeta `uploads/`
3. ✅ **Sube cada imagen a Cloudinary** con optimizaciones automáticas
4. ✅ **Actualiza cada producto** en la base de datos con:
   - `imagen_url`: URL pública de Cloudinary
   - `imagen_public_id`: ID para poder eliminar la imagen después
5. ✅ **Muestra un resumen** de la operación

## 🖼️ Imágenes Procesadas

El script procesará estas imágenes:

| Archivo | Producto |
|---------|----------|
| `barra-gallega-1-300x325.png` | Barra Campesina |
| `panvillo-tradicional-1-300x325.png` | Panvillo Tradicional |
| `barra-parisienne-1-300x325.png` | Barra Parisienne |
| `mollete-de-polvillo-300x325.png` | Mollete Clásico |
| `baguette-tradicional-1-300x325.png` | Baguette Tradicional |
| `croissant-curvo-margarina-1-300x325.png` | Croissant de Mantequilla |
| `Palmera-choco-300x325.png` | Palmera de Chocolate |
| `napolitana-de-chocolate-1-1-300x325.png` | Napolitana |
| `atun-aceite-oliva.jfif` | Atún en Aceite de Oliva |
| `tomate-frito.jpg` | Tomate Frito Casero |
| `aove.png` | Aceite de Oliva Virgen Extra |
| `vinagre-jerez-reserva-ybarra-500ml.jpg` | Vinagre de Jerez |
| `jamon-gran-reserva-cortado-sin-aditivos-jamon-pasion.jpg` | Jamón Serrano Loncheado |
| `chorizo.jpg` | Chorizo Ibérico |
| `agua.jpg` | Agua Mineral Natural |
| `vino-tinto.jpg` | Vino Tinto Crianza |
| `arroz-sos.jpg` | Arroz Extra |
| `espaguetti.jpg` | Pasta Espaguetis |
| `sal.jpg` | Sal Marina |

## ⚙️ Características

### Optimizaciones Automáticas

Cloudinary optimiza automáticamente cada imagen:
- 📐 Redimensiona a máximo 800x800px
- 🎨 Optimiza calidad automáticamente
- 🌐 Convierte a WebP cuando el navegador lo soporta
- ⚡ Almacena en caché para carga rápida

### Carpeta de Destino

Todas las imágenes se suben a la carpeta: `panaderia/productos/`

### Seguridad

- ✅ Verifica credenciales antes de empezar
- ✅ Valida que los archivos existan
- ✅ Valida que los productos existan en la base de datos
- ✅ Salta imágenes que ya están en Cloudinary

## 📊 Salida del Script

Ejemplo de ejecución:

```
✅ Conectado a MongoDB

📸 Iniciando subida de imágenes a Cloudinary...

📤 Subiendo: barra-gallega-1-300x325.png → Barra Campesina
   ✅ URL: https://res.cloudinary.com/tu-cloud/image/upload/v1234...
   🆔 Public ID: panaderia/productos/barra-gallega-1-300x325

📤 Subiendo: mollete-de-polvillo-300x325.png → Mollete Clásico
   ✅ URL: https://res.cloudinary.com/tu-cloud/image/upload/v1234...
   🆔 Public ID: panaderia/productos/mollete-de-polvillo-300x325

...

============================================================
📊 RESUMEN DE LA SUBIDA
============================================================
✅ Exitosas:     19
⏭️  Saltadas:      0
❌ Errores:      0
📁 Total:        19
============================================================

🎉 ¡Imágenes subidas exitosamente a Cloudinary!
💡 Las URLs ya están guardadas en la base de datos.
```

## 🔄 Ejecutar Nuevamente

El script es **idempotente**: puedes ejecutarlo varias veces sin problemas.

- Si un producto ya tiene `imagen_public_id`, se salta
- Solo sube imágenes que faltan
- No duplica imágenes en Cloudinary

## ❓ Troubleshooting

### Error: "Credenciales de Cloudinary no configuradas"

**Solución**: Agrega las variables de entorno al `.env`:
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Error: "Archivo no encontrado"

**Solución**: Asegúrate de que las imágenes estén en la carpeta `uploads/`

### Error: "Producto no encontrado"

**Solución**: Ejecuta primero `npm run seed` para crear los productos en la base de datos

### Error de conexión a MongoDB

**Solución**: Verifica que `MONGODB_URI` esté configurado correctamente en `.env`

## 🔧 Personalización

Para agregar o cambiar imágenes, edita el objeto `imageMap` en el script:

```javascript
const imageMap = {
  'nombre-archivo.jpg': 'Nombre del Producto',
  // Agregar más aquí...
};
```

## 📚 Más Información

- [Documentación de Cloudinary](https://cloudinary.com/documentation)
- [Guía completa de setup](../docs/CLOUDINARY_SETUP.md)

---

**¿Necesitas ayuda?** Revisa la [documentación de Cloudinary](https://cloudinary.com/documentation) o abre un issue.
