import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/database.js';
import { Producto } from '../src/models/index.js';
import { uploadImage } from '../src/config/cloudinary.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de archivos de imagen a nombres de productos
const imageMap = {
  'barra-gallega-1-300x325.png': 'Barra Campesina',
  'panvillo-tradicional-1-300x325.png': 'Panvillo Tradicional',
  'barra-parisienne-1-300x325.png': 'Barra Parisienne',
  'mollete-de-polvillo-300x325.png': 'Mollete Clásico',
  'baguette-tradicional-1-300x325.png': 'Baguette Tradicional',
  'croissant-curvo-margarina-1-300x325.png': 'Croissant de Mantequilla',
  'Palmera-choco-300x325.png': 'Palmera de Chocolate',
  'napolitana-de-chocolate-1-1-300x325.png': 'Napolitana',
  'atun-aceite-oliva.jfif': 'Atún en Aceite de Oliva',
  'tomate-frito.jpg': 'Tomate Frito Casero',
  'aove.png': 'Aceite de Oliva Virgen Extra',
  'vinagre-jerez-reserva-ybarra-500ml.jpg': 'Vinagre de Jerez',
  'jamon-gran-reserva-cortado-sin-aditivos-jamon-pasion.jpg': 'Jamón Serrano Loncheado',
  'chorizo.jpg': 'Chorizo Ibérico',
  'agua.jpg': 'Agua Mineral Natural',
  'vino-tinto.jpg': 'Vino Tinto Crianza',
  'arroz-sos.jpg': 'Arroz Extra',
  'espaguetti.jpg': 'Pasta Espaguetis',
  'sal.jpg': 'Sal Marina'
};

const uploadImagesToCloudinary = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    console.log('✅ Conectado a MongoDB\n');

    // Verificar credenciales de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Error: Credenciales de Cloudinary no configuradas en .env');
      console.log('\nAgrega estas variables a tu archivo .env:');
      console.log('CLOUDINARY_CLOUD_NAME=tu_cloud_name');
      console.log('CLOUDINARY_API_KEY=tu_api_key');
      console.log('CLOUDINARY_API_SECRET=tu_api_secret\n');
      process.exit(1);
    }

    const uploadsDir = path.join(__dirname, '../uploads');
    
    console.log('📸 Iniciando subida de imágenes a Cloudinary...\n');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Procesar cada imagen
    for (const [filename, productName] of Object.entries(imageMap)) {
      const imagePath = path.join(uploadsDir, filename);

      try {
        // Verificar que el archivo existe
        await fs.access(imagePath);

        // Buscar el producto en la base de datos
        const producto = await Producto.findOne({ nombre: productName });

        if (!producto) {
          console.log(`⚠️  Producto no encontrado: ${productName}`);
          skippedCount++;
          continue;
        }

        // Verificar si ya tiene imagen de Cloudinary
        if (producto.imagen_public_id) {
          console.log(`⏭️  ${productName} - Ya tiene imagen en Cloudinary (saltando)`);
          skippedCount++;
          continue;
        }

        console.log(`📤 Subiendo: ${filename} → ${productName}`);

        // Subir imagen a Cloudinary
        const result = await uploadImage(imagePath, 'panaderia/productos');

        // Actualizar producto en la base de datos
        producto.imagen_url = result.url;
        producto.imagen_public_id = result.publicId;
        await producto.save();

        console.log(`   ✅ URL: ${result.url.substring(0, 60)}...`);
        console.log(`   🆔 Public ID: ${result.publicId}\n`);

        successCount++;

      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`❌ Archivo no encontrado: ${filename}\n`);
        } else {
          console.log(`❌ Error al subir ${filename}:`, error.message, '\n');
        }
        errorCount++;
      }
    }

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE LA SUBIDA');
    console.log('='.repeat(60));
    console.log(`✅ Exitosas:     ${successCount}`);
    console.log(`⏭️  Saltadas:      ${skippedCount}`);
    console.log(`❌ Errores:      ${errorCount}`);
    console.log(`📁 Total:        ${Object.keys(imageMap).length}`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log('🎉 ¡Imágenes subidas exitosamente a Cloudinary!');
      console.log('💡 Las URLs ya están guardadas en la base de datos.\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error general:', error);
    process.exit(1);
  }
};

// Ejecutar
uploadImagesToCloudinary();
