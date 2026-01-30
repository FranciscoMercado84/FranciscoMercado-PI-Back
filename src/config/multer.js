/**
 * Configuración de Multer para subida de archivos
 */

import multer from 'multer';

// Configuración de almacenamiento en memoria
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

export default { uploadNotes };
