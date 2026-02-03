import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/database.js';
import { Usuario, Categoria, Producto } from '../src/models/index.js';

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Limpiando base de datos...');
    
    // Limpiar BD
    await Promise.all([
      Usuario.deleteMany({}),
      Categoria.deleteMany({}),
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

    // Categorías basadas en Polvillo
    console.log('📁 Creando categorías...');
    const categorias = await Categoria.create([
      { nombre: 'Tradicionales', descripcion: 'Pan tradicional artesanal', orden: 1 },
      { nombre: 'Barras y Andaluzas', descripcion: 'Barras y vienas andaluzas', orden: 2 },
      { nombre: 'Panes de Salud', descripcion: 'Pan con cereales y semillas', orden: 3 },
      { nombre: 'Integrales 100%', descripcion: 'Panes integrales', orden: 4 },
      { nombre: 'Molletes', descripcion: 'Molletes tradicionales', orden: 5 },
      { nombre: 'Baguettes', descripcion: 'Baguettes y derivados', orden: 6 }
    ]);

    console.log('✅ Categorías creadas');

    // Productos reales de Polvillo
    console.log('🍞 Creando productos Polvillo...');
    const productos = await Producto.create([
      // TRADICIONALES
      {
        nombre: 'Barra Campesina',
        descripcion: 'Pan tradicional de corteza crujiente y miga esponjosa',
        precio: 1.20,
        imagen_url: '/images/barra-campesina.jpg',
        categoria: categorias[0]._id,
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
        categoria: categorias[0]._id,
        peso: 500,
        ingredientes: 'Harina de trigo, agua, sal, levadura',
        alergenos: ['gluten']
      },
      {
        nombre: 'Rombo Restaurante',
        descripcion: 'Pan ideal para restaurantes',
        precio: 0.90,
        imagen_url: '/images/rombo.jpg',
        categoria: categorias[0]._id,
        peso: 150,
        alergenos: ['gluten']
      },

      // BARRAS Y ANDALUZAS
      {
        nombre: 'Barra Parisienne',
        descripcion: 'Barra al estilo parisino',
        precio: 0.85,
        imagen_url: '/images/barra-parisienne.jpg',
        categoria: categorias[1]._id,
        peso: 180,
        alergenos: ['gluten'],
        destacado: true
      },
      {
        nombre: 'Viena Andaluza',
        descripcion: 'Tradicional viena andaluza',
        precio: 0.75,
        imagen_url: '/images/viena-andaluza.jpg',
        categoria: categorias[1]._id,
        peso: 200,
        alergenos: ['gluten']
      },
      {
        nombre: 'Barra Gourmet',
        descripcion: 'Barra premium de masa madre',
        precio: 1.50,
        imagen_url: '/images/barra-gourmet.jpg',
        categoria: categorias[1]._id,
        peso: 300,
        alergenos: ['gluten'],
        destacado: true
      },

      // PANES DE SALUD
      {
        nombre: 'Chapata 5 Cereales',
        descripcion: 'Pan con 5 cereales diferentes',
        precio: 2.30,
        imagen_url: '/images/chapata-5cereales.jpg',
        categoria: categorias[2]._id,
        peso: 400,
        ingredientes: 'Trigo, centeno, avena, cebada, maíz, agua, sal, levadura',
        alergenos: ['gluten'],
        destacado: true
      },
      {
        nombre: 'Panvillo Quinoa',
        descripcion: 'Pan artesanal con quinoa',
        precio: 2.80,
        imagen_url: '/images/panvillo-quinoa.jpg',
        categoria: categorias[2]._id,
        peso: 500,
        alergenos: ['gluten']
      },
      {
        nombre: 'Panvillo Lino',
        descripcion: 'Pan con semillas de lino',
        precio: 2.50,
        imagen_url: '/images/panvillo-lino.jpg',
        categoria: categorias[2]._id,
        peso: 500,
        alergenos: ['gluten', 'semillas de lino']
      },
      {
        nombre: 'Panvillo Pasas y Nueces',
        descripcion: 'Pan con pasas y nueces',
        precio: 3.20,
        imagen_url: '/images/panvillo-pasas-nueces.jpg',
        categoria: categorias[2]._id,
        peso: 500,
        alergenos: ['gluten', 'frutos secos']
      },

      // INTEGRALES 100%
      {
        nombre: 'Mollete Integral 100%',
        descripcion: 'Mollete 100% integral',
        precio: 1.80,
        imagen_url: '/images/mollete-integral.jpg',
        categoria: categorias[3]._id,
        peso: 300,
        alergenos: ['gluten']
      },
      {
        nombre: 'Hogaza Integral',
        descripcion: 'Hogaza 100% integral',
        precio: 3.50,
        imagen_url: '/images/hogaza-integral.jpg',
        categoria: categorias[3]._id,
        peso: 800,
        alergenos: ['gluten'],
        destacado: true
      },
      {
        nombre: 'Romanito Integral',
        descripcion: 'Pan romano integral',
        precio: 1.20,
        imagen_url: '/images/romanito-integral.jpg',
        categoria: categorias[3]._id,
        peso: 200,
        alergenos: ['gluten']
      },

      // MOLLETES
      {
        nombre: 'Mollete Clásico',
        descripcion: 'El auténtico mollete andaluz',
        precio: 0.60,
        imagen_url: '/images/mollete-clasico.jpg',
        categoria: categorias[4]._id,
        peso: 100,
        alergenos: ['gluten'],
        destacado: true
      },
      {
        nombre: 'Mollete Campero',
        descripcion: 'Mollete de masa campera',
        precio: 0.70,
        imagen_url: '/images/mollete-campero.jpg',
        categoria: categorias[4]._id,
        peso: 120,
        alergenos: ['gluten']
      },

      // BAGUETTES
      {
        nombre: 'Baguette',
        descripcion: 'Baguette tradicional francesa',
        precio: 1.10,
        imagen_url: '/images/baguette.jpg',
        categoria: categorias[5]._id,
        peso: 250,
        alergenos: ['gluten'],
        destacado: true
      },
      {
        nombre: 'Baguettina',
        descripcion: 'Baguette pequeña',
        precio: 0.65,
        imagen_url: '/images/baguettina.jpg',
        categoria: categorias[5]._id,
        peso: 125,
        alergenos: ['gluten']
      },
      {
        nombre: 'Bastón Rústico',
        descripcion: 'Baguette rústica de masa madre',
        precio: 1.80,
        imagen_url: '/images/baston-rustico.jpg',
        categoria: categorias[5]._id,
        peso: 350,
        alergenos: ['gluten']
      }
    ]);

    console.log('✅ Productos Polvillo creados');
    console.log(`\n🎉 Seeds completados!\n`);
    console.log('📧 Credenciales:');
    console.log('   Admin: admin@panaderia.com / admin123');
    console.log('   Cliente: cliente@test.com / test123');
    console.log(`\n📊 Resumen:`);
    console.log(`   ${usuarios.length} usuarios`);
    console.log(`   ${categorias.length} categorías`);
    console.log(`   ${productos.length} productos\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();
