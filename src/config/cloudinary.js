import { v2 as cloudinary } from 'cloudinary';
import { config } from './index.js';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

/**
 * Subir imagen a Cloudinary
 * @param {string} filePath - Ruta del archivo a subir
 * @param {string} folder - Carpeta en Cloudinary (default: 'panaderia')
 * @returns {Promise<Object>} - Datos de la imagen subida
 */
export const uploadImage = async (filePath, folder = 'panaderia/productos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Limitar tamaño máximo
        { quality: 'auto:good' }, // Optimizar calidad automáticamente
        { fetch_format: 'auto' } // Formato automático (webp si el navegador lo soporta)
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw new Error('Error al subir la imagen');
  }
};

/**
 * Eliminar imagen de Cloudinary
 * @param {string} publicId - Public ID de la imagen en Cloudinary
 * @returns {Promise<Object>}
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw new Error('Error al eliminar la imagen');
  }
};

/**
 * Obtener URL optimizada de imagen
 * @param {string} publicId - Public ID de la imagen
 * @param {Object} transformations - Transformaciones a aplicar
 * @returns {string} - URL optimizada
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    transformation: [
      { width: transformations.width || 400, crop: 'scale' },
      { quality: transformations.quality || 'auto:good' },
      { fetch_format: 'auto' }
    ]
  });
};

export default cloudinary;
