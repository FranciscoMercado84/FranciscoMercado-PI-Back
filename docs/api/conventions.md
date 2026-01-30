# Convenciones API - Panadería El Sabor Artesano

Este documento establece las convenciones y estándares para el desarrollo de la API REST del backend de la panadería.

---

## 📌 Versionado

- **Ruta base incluye versión**: `/v1/...`
- **Cambios incompatibles**: crear nueva versión → `/v2/...`

**Ejemplo**:
```
/v1/products
/v1/admin/orders
```

---

## 🏷️ Naming (Convenciones de nombres)

### Paths (rutas)
- **Formato**: `kebab-case`
- **Ejemplos**:
  - `/v1/products`
  - `/v1/admin/orders`
  - `/v1/order-items`

### Query params
- **Formato**: `snake_case`
- **Ejemplos**:
  - `page`
  - `limit`
  - `category_id`
  - `order_status`

### Base de datos (DB)
- **Formato**: `snake_case`
- **Ejemplos**:
  - `product_id`
  - `created_at`
  - `order_status`

### JSON fields (respuestas API)
- **Formato**: `snake_case` (coherente con DB)
- **Ejemplo**:
```json
{
  "product_id": 1,
  "product_name": "Baguette",
  "created_at": "2025-11-12T10:00:00Z"
}
```

### Enum values (valores de enumeración)
- **Formato**: Strings en **español** consistentes
- **Ejemplos**:
  - Estados de pedido: `"Pendiente"`, `"En preparación"`, `"Listo"`, `"Entregado"`, `"Cancelado"`
  - Roles: `"admin"`, `"client"`

---

## 🔐 Seguridad

### Autenticación
- **Esquema**: Bearer token (JWT)
- **Header**:
```http
Authorization: Bearer <token>
```

### Roles y permisos
- **Roles disponibles**: `admin`, `client`
- **Token JWT**: incluye claim `role`
- **Scopes** (opcional): usar claim `scope` para permisos granulares si es necesario

**Ejemplo de payload JWT**:
```json
{
  "user_id": 123,
  "email": "admin@panaderia.com",
  "role": "admin",
  "scope": ["orders:read", "orders:write"],
  "iat": 1699776000,
  "exp": 1699862400
}
```

---

## 📄 Paginación

### Parámetros de query
| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `page` | integer | Número de página (1-based) | `1` |
| `limit` | integer | Elementos por página | `20` |

### Límites
- **Máximo**: `limit=100`
- **Default**: `page=1`, `limit=20`

### Formato de respuesta
```json
{
  "data": [
    { "id": 1, "name": "Producto 1" },
    { "id": 2, "name": "Producto 2" }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

## ❌ Errores

### Formato de respuesta
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Error de validación en los datos enviados",
  "details": [
    {
      "field": "email",
      "message": "El email no es válido"
    }
  ]
}
```

### HTTP Status Codes

| Código | Descripción | Uso |
|--------|-------------|-----|
| `400` | Bad Request | Errores de validación |
| `401` | Unauthorized | No autenticado o token inválido |
| `403` | Forbidden | Sin permisos para el recurso |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto (ej: email duplicado) |
| `500` | Internal Server Error | Error interno del servidor |

**Nota**: Ver `errores.md` para códigos de error específicos.

---

## 📦 Responses (Respuestas)

### Estructura general
- **Envolver datos** en campo `data` para facilitar inclusión de metadatos

**Ejemplo GET**:
```json
{
  "data": {
    "id": 1,
    "name": "Baguette",
    "price": 2.50
  }
}
```

**Ejemplo POST (creación exitosa)**:
```json
{
  "data": {
    "id": 42,
    "name": "Croissant",
    "created_at": "2025-11-12T10:30:00Z"
  }
}
```

### Headers en creación (POST)
- **Devolver header** `Location` con la URI del recurso creado

**Ejemplo**:
```http
HTTP/1.1 201 Created
Location: /v1/products/42
Content-Type: application/json
```

---

## 📎 Content-Type

### JSON (por defecto)
```http
Content-Type: application/json
```

### Upload de imágenes
- **Formato**: `multipart/form-data`
- **Field**: `image`

**Ejemplo de request**:
```http
POST /v1/products/1/image
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="image"; filename="baguette.jpg"
Content-Type: image/jpeg

[binary data]
--boundary--
```

---

## 🧪 Contrato de pruebas

### Colección Postman
- Mantener colección actualizada con todos los endpoints
- Incluir tests automáticos para validar respuestas
- Documentar ejemplos de requests y responses

### Semillas de base de datos (seeds)
Dataset mínimo para pruebas:

| Recurso | Cantidad mínima |
|---------|-----------------|
| Categorías | 3 |
| Productos | 6 |
| Clientes | 2 |
| Pedidos | 3 |

**Ejemplo de comando para ejecutar seeds**:
```bash
npx sequelize-cli db:seed:all
```

---

## 🧪 Propuesta de pruebas de contrato (Postman) y casos mínimos por HU crítica

### Colección / Pruebas mínimas (sugeridas)

#### 1. Auth
- `POST /v1/auth/register` → `201` + body `AuthResponse`
- `POST /v1/auth/login` → `200` + `access_token`

#### 2. Productos (HU: ver catálogo, detalle, CRUD admin)
- `GET /v1/products?page=1&limit=10` → `200` + `data[]` + `meta`
- `GET /v1/products/{id}` → `200` or `404`
- `POST /v1/products` (admin) → `201` (requires admin token)
- `PUT /v1/products/{id}` (admin) → `200`
- `DELETE /v1/products/{id}` (admin) → `204`

#### 3. Carrito & Checkout (HU crítica: añadir y confirmar pedido)
- `POST /v1/cart` add item → `200` cart updated
- `GET /v1/cart` → `200` cart content
- `POST /v1/orders` with items → `201` order created, `status = Pendiente`

#### 4. Gestión de Pedidos (admin)
- `GET /v1/admin/orders` → `200` list
- `PUT /v1/orders/{order_id}` status → `200` updated, verify status change propagates

#### 5. Contact form
- `POST /v1/contact` → `201` and email sending stubbed

### Tests de contrato (Postman / Newman)

Crear colección con variables de entorno:
- `{{base_url}}` - URL base de la API (ej: `http://localhost:3000/v1`)
- `{{admin_token}}` - Token JWT de administrador
- `{{client_token}}` - Token JWT de cliente

**Scripts de test (Postman Tests) para validar**:

```javascript
// Verificar código de respuesta
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Validar estructura del body
pm.test("Response has data field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});

// Validar campos de paginación
pm.test("Meta contains pagination fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.meta).to.have.all.keys('total', 'page', 'limit', 'pages');
});

// Verificar autorización requerida
pm.test("Unauthorized without token", function () {
    pm.response.to.have.status(401);
});
```

**Ejecutar con Newman (CLI)**:
```bash
newman run postman_collection.json -e environment.json --reporters cli,json
```

### Casos mínimos por HU crítica

#### HU: Realizar pedido (solo recogida)

| Caso | Descripción | Request | Respuesta esperada |
|------|-------------|---------|-------------------|
| ✅ Caso positivo | Carrito con items válidos | `POST /v1/orders` con `items[]`, `pickup_time`, `client_name` | `201` + `order_id` + `status: "Pendiente"` |
| ❌ Input inválido | Falta `pickup_time` | `POST /v1/orders` sin `pickup_time` | `400 VALIDATION_ERROR` con `details[].field = "pickup_time"` |
| ❌ Sin stock | Producto agotado | `POST /v1/orders` con producto `stock = 0` | `400` con mensaje "Producto sin stock disponible" |

**Ejemplo de request válido**:
```json
{
  "client_name": "Juan Pérez",
  "client_phone": "666123456",
  "pickup_time": "2025-11-13T10:00:00Z",
  "notes": "Sin gluten",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

#### HU: Gestión de productos (admin)

| Caso | Descripción | Request | Respuesta esperada |
|------|-------------|---------|-------------------|
| ✅ Crear producto | Datos válidos + imagen | `POST /v1/products` (multipart) con `name`, `price`, `category_id`, `image` | `201` + producto creado + `Location` header |
| ❌ Precio negativo | Editar con precio < 0 | `PUT /v1/products/{id}` con `price: -5.00` | `400 VALIDATION_ERROR` con `details[].field = "price"` |
| ❌ Borrar vinculado | Producto en pedido activo | `DELETE /v1/products/{id}` | `409 CONFLICT` con mensaje "No se puede eliminar producto con pedidos asociados" |

#### HU: Autenticación

| Caso | Descripción | Request | Respuesta esperada |
|------|-------------|---------|-------------------|
| ✅ Login exitoso | Credenciales correctas | `POST /v1/auth/login` con `email`, `password` | `200` + `access_token` + `user` |
| ❌ Credenciales incorrectas | Password equivocado | `POST /v1/auth/login` con password inválido | `401 UNAUTHORIZED` con `code: "INVALID_CREDENTIALS"` |
| ❌ Token expirado | Request con JWT expirado | Cualquier endpoint protegido con token expirado | `401 UNAUTHORIZED` con `code: "TOKEN_EXPIRED"` |

### Automatización recomendada

1. **Pre-request scripts** para obtener tokens:
```javascript
// Pre-request Script: Login automático
pm.sendRequest({
    url: pm.environment.get("base_url") + "/auth/login",
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: "admin@panaderia.com",
            password: "admin123"
        })
    }
}, function (err, res) {
    var jsonData = res.json();
    pm.environment.set("admin_token", jsonData.access_token);
});
```

2. **Integración continua** (CI/CD):
```yaml
# .github/workflows/api-tests.yml
- name: Run API contract tests
  run: |
    newman run tests/postman_collection.json \
      -e tests/ci_environment.json \
      --bail \
      --reporters cli,junit \
      --reporter-junit-export results.xml
```

---

## 📚 Referencias

- [Errores detallados](./errors.md)
- Colección Postman: `[enlace o ruta al archivo]`
- Documentación OpenAPI/Swagger: `[enlace si existe]`