/**
 * Configuración de Multer para subida de archivos
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento en disco para imágenes
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp')); // Carpeta temporal
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para imágenes
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Configuración para subida de imágenes de productos
export const uploadProductImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: imageFilter
});

// Configuración de almacenamiento en memoria para notas
const storage = multer.memoryStorage();

// Configuración de multer para archivos .note
export const uploadNotes = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    files: 50, // Máximo 50 archivos a la vez
  },
  fileFilter: (req, file, cb) => {
    // Solo aceptar archivos .note
    if (file.originalname.endsWith('.note')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos con extensión .note'), false);
    }
  },
});

export default { uploadNotes, uploadProductImage };
