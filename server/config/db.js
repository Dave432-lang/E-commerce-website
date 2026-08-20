import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to query the pool using async/await
export const query = async (sql, params) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// Run migration to add shipping_address, payment_method and payment_reference to orders if not exists
const runMigrations = async () => {
  try {
    // 1. Migrate orders table if needed
    const columns = await query("SHOW COLUMNS FROM orders LIKE 'shipping_address'");
    if (columns.length === 0) {
      await query("ALTER TABLE orders ADD COLUMN shipping_address TEXT NULL");
      await query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100) DEFAULT 'Paystack (Card/Momo)'");
      console.log('Successfully completed order table database migration (added shipping_address and payment_method columns).');
    }

    const refColumns = await query("SHOW COLUMNS FROM orders LIKE 'payment_reference'");
    if (refColumns.length === 0) {
      await query("ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255) UNIQUE NULL");
      console.log('Successfully completed order table database migration (added payment_reference column).');
    }

    // 3. Add password reset token columns to users table
    const resetCols = await query("SHOW COLUMNS FROM users LIKE 'reset_token'");
    if (resetCols.length === 0) {
      await query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL");
      await query("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL");
      console.log('Successfully completed users table migration (added reset_token columns).');
    }

    // 2. Create cart_items table for database-backed cart persistence
    await query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        selected_size VARCHAR(50) DEFAULT 'M',
        selected_color VARCHAR(50) DEFAULT 'Default',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_user_prod_size_col (user_id, product_id, selected_size, selected_color)
      ) ENGINE=InnoDB;
    `);
    console.log('Successfully verified cart_items table exists in database.');

    // 3. Create wishlists table for database-backed wishlist persistence
    await query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_user_product (user_id, product_id)
      ) ENGINE=InnoDB;
    `);
    console.log('Successfully verified wishlists table exists in database.');

    // 4. Add is_archived and stock_quantity to products table
    const archiveCols = await query("SHOW COLUMNS FROM products LIKE 'is_archived'");
    if (archiveCols.length === 0) {
      await query("ALTER TABLE products ADD COLUMN is_archived TINYINT(1) NOT NULL DEFAULT 0");
      console.log('Successfully completed products table migration (added is_archived column).');
    }

    const stockCols = await query("SHOW COLUMNS FROM products LIKE 'stock_quantity'");
    if (stockCols.length === 0) {
      await query("ALTER TABLE products ADD COLUMN stock_quantity INT NOT NULL DEFAULT 50");
      console.log('Successfully completed products table migration (added stock_quantity column).');
    }

    // 4b. Add gender, sale_price, is_featured, is_new_arrival to products
    const genderCols = await query("SHOW COLUMNS FROM products LIKE 'gender'");
    if (genderCols.length === 0) {
      await query("ALTER TABLE products ADD COLUMN gender VARCHAR(20) NULL DEFAULT 'unisex'");
      console.log('Successfully completed products table migration (added gender column).');
    }

    const salePriceCols = await query("SHOW COLUMNS FROM products LIKE 'sale_price'");
    if (salePriceCols.length === 0) {
      await query("ALTER TABLE products ADD COLUMN sale_price DECIMAL(10, 2) NULL DEFAULT NULL");
      console.log('Successfully completed products table migration (added sale_price column).');
    }

    const featCols = await query("SHOW COLUMNS FROM products LIKE 'is_featured'");
    if (featCols.length === 0) {
      await query("ALTER TABLE products ADD COLUMN is_featured TINYINT(1) DEFAULT 0");
      console.log('Successfully completed products table migration (added is_featured column).');
    }

    const newArrivalCols = await query("SHOW COLUMNS FROM products LIKE 'is_new_arrival'");
    if (newArrivalCols.length === 0) {
      await query("ALTER TABLE products ADD COLUMN is_new_arrival TINYINT(1) DEFAULT 1");
      console.log('Successfully completed products table migration (added is_new_arrival column).');
    }

    // Modify image_url column to LONGTEXT to support high-res uploaded base64 data URLs
    try {
      await query("ALTER TABLE products MODIFY COLUMN image_url LONGTEXT NOT NULL");
    } catch (e) {
      // Column modification handled
    }

    // Add indexes on products table for fast filtering
    const createIndexSafe = async (indexName, sql) => {
      try {
        await query(sql);
        console.log(`Successfully verified index ${indexName} on products table.`);
      } catch (e) {
        // Index already exists
      }
    };

    await createIndexSafe('idx_products_gender', 'CREATE INDEX idx_products_gender ON products(gender)');
    await createIndexSafe('idx_products_category', 'CREATE INDEX idx_products_category ON products(category)');
    await createIndexSafe('idx_products_is_featured', 'CREATE INDEX idx_products_is_featured ON products(is_featured)');
    await createIndexSafe('idx_products_is_new_arrival', 'CREATE INDEX idx_products_is_new_arrival ON products(is_new_arrival)');
    await createIndexSafe('idx_products_sale_price', 'CREATE INDEX idx_products_sale_price ON products(sale_price)');

    // 5. Create reviews table for customer product ratings
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Successfully verified reviews table exists in database.');

    // 6. Create & Upgrade coupons table
    await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_type VARCHAR(20) DEFAULT 'percentage',
        discount_value DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
        min_order_value DECIMAL(10, 2) DEFAULT 0.00,
        usage_limit INT NULL DEFAULT NULL,
        times_used INT DEFAULT 0,
        expires_at TIMESTAMP NULL DEFAULT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('Successfully verified coupons table exists in database.');

    // Upgrade coupons table columns if created under older schema
    const typeCol = await query("SHOW COLUMNS FROM coupons LIKE 'discount_type'");
    if (typeCol.length === 0) {
      await query("ALTER TABLE coupons ADD COLUMN discount_type VARCHAR(20) DEFAULT 'percentage'");
      await query("ALTER TABLE coupons ADD COLUMN discount_value DECIMAL(10, 2) NOT NULL DEFAULT 10.00");
      await query("ALTER TABLE coupons ADD COLUMN min_order_value DECIMAL(10, 2) DEFAULT 0.00");
      await query("ALTER TABLE coupons ADD COLUMN usage_limit INT NULL DEFAULT NULL");
      await query("ALTER TABLE coupons ADD COLUMN times_used INT DEFAULT 0");
      await query("ALTER TABLE coupons ADD COLUMN expires_at TIMESTAMP NULL DEFAULT NULL");
    }

    // Drop legacy min_order_amount if it exists
    const legacyCol = await query("SHOW COLUMNS FROM coupons LIKE 'min_order_amount'");
    if (legacyCol.length > 0) {
      try {
        await query("ALTER TABLE coupons DROP COLUMN min_order_amount");
        console.log('Dropped legacy min_order_amount column from coupons table in favor of min_order_value.');
      } catch (e) { /* ignore if constraint error */ }
    }

    // Seed default coupons if none exist
    const existingCoupons = await query('SELECT COUNT(*) as count FROM coupons');
    if (existingCoupons[0].count === 0) {
      await query(`
        INSERT INTO coupons (code, discount_type, discount_value, min_order_value) VALUES
        ('WELCOME10', 'percentage', 10.00, 0.00),
        ('BOUTIQUE20', 'percentage', 20.00, 50.00),
        ('SAVE15', 'percentage', 15.00, 30.00)
      `);
      console.log('Successfully seeded default promo coupons.');
    }

    // 7. Create delivery_fees table for configurable regional fees
    await query(`
      CREATE TABLE IF NOT EXISTS delivery_fees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        region_name VARCHAR(100) UNIQUE NOT NULL,
        fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        estimated_delivery VARCHAR(100) DEFAULT '2-3 Business Days',
        is_active TINYINT(1) DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('Successfully verified delivery_fees table exists in database.');

    const feeCount = await query('SELECT COUNT(*) as count FROM delivery_fees');
    if (feeCount[0].count === 0) {
      await query(`
        INSERT INTO delivery_fees (region_name, fee, estimated_delivery) VALUES
        ('Greater Accra', 25.00, '1-2 Business Days'),
        ('Ashanti', 35.00, '2-3 Business Days'),
        ('Central', 35.00, '2-3 Business Days'),
        ('Eastern', 35.00, '2-3 Business Days'),
        ('Western', 40.00, '3-4 Business Days'),
        ('Volta', 40.00, '3-4 Business Days'),
        ('Northern', 50.00, '4-5 Business Days'),
        ('Upper East', 50.00, '4-5 Business Days'),
        ('Upper West', 50.00, '4-5 Business Days'),
        ('Bono', 45.00, '3-4 Business Days'),
        ('Other', 40.00, '3-5 Business Days')
      `);
      console.log('Successfully seeded default regional delivery fees.');
    }
  } catch (err) {
    console.error('Database migration error:', err);
  }
};

export const initDbPromise = runMigrations();
