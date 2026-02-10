/**
 * Tests de Cloudinary
 * Prueba: Subida, eliminación y optimización de imágenes
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImage, deleteImage, getOptimizedImageUrl } from '../src/config/cloudinary.js';

// Mock de cloudinary
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(),
      destroy: vi.fn()
    },
    url: vi.fn()
  }
}));

import { v2 as cloudinary } from 'cloudinary';

describe('Cloudinary Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('debe subir imagen correctamente', async () => {
      const mockResult = {
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: 'panaderia/test-image',
        width: 800,
        height: 600,
        format: 'jpg'
      };

      cloudinary.uploader.upload.mockResolvedValue(mockResult);

      const result = await uploadImage('/path/to/image.jpg');

      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
        width: mockResult.width,
        height: mockResult.height,
        format: mockResult.format
      });

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        '/path/to/image.jpg',
        expect.objectContaining({
          folder: 'panaderia/productos',
          resource_type: 'image'
        })
      );
    });

    it('debe usar carpeta personalizada', async () => {
      const mockResult = {
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: 'custom/test-image',
        width: 800,
        height: 600,
        format: 'jpg'
      };

      cloudinary.uploader.upload.mockResolvedValue(mockResult);

      await uploadImage('/path/to/image.jpg', 'custom/folder');

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        '/path/to/image.jpg',
        expect.objectContaining({
          folder: 'custom/folder'
        })
      );
    });

    it('debe manejar error al subir imagen', async () => {
      cloudinary.uploader.upload.mockRejectedValue(new Error('Upload failed'));

      await expect(uploadImage('/path/to/image.jpg')).rejects.toThrow('Error al subir la imagen');
    });
  });

  describe('deleteImage', () => {
    it('debe eliminar imagen correctamente', async () => {
      const mockResult = { result: 'ok' };
      cloudinary.uploader.destroy.mockResolvedValue(mockResult);

      const result = await deleteImage('panaderia/test-image');

      expect(result).toEqual(mockResult);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('panaderia/test-image');
    });

    it('debe manejar error al eliminar imagen', async () => {
      cloudinary.uploader.destroy.mockRejectedValue(new Error('Delete failed'));

      await expect(deleteImage('panaderia/test-image')).rejects.toThrow('Error al eliminar la imagen');
    });
  });

  describe('getOptimizedImageUrl', () => {
    it('debe generar URL optimizada con transformaciones por defecto', () => {
      const mockUrl = 'https://cloudinary.com/optimized/image.jpg';
      cloudinary.url.mockReturnValue(mockUrl);

      const result = getOptimizedImageUrl('panaderia/test-image');

      expect(result).toBe(mockUrl);
      expect(cloudinary.url).toHaveBeenCalledWith(
        'panaderia/test-image',
        expect.objectContaining({
          transformation: expect.arrayContaining([
            expect.objectContaining({ width: 400 }),
            expect.objectContaining({ quality: 'auto:good' }),
            expect.objectContaining({ fetch_format: 'auto' })
          ])
        })
      );
    });

    it('debe usar transformaciones personalizadas', () => {
      const mockUrl = 'https://cloudinary.com/custom/image.jpg';
      cloudinary.url.mockReturnValue(mockUrl);

      const result = getOptimizedImageUrl('panaderia/test-image', {
        width: 600,
        quality: 'auto:best'
      });

      expect(result).toBe(mockUrl);
      expect(cloudinary.url).toHaveBeenCalledWith(
        'panaderia/test-image',
        expect.objectContaining({
          transformation: expect.arrayContaining([
            expect.objectContaining({ width: 600 }),
            expect.objectContaining({ quality: 'auto:best' })
          ])
        })
      );
    });
  });
});
