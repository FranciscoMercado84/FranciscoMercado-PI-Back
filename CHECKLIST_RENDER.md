# ✅ Checklist de Despliegue en Render

Usa este checklist para verificar que todo está listo antes de desplegar.

## 📋 Pre-Despliegue

### Código y Repositorio
- [ ] Código actualizado en rama `main`
- [ ] Todos los cambios commiteados
- [ ] Push a GitHub completado
- [ ] Sin archivos `.env` en el repositorio (verificar `.gitignore`)
- [ ] `package.json` tiene scripts `start` y `dev`
- [ ] Archivo `render.yaml` existe en raíz

### MongoDB Atlas
- [ ] Cuenta creada en MongoDB Atlas
- [ ] Cluster M0 (Free) creado
- [ ] Usuario de base de datos creado
- [ ] Contraseña del usuario guardada
- [ ] Network Access configurado (0.0.0.0/0)
- [ ] Cadena de conexión obtenida y guardada
- [ ] Nombre de base de datos agregado a la URL (`/panaderia`)

### Variables de Entorno
- [ ] `NODE_ENV` → `production`
- [ ] `PORT` → `10000`
- [ ] `MONGODB_URI` → Tu URL de MongoDB Atlas
- [ ] `JWT_SECRET` → Generado con crypto.randomBytes
- [ ] `JWT_EXPIRATION` → `7d`
- [ ] `JWT_REFRESH_SECRET` → Generado (diferente a JWT_SECRET)
- [ ] `JWT_REFRESH_EXPIRATION` → `30d`
- [ ] `ADMIN_EMAIL` → Email del administrador
- [ ] `ADMIN_PASSWORD` → Contraseña segura

## 🚀 Despliegue

### Render
- [ ] Cuenta creada en Render.com
- [ ] Repositorio conectado
- [ ] Web Service creado
- [ ] Region seleccionada
- [ ] Plan Free seleccionado
- [ ] Variables de entorno configuradas
- [ ] Deployment iniciado
- [ ] Logs monitoreados (sin errores)

## ✅ Post-Despliegue

### Verificación
- [ ] URL del servicio obtenida (https://panaderia-backend.onrender.com)
- [ ] Health check responde correctamente (`/health`)
- [ ] Swagger UI accesible (`/api-docs`)
- [ ] MongoDB conectada (verificar en logs)
- [ ] Endpoint de registro funciona
- [ ] Endpoint de login funciona
- [ ] Tokens JWT se generan correctamente

### Testing
```bash
# Health Check
curl https://TU-URL.onrender.com/health

# Registro
curl -X POST https://TU-URL.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","nombre":"Test","apellido":"User"}'

# Login
curl -X POST https://TU-URL.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!"}'
```

### Monitoreo
- [ ] Métricas de Render revisadas (CPU, Memory)
- [ ] Logs sin errores críticos
- [ ] Tiempos de respuesta < 500ms
- [ ] MongoDB Atlas muestra conexiones activas

## 🔐 Seguridad

- [ ] Secretos JWT únicos y seguros (64 caracteres hex)
- [ ] Contraseña de admin compleja
- [ ] Variables sensibles NO están en el código
- [ ] HTTPS habilitado (automático en Render)
- [ ] CORS configurado correctamente

## 📈 Optimización (Opcional)

- [ ] UptimeRobot configurado (ping cada 5 min)
- [ ] Dominio personalizado configurado
- [ ] Alertas de Render activadas
- [ ] MongoDB Atlas monitoring activado
- [ ] Plan Starter considerado (si necesitas evitar sleep)

## 🐛 Troubleshooting

Si algo falla, verifica:

1. **"Application failed to respond"**
   - Verifica que el servidor use `process.env.PORT`
   - Revisa logs de Render para errores de inicio

2. **"MongooseServerSelectionError"**
   - Verifica `MONGODB_URI` en variables de entorno
   - Confirma Network Access en MongoDB Atlas
   - Verifica que la contraseña no tenga caracteres especiales sin encodear

3. **"Build failed"**
   - Verifica que `package.json` esté en el repo
   - Asegúrate de no tener errores de sintaxis
   - Revisa que todas las dependencias estén en `package.json`

4. **Servicio muy lento**
   - Primera request tarda ~30s (despertar de sleep)
   - Configura UptimeRobot o actualiza a Starter Plan

## 📚 Recursos

- Tutorial completo: [docs/TUTORIAL_RENDER.md](docs/TUTORIAL_RENDER.md)
- Guía de despliegue: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Documentación MongoDB Atlas: https://docs.atlas.mongodb.com
- Documentación Render: https://render.com/docs

---

**¡Éxito en tu despliegue! 🎉**
