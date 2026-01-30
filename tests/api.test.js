import { describe, it, expect, afterAll, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initAuth } from '../src/services/authService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de notas de prueba
const NOTES_DIR = path.join(__dirname, '../src/notes');
const LOGS_DIR = path.join(__dirname, '../logs');

// Asegurar directorios existen
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Importamos la app después de crear directorios
const { default: app } = await import('../src/app.js');

describe('API REST de Notas', () => {
  let authToken;

  // Limpiar notas de prueba antes de cada test
  const limpiarNotasPrueba = () => {
    const notasTest = fs.readdirSync(NOTES_DIR).filter(n => n.startsWith('test-'));
    notasTest.forEach(nota => {
      fs.unlinkSync(path.join(NOTES_DIR, nota));
    });
  };

  // Obtener token de autenticación antes de todos los tests
  beforeAll(async () => {
    await initAuth();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    authToken = res.body.data.token;
  });

  beforeEach(() => {
    limpiarNotasPrueba();
  });

  afterAll(() => {
    limpiarNotasPrueba();
  });

  describe('GET /health', () => {
    it('debe retornar estado healthy', async () => {
      const res = await request(app).get('/health');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api', () => {
    it('debe retornar información de la API', async () => {
      const res = await request(app).get('/api');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('API de Notas');
      expect(res.body.endpoints).toBeDefined();
    });
  });

  describe('GET /api/notes', () => {
    it('debe listar todas las notas', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.count).toBeDefined();
    });

    it('debe incluir notas creadas', async () => {
      // Crear nota de prueba
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-listar', contenido: 'Contenido de prueba' });

      // Usar filtro por título para encontrar la nota específica
      const res = await request(app)
        .get('/api/notes?titulo=test-listar')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      const notaEncontrada = res.body.data.find(n => n.nombre === 'test-listar');
      expect(notaEncontrada).toBeDefined();
    });
  });

  describe('GET /api/notes/:id', () => {
    it('debe obtener una nota por ID', async () => {
      // Primero crear una nota
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-obtener', contenido: 'Contenido para obtener' });

      // Obtener lista usando filtro por título para encontrar la nota
      const listaRes = await request(app)
        .get('/api/notes?titulo=test-obtener')
        .set('Authorization', `Bearer ${authToken}`);
      const nota = listaRes.body.data.find(n => n.nombre === 'test-obtener');

      const res = await request(app)
        .get(`/api/notes/${nota.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe('test-obtener');
      expect(res.body.data.contenido).toBe('Contenido para obtener');
    });

    it('debe retornar 404 si la nota no existe', async () => {
      const res = await request(app)
        .get('/api/notes/99999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 404 para ID inválido', async () => {
      const res = await request(app)
        .get('/api/notes/abc')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 404 para ID negativo', async () => {
      const res = await request(app)
        .get('/api/notes/-1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/notes', () => {
    it('debe crear una nueva nota', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-crear', contenido: 'Nota nueva de prueba' });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe('test-crear');
      expect(res.body.data.contenido).toBe('Nota nueva de prueba');
    });

    it('debe retornar 400 si falta el nombre', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ contenido: 'Solo contenido' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 400 si el nombre está vacío', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: '   ', contenido: 'Contenido' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 400 si falta el contenido', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-sin-contenido' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 400 si nombre tiene caracteres inválidos', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test<>invalido', contenido: 'Contenido' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 400 si nombre es muy largo', async () => {
      const nombreLargo = 'a'.repeat(101);
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: nombreLargo, contenido: 'Contenido' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 409 si la nota ya existe', async () => {
      // Crear nota
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-duplicado', contenido: 'Primera' });

      // Intentar crear con mismo nombre
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-duplicado', contenido: 'Segunda' });
      
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 400 si nombre no es string', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 123, contenido: 'Contenido' });
      
      expect(res.status).toBe(400);
    });

    it('debe retornar 400 si contenido no es string', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-invalido', contenido: 123 });
      
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('debe actualizar una nota existente', async () => {
      // Crear nota
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-actualizar', contenido: 'Contenido original' });

      // Obtener ID usando filtro por título
      const listaRes = await request(app)
        .get('/api/notes?titulo=test-actualizar')
        .set('Authorization', `Bearer ${authToken}`);
      const nota = listaRes.body.data.find(n => n.nombre === 'test-actualizar');

      // Actualizar
      const res = await request(app)
        .put(`/api/notes/${nota.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ contenido: 'Contenido actualizado' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contenido).toBe('Contenido actualizado');
    });

    it('debe retornar 404 si la nota no existe', async () => {
      const res = await request(app)
        .put('/api/notes/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ contenido: 'Nuevo contenido' });
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 400 si falta el contenido', async () => {
      // Crear nota
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-put-sin-contenido', contenido: 'Contenido' });

      const listaRes = await request(app)
        .get('/api/notes?titulo=test-put-sin-contenido')
        .set('Authorization', `Bearer ${authToken}`);
      const nota = listaRes.body.data.find(n => n.nombre === 'test-put-sin-contenido');

      const res = await request(app)
        .put(`/api/notes/${nota.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      expect(res.status).toBe(400);
    });

    it('debe retornar 404 para ID inválido', async () => {
      const res = await request(app)
        .put('/api/notes/abc')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ contenido: 'Contenido' });
      
      expect(res.status).toBe(404);
    });

    it('debe retornar 400 si contenido no es string', async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-put-invalido', contenido: 'Contenido' });

      const listaRes = await request(app)
        .get('/api/notes?titulo=test-put-invalido')
        .set('Authorization', `Bearer ${authToken}`);
      const nota = listaRes.body.data.find(n => n.nombre === 'test-put-invalido');

      const res = await request(app)
        .put(`/api/notes/${nota.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ contenido: 123 });
      
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('debe eliminar una nota existente', async () => {
      // Crear nota
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-eliminar', contenido: 'A eliminar' });

      // Obtener ID usando filtro por título
      const listaRes = await request(app)
        .get('/api/notes?titulo=test-eliminar')
        .set('Authorization', `Bearer ${authToken}`);
      const nota = listaRes.body.data.find(n => n.nombre === 'test-eliminar');

      // Eliminar
      const res = await request(app)
        .delete(`/api/notes/${nota.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verificar que ya no existe buscando por nombre en la lista
      const verificarRes = await request(app)
        .get('/api/notes?titulo=test-eliminar')
        .set('Authorization', `Bearer ${authToken}`);
      const notaEliminada = verificarRes.body.data.find(n => n.nombre === 'test-eliminar');
      expect(notaEliminada).toBeUndefined();
    });

    it('debe retornar 404 si la nota no existe', async () => {
      const res = await request(app)
        .delete('/api/notes/99999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 404 para ID inválido', async () => {
      const res = await request(app)
        .delete('/api/notes/abc')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('Paginación, Ordenación y Filtrado', () => {
    beforeEach(async () => {
      // Crear varias notas de prueba con categorías
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-alpha', contenido: '#categoria: trabajo\nContenido de alpha' });
      
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-beta', contenido: '#categoria: personal\nContenido de beta con palabra especial' });
      
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-gamma', contenido: '#categoria: trabajo\nContenido de gamma' });
    });

    describe('Paginación', () => {
      it('debe incluir información de paginación en la respuesta', async () => {
        const res = await request(app)
          .get('/api/notes')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.pagination).toBeDefined();
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.pagination.totalItems).toBeGreaterThanOrEqual(3);
        expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(1);
      });

      it('debe paginar correctamente con límite', async () => {
        const res = await request(app)
          .get('/api/notes?limite=2&pagina=1')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.count).toBeLessThanOrEqual(2);
        expect(res.body.pagination.limit).toBe(2);
      });

      it('debe navegar a página específica', async () => {
        const res = await request(app)
          .get('/api/notes?limite=2&pagina=2')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(2);
      });
    });

    describe('Ordenación', () => {
      it('debe ordenar por nombre ascendente', async () => {
        const res = await request(app)
          .get('/api/notes?ordenarPor=nombre&orden=asc')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.sort.field).toBe('nombre');
        expect(res.body.sort.order).toBe('asc');
        
        // Verificar que las notas test están ordenadas alfabéticamente
        const testNotas = res.body.data.filter(n => n.nombre.startsWith('test-'));
        if (testNotas.length >= 2) {
          expect(testNotas[0].nombre.localeCompare(testNotas[1].nombre)).toBeLessThanOrEqual(0);
        }
      });

      it('debe ordenar por nombre descendente', async () => {
        const res = await request(app)
          .get('/api/notes?ordenarPor=nombre&orden=desc')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.sort.order).toBe('desc');
      });

      it('debe ordenar por fecha de modificación', async () => {
        const res = await request(app)
          .get('/api/notes?ordenarPor=fechaModificacion&orden=desc')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.sort.field).toBe('fechaModificacion');
      });

      it('debe ordenar por tamaño', async () => {
        const res = await request(app)
          .get('/api/notes?ordenarPor=tamaño&orden=asc')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.sort.field).toBe('tamaño');
      });
    });

    describe('Filtrado', () => {
      it('debe filtrar por texto en título', async () => {
        const res = await request(app)
          .get('/api/notes?titulo=alpha')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.every(n => n.nombre.includes('alpha'))).toBe(true);
        expect(res.body.filters).toBeDefined();
        expect(res.body.filters.titulo).toBe('alpha');
      });

      it('debe filtrar por texto en contenido', async () => {
        const res = await request(app)
          .get('/api/notes?contenido=especial')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.data.some(n => n.nombre === 'test-beta')).toBe(true);
      });

      it('debe filtrar por categoría', async () => {
        const res = await request(app)
          .get('/api/notes?categoria=trabajo')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.every(n => n.categoria === 'trabajo')).toBe(true);
      });

      it('debe retornar vacío si no hay coincidencias', async () => {
        const res = await request(app)
          .get('/api/notes?titulo=inexistente12345')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(0);
        expect(res.body.pagination.totalItems).toBe(0);
      });
    });

    describe('Combinación de filtros', () => {
      it('debe combinar filtro y ordenación', async () => {
        const res = await request(app)
          .get('/api/notes?categoria=trabajo&ordenarPor=nombre&orden=desc')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.sort.order).toBe('desc');
        expect(res.body.data.every(n => n.categoria === 'trabajo')).toBe(true);
      });

      it('debe combinar filtro, ordenación y paginación', async () => {
        const res = await request(app)
          .get('/api/notes?titulo=test&ordenarPor=nombre&orden=asc&limite=2&pagina=1')
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.pagination.limit).toBe(2);
        expect(res.body.count).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('GET /api/notes/categories', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-cat1', contenido: '#categoria: trabajo\nContenido' });
      
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-cat2', contenido: '#categoria: personal\nContenido' });
    });

    it('debe listar categorías únicas', async () => {
      const res = await request(app)
        .get('/api/notes/categories')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data).toContain('trabajo');
      expect(res.body.data).toContain('personal');
    });
  });

  describe('Metadatos de notas', () => {
    it('debe incluir metadatos en la respuesta de listado', async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-meta', contenido: 'Contenido de prueba' });

      // Usar filtro por título para encontrar la nota específica
      const res = await request(app)
        .get('/api/notes?titulo=test-meta')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      const nota = res.body.data.find(n => n.nombre === 'test-meta');
      expect(nota).toBeDefined();
      expect(nota.tamaño).toBeDefined();
      expect(nota.fechaCreacion).toBeDefined();
      expect(nota.fechaModificacion).toBeDefined();
    });
  });

  describe('Rutas no encontradas', () => {
    it('debe retornar 404 para rutas inexistentes', async () => {
      const res = await request(app).get('/api/ruta-inexistente');
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Importación de notas', () => {
    it('debe importar un archivo .note correctamente', async () => {
      const contenido = 'Contenido de nota importada';
      const buffer = Buffer.from(contenido, 'utf8');

      const res = await request(app)
        .post('/api/notes/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', buffer, 'test-importada.note');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.exitosos).toBe(1);
      expect(res.body.data.fallidos).toBe(0);

      // Verificar que se creó el archivo
      const archivoExiste = fs.existsSync(path.join(NOTES_DIR, 'test-importada.note'));
      expect(archivoExiste).toBe(true);
    });

    it('debe importar múltiples archivos .note', async () => {
      const res = await request(app)
        .post('/api/notes/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', Buffer.from('Contenido 1'), 'test-import1.note')
        .attach('files', Buffer.from('Contenido 2'), 'test-import2.note')
        .attach('files', Buffer.from('Contenido 3'), 'test-import3.note');

      expect(res.status).toBe(201);
      expect(res.body.data.exitosos).toBe(3);
      expect(res.body.data.total).toBe(3);
    });

    it('debe rechazar archivos sin extensión .note', async () => {
      const res = await request(app)
        .post('/api/notes/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', Buffer.from('Contenido'), 'archivo.txt');

      expect(res.status).toBe(500); // Multer rechaza el archivo
    });

    it('debe retornar error si no se envían archivos', async () => {
      const res = await request(app)
        .post('/api/notes/import')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debe rechazar sobrescritura por defecto', async () => {
      // Crear nota existente
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-existente', contenido: 'Contenido original' });

      // Intentar importar con el mismo nombre
      const res = await request(app)
        .post('/api/notes/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', Buffer.from('Nuevo contenido'), 'test-existente.note');

      expect(res.status).toBe(400);
      expect(res.body.data.fallidos).toBe(1);
      expect(res.body.data.resultados[0].existente).toBe(true);
    });

    it('debe permitir sobrescritura con parámetro', async () => {
      // Crear nota existente
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-sobreesc', contenido: 'Contenido original' });

      // Importar con sobrescritura
      const res = await request(app)
        .post('/api/notes/import?sobrescribir=true')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', Buffer.from('Contenido nuevo'), 'test-sobreesc.note');

      expect(res.status).toBe(201);
      expect(res.body.data.exitosos).toBe(1);

      // Verificar contenido actualizado
      const contenido = fs.readFileSync(path.join(NOTES_DIR, 'test-sobreesc.note'), 'utf8');
      expect(contenido).toBe('Contenido nuevo');
    });
  });

  describe('Exportación de notas', () => {
    beforeEach(async () => {
      // Crear notas de prueba para exportar
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-export1', contenido: '#categoria: trabajo\nContenido 1' });
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-export2', contenido: '#categoria: personal\nContenido 2' });
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-export3', contenido: '#categoria: trabajo\nContenido 3' });
    });

    it('debe exportar todas las notas como ZIP', async () => {
      const res = await request(app)
        .get('/api/notes/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/zip');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('.zip');
    });

    it('debe exportar notas por IDs específicos', async () => {
      // Obtener IDs de notas usando filtro por título
      const listRes = await request(app)
        .get('/api/notes?titulo=test-export1')
        .set('Authorization', `Bearer ${authToken}`);
      
      const nota = listRes.body.data.find(n => n.nombre === 'test-export1');

      const res = await request(app)
        .get(`/api/notes/export?ids=${nota.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/zip');
    });

    it('debe exportar notas filtradas por categoría', async () => {
      const res = await request(app)
        .get('/api/notes/export?categoria=trabajo')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/zip');
    });

    it('debe exportar notas filtradas por texto en título', async () => {
      const res = await request(app)
        .get('/api/notes/export?titulo=export1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/zip');
    });

    it('debe retornar 404 si no hay notas para exportar', async () => {
      const res = await request(app)
        .get('/api/notes/export?categoria=inexistente')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 400 con IDs inválidos', async () => {
      const res = await request(app)
        .get('/api/notes/export?ids=abc,xyz')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('Exportación de nota individual', () => {
    it('debe exportar una nota individual como archivo .note', async () => {
      await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'test-single-export', contenido: 'Contenido para exportar' });

      // Usar filtro por título para encontrar la nota
      const listRes = await request(app)
        .get('/api/notes?titulo=test-single-export')
        .set('Authorization', `Bearer ${authToken}`);
      
      const nota = listRes.body.data.find(n => n.nombre === 'test-single-export');

      const res = await request(app)
        .get(`/api/notes/export/${nota.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('test-single-export.note');
      expect(res.text).toBe('Contenido para exportar');
    });

    it('debe retornar 404 para nota inexistente', async () => {
      const res = await request(app)
        .get('/api/notes/export/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('debe retornar 404 para ID inválido', async () => {
      const res = await request(app)
        .get('/api/notes/export/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
