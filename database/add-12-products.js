import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const newProducts = [
  {
    name: 'Kente Patterned Silk Kimono',
    description: 'Hand-woven Kente pattern inspired silk chiffon kimono with fluid bell sleeves.',
    price: 340.00,
    sale_price: 285.00,
    rating: 4.95,
    category: 'Outerwear',
    gender: 'women',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify(['Gold', 'Black', 'Beige']),
    stock_quantity: 45,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    name: 'Gold Standard Chronograph Watch',
    description: 'Precision quartz chronograph featuring 18k gold-plated bezel and genuine leather strap.',
    price: 480.00,
    sale_price: null,
    rating: 5.00,
    category: 'Watches',
    gender: 'men',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['One Size']),
    colors: JSON.stringify(['Gold', 'Black']),
    stock_quantity: 30,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    name: 'Handcrafted Leather Tote Bag',
    description: 'Full-grain West African leather shoulder tote with brass hardware and interior zipped compartment.',
    price: 250.00,
    sale_price: 210.00,
    rating: 4.85,
    category: 'Bags',
    gender: 'women',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['One Size']),
    colors: JSON.stringify(['Brown', 'Black', 'Beige']),
    stock_quantity: 40,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    name: 'Slim-Fit Distressed Indigo Jeans',
    description: 'Premium stretch indigo denim jeans with custom whiskering and tailored taper.',
    price: 140.00,
    sale_price: null,
    rating: 4.70,
    category: 'Jeans',
    gender: 'men',
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['30', '32', '34', '36']),
    colors: JSON.stringify(['Blue', 'Black']),
    stock_quantity: 60,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    name: 'Emerald Satin Wrap Evening Gown',
    description: 'Breathtaking emerald green satin wrap gown featuring a side slit and low V-neckline.',
    price: 395.00,
    sale_price: null,
    rating: 4.98,
    category: 'Dresses',
    gender: 'women',
    image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
    colors: JSON.stringify(['Olive', 'Black']),
    stock_quantity: 25,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    name: 'Lagos Handwoven Leather Loafers',
    description: 'Intricately woven calfskin leather penny loafers with cushioned insoles.',
    price: 280.00,
    sale_price: 235.00,
    rating: 4.90,
    category: 'Shoes',
    gender: 'men',
    image_url: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['40', '41', '42', '43', '44']),
    colors: JSON.stringify(['Brown', 'Black']),
    stock_quantity: 35,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    name: 'Linen Blend Utility Cargo Pants',
    description: 'Modern relaxed utility cargo trousers crafted from breathable linen-cotton blend.',
    price: 115.00,
    sale_price: null,
    rating: 4.65,
    category: 'Trousers',
    gender: 'men',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify(['Beige', 'Olive', 'Black']),
    stock_quantity: 50,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    name: 'Cascading Ruffle Summer Blouse',
    description: 'Feminine sheer chiffon blouse with tiered cascading ruffles and tie neck.',
    price: 88.00,
    sale_price: null,
    rating: 4.75,
    category: 'Tops',
    gender: 'women',
    image_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
    colors: JSON.stringify(['White', 'Beige', 'Blue']),
    stock_quantity: 45,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    name: 'Sovereign Gold Pendant Necklace',
    description: '18k gold-filled hammered coin pendant necklace on a delicate adjustable cable chain.',
    price: 150.00,
    sale_price: null,
    rating: 4.92,
    category: 'Accessories',
    gender: 'unisex',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['One Size']),
    colors: JSON.stringify(['Gold']),
    stock_quantity: 40,
    is_featured: 1,
    is_new_arrival: 1
  },
  {
    name: 'Cashmere Blend Turtleneck Sweater',
    description: 'Ultra-luxurious cashmere blend rib-knit turtleneck sweater in rich terracotta tone.',
    price: 210.00,
    sale_price: 175.00,
    rating: 4.88,
    category: 'Knitwear',
    gender: 'women',
    image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['S', 'M', 'L']),
    colors: JSON.stringify(['Brown', 'Beige']),
    stock_quantity: 30,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    name: 'Structured Canvas & Leather Crossbody',
    description: 'Compact structured canvas camera bag featuring smooth calfskin trim and adjustable strap.',
    price: 175.00,
    sale_price: null,
    rating: 4.80,
    category: 'Bags',
    gender: 'women',
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['One Size']),
    colors: JSON.stringify(['Beige', 'Brown', 'Black']),
    stock_quantity: 35,
    is_featured: 0,
    is_new_arrival: 1
  },
  {
    name: 'Urban Oversized Denim Trucker Jacket',
    description: 'Heavyweight vintage washed black denim trucker jacket with drop shoulders.',
    price: 220.00,
    sale_price: null,
    rating: 4.90,
    category: 'Outerwear',
    gender: 'unisex',
    image_url: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    colors: JSON.stringify(['Black', 'Blue']),
    stock_quantity: 40,
    is_featured: 1,
    is_new_arrival: 1
  }
];

async function seed12Products() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_boutique',
    port: Number(process.env.DB_PORT || 3306)
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database.');

    for (const p of newProducts) {
      const sql = `
        INSERT INTO products 
        (name, description, price, sale_price, rating, category, gender, image_url, sizes, colors, stock_quantity, is_featured, is_new_arrival)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(sql, [
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.rating,
        p.category,
        p.gender,
        p.image_url,
        p.sizes,
        p.colors,
        p.stock_quantity,
        p.is_featured,
        p.is_new_arrival
      ]);
      console.log(`Inserted product: ${p.name}`);
    }

    await connection.end();
    console.log('Successfully inserted all 12 products!');
  } catch (error) {
    console.error('Error inserting 12 products:', error);
  }
}

seed12Products();
