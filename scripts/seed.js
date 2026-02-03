import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/database.js';
import { Usuario, Producto } from '../src/models/index.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Limpiando base de datos...');
    
    // Limpiar BD
    await Promise.all([
      Usuario.deleteMany({}),
      Producto.deleteMany({})
    ]);

    console.log('✅ Base de datos limpiada');

    // Usuarios
    console.log('👥 Creando usuarios...');
    const usuarios = await Usuario.create([
      {
        nombre: 'Administrador',
        email: 'admin@panaderia.com',
        password: 'admin123',
        rol: 'admin',
        telefono: '666111222'
      },
      {
        nombre: 'Cliente Test',
        email: 'cliente@test.com',
        password: 'test123',
        rol: 'customer',
        telefono: '666333444'
      }
    ]);

    console.log('✅ Usuarios creados');

    // Productos con nuevas categorías enum
    console.log('🍞 Creando productos...');
    const productos = await Producto.create([
      // PANADERÍA
      {
        nombre: 'Barra Campesina',
        descripcion: 'Pan tradicional de corteza crujiente y miga esponjosa',
        precio: 1.20,
        imagen_url: '/images/barra-campesina.jpg',
        categoria: 'Panadería',
        peso: 250,
        ingredientes: 'Harina de trigo, agua, sal, levadura',
        alergenos: ['gluten'],
        destacado: true
      },
      {
        nombre: 'Panvillo Tradicional',
        descripcion: 'Pan artesanal de elaboración tradicional',
        precio: 2.10,
        imagen_url: '/images/panvillo-tradicional.jpg',
        categoria: 'Panadería',
        peso: 500,
        ingredientes: 'Harina de trigo, agua, sal, levadura',
        alergenos: ['gluten']
      },
      {
        nombre: 'Barra Parisienne',
        descripcion: 'Barra al estilo parisino',
        precio: 0.85,
        imagen_url: '/images/barra-parisienne.jpg',
        categoria: 'Panadería',
        peso: 180,
        alergenos: ['gluten'],
        destacado: true
      },
      {
        nombre: 'Mollete Clásico',
        descripcion: 'El auténtico mollete andaluz',
        precio: 0.60,
        imagen_url: '/images/mollete-clasico.jpg',
        categoria: 'Panadería',
        peso: 100,
        alergenos: ['gluten'],
        destacado: true
      },
      {
        nombre: 'Baguette Tradicional',
        descripcion: 'Baguette francesa tradicional',
        precio: 1.10,
        imagen_url: '/images/baguette.jpg',
        categoria: 'Panadería',
        peso: 250,
        alergenos: ['gluten']
      },

      // DULCES
      {
        nombre: 'Croissant de Mantequilla',
        descripcion: 'Croissant artesanal con mantequilla',
        precio: 1.80,
        imagen_url: '/images/croissant.jpg',
        categoria: 'Dulces',
        peso: 80,
        ingredientes: 'Harina, mantequilla, azúcar, levadura',
        alergenos: ['gluten', 'lácteos'],
        destacado: true
      },
      {
        nombre: 'Palmera de Chocolate',
        descripcion: 'Palmera de hojaldre con chocolate',
        precio: 1.50,
        imagen_url: '/images/palmera-chocolate.jpg',
        categoria: 'Dulces',
        peso: 100,
        alergenos: ['gluten', 'lácteos']
      },
      {
        nombre: 'Napolitana',
        descripcion: 'Napolitana de chocolate',
        precio: 1.40,
        imagen_url: '/images/napolitana.jpg',
        categoria: 'Dulces',
        peso: 90,
        alergenos: ['gluten', 'lácteos']
      },

      // CONSERVAS Y ENLATADOS
      {
        nombre: 'Atún en Aceite de Oliva',
        descripcion: 'Lata de atún en aceite de oliva virgen extra',
        precio: 2.50,
        imagen_url: '/images/atun.jpg',
        categoria: 'Conservas y Enlatados',
        peso: 150,
        ingredientes: 'Atún, aceite de oliva, sal',
        alergenos: ['pescado']
      },
      {
        nombre: 'Tomate Frito Casero',
        descripcion: 'Tomate frito casero en conserva',
        precio: 1.80,
        imagen_url: '/images/tomate-frito.jpg',
        categoria: 'Conservas y Enlatados',
        peso: 400,
        ingredientes: 'Tomate, aceite de oliva, sal, azúcar'
      },

      // ACEITES, VINAGRES Y SALSAS
      {
        nombre: 'Aceite de Oliva Virgen Extra',
        descripcion: 'Aceite de oliva virgen extra primera prensada',
        precio: 8.50,
        imagen_url: '/images/aceite-oliva.jpg',
        categoria: 'Aceites, Vinagres y Salsas',
        peso: 750,
        destacado: true
      },
      {
        nombre: 'Vinagre de Jerez',
        descripcion: 'Vinagre de Jerez con denominación de origen',
        precio: 3.50,
        imagen_url: '/images/vinagre-jerez.jpg',
        categoria: 'Aceites, Vinagres y Salsas',
        peso: 500
      },

      // CHARCUTERÍA
      {
        nombre: 'Jamón Serrano Loncheado',
        descripcion: 'Jamón serrano loncheado al vacío',
        precio: 4.50,
        imagen_url: '/images/jamon-serrano.jpg',
        categoria: 'Charcutería',
        peso: 100,
        ingredientes: 'Jamón de cerdo, sal'
      },
      {
        nombre: 'Chorizo Ibérico',
        descripcion: 'Chorizo ibérico de bellota',
        precio: 6.80,
        imagen_url: '/images/chorizo.jpg',
        categoria: 'Charcutería',
        peso: 200,
        ingredientes: 'Carne de cerdo ibérico, pimentón, sal, ajo',
        destacado: true
      },

      // BEBIDAS Y BODEGA
      {
        nombre: 'Agua Mineral Natural',
        descripcion: 'Agua mineral natural 1.5L',
        precio: 0.80,
        imagen_url: '/images/agua.jpg',
        categoria: 'Bebidas y Bodega',
        peso: 1500
      },
      {
        nombre: 'Vino Tinto Crianza',
        descripcion: 'Vino tinto crianza D.O. Rioja',
        precio: 8.90,
        imagen_url: '/images/vino-tinto.jpg',
        categoria: 'Bebidas y Bodega',
        peso: 750,
        destacado: true
      },

      // DESPENSA Y BÁSICOS
      {
        nombre: 'Arroz Extra',
        descripcion: 'Arroz redondo de grano extra',
        precio: 2.20,
        imagen_url: '/images/arroz.jpg',
        categoria: 'Despensa y básicos',
        peso: 1000
      },
      {
        nombre: 'Pasta Espaguetis',
        descripcion: 'Espaguetis nº5 de sémola de trigo duro',
        precio: 1.50,
        imagen_url: '/images/espaguetis.jpg',
        categoria: 'Despensa y básicos',
        peso: 500,
        alergenos: ['gluten']
      },
      {
        nombre: 'Sal Marina',
        descripcion: 'Sal marina fina',
        precio: 0.90,
        imagen_url: '/images/sal.jpg',
        categoria: 'Despensa y básicos',
        peso: 1000
      }
    ]);

    console.log('✅ Productos creados');
    console.log(`\n🎉 Seeds completados!\n`);
    console.log('📧 Credenciales:');
    console.log('   Admin: admin@panaderia.com / admin123');
    console.log('   Cliente: cliente@test.com / test123');
    console.log(`\n📊 Resumen:`);
    console.log(`   ${usuarios.length} usuarios`);
    console.log(`   7 categorías (enum)`);
    console.log(`   ${productos.length} productos\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();
