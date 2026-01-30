# Guía de Errores API - Panadería El Sabor Artesano

Este documento define el formato estándar de errores, códigos de estado HTTP y convenciones para respuestas exitosas en la API.

---

## 📋 Formato de error (estándar)

Todas las respuestas de error deben regresar `application/json` con el siguiente esquema:

```json
{
  "code": "STRING_CODE",
  "message": "Mensaje legible para humanos (preferiblemente en español).",
  "details": [
    {
      "field": "nombre_del_campo",
      "issue": "Descripción del problema"
    }
  ]
}
```

### Campos del error

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `code` | string | ✅ | Código único y constante que identifica el error |
| `message` | string | ✅ | Mensaje orientado al usuario (en español) |
| `details` | array | ❌ | Lista de objetos explicando problemas por campo (validación) |

### Ejemplos de códigos
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `INTERNAL_ERROR`
- `CONFLICT`

---

## 🔢 Códigos de error recomendados

| Código | HTTP Status | Descripción | Ejemplo de uso |
|--------|-------------|-------------|----------------|
| `VALIDATION_ERROR` | `400` | Error de validación en los datos enviados | Campos requeridos faltantes, formato inválido |
| `UNAUTHORIZED` | `401` | No autenticado o token inválido | Token expirado, sin token |
| `FORBIDDEN` | `403` | Sin permisos para acceder al recurso | Usuario sin rol adecuado |
| `NOT_FOUND` | `404` | Recurso no encontrado | Producto o pedido inexistente |
| `CONFLICT` | `409` | Conflicto con estado actual del recurso | Email ya registrado, SKU duplicado |
| `RATE_LIMIT` | `429` | Demasiadas solicitudes | Límite de API excedido |
| `INTERNAL_ERROR` | `500` | Error interno del servidor | Fallo en BD, error no controlado |

---

## 📝 Ejemplos de respuestas de error

### Error de validación (400)
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Error de validación en los datos enviados",
  "details": [
    {
      "field": "email",
      "issue": "El email no es válido"
    },
    {
      "field": "password",
      "issue": "La contraseña debe tener al menos 8 caracteres"
    }
  ]
}
```

### Recurso no encontrado (404)
```json
{
  "code": "NOT_FOUND",
  "message": "El producto con ID 999 no existe"
}
```

### No autorizado (401)
```json
{
  "code": "UNAUTHORIZED",
  "message": "Token de autenticación inválido o expirado"
}
```

### Sin permisos (403)
```json
{
  "code": "FORBIDDEN",
  "message": "No tienes permisos para realizar esta acción"
}
```

### Conflicto (409)
```json
{
  "code": "CONFLICT",
  "message": "El email ya está registrado en el sistema",
  "details": [
    {
      "field": "email",
      "issue": "Este email ya existe"
    }
  ]
}
```

### Error interno (500)
```json
{
  "code": "INTERNAL_ERROR",
  "message": "Ocurrió un error interno en el servidor. Por favor, intenta más tarde."
}
```

---

## ✅ Envoltorio de respuestas exitosas

### Consultas paginadas (GET con múltiples resultados)
```json
{
  "data": [
    { "id": 1, "name": "Baguette" },
    { "id": 2, "name": "Croissant" }
  ],
  "meta": {
    "total": 125,
    "page": 1,
    "limit": 20,
    "pages": 7
  }
}
```

### Operación única (GET /v1/products/1)
```json
{
  "data": {
    "id": 1,
    "name": "Baguette",
    "price": 2.50,
    "category_id": 3
  }
}
```

### Creación (POST)
- **HTTP Status**: `201 Created`
- **Header**: `Location: /v1/products/42`
- **Body**:
```json
{
  "data": {
    "id": 42,
    "name": "Pan de molde",
    "price": 3.00,
    "created_at": "2025-11-12T10:30:00Z"
  }
}
```

### Actualización (PUT/PATCH)
- **HTTP Status**: `200 OK`
- **Body**:
```json
{
  "data": {
    "id": 1,
    "name": "Baguette actualizada",
    "price": 2.75,
    "updated_at": "2025-11-12T11:00:00Z"
  }
}
```

### Eliminación (DELETE)
- **HTTP Status**: `204 No Content`
- **Body**: *(vacío)*

---

## ⚠️ Notas importantes

### Validación
- Siempre devolver `VALIDATION_ERROR` con el campo `details` indicando qué campos tienen problemas
- Incluir todos los errores de validación en una sola respuesta (no solo el primero)

### Seguridad
- **NO exponer** stack traces ni información sensible en mensajes de error
- **NO revelar** detalles internos de la implementación
- En errores `500`, usar mensajes genéricos para el usuario

### Internacionalización
- Todos los mensajes deben estar en **español** por defecto
- Si se añade soporte multilenguaje, usar header `Accept-Language`

### Logging
- Todos los errores `500` deben loguearse internamente con stack trace completo
- Errores `4xx` pueden loguearse con nivel `warn` o `info`

---

## 📚 Referencias

- [Convenciones API](./conventions.md)
- [HTTP Status Codes - MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Status)