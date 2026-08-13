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

    // 6. Create coupons table for promotional discounts
    await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
        min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('Successfully verified coupons table exists in database.');

    // Seed default coupons if none exist
    const existingCoupons = await query('SELECT COUNT(*) as count FROM coupons');
    if (existingCoupons[0].count === 0) {
      await query(`
        INSERT INTO coupons (code, discount_percent, min_order_amount) VALUES
        ('WELCOME10', 10, 0.00),
        ('BOUTIQUE20', 20, 50.00),
        ('SAVE15', 15, 30.00)
      `);
      console.log('Successfully seeded default promo coupons (WELCOME10, BOUTIQUE20, SAVE15).');
    }

    // 7. Update admin user seed password hash (to standard 'admin123') if it has placeholder
    await query(`
      UPDATE users 
      SET password_hash = '$2a$10$tZ8.sM1M7l67yA.E1P3FteS.J8L2F250nZ0Uf.n2e.32l42o3FbeW' 
      WHERE email = 'admin@boutique.com' AND password_hash = 'hashed_password_placeholder'
    `);
  } catch (err) {
    console.error('Database migration error:', err);
  }
};

export const initDbPromise = runMigrations();
