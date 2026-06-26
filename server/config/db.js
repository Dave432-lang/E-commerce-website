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

// Run migration to add shipping_address and payment_method to orders if not exists
const runMigrations = async () => {
  try {
    // 1. Migrate orders table if needed
    const columns = await query("SHOW COLUMNS FROM orders LIKE 'shipping_address'");
    if (columns.length === 0) {
      await query("ALTER TABLE orders ADD COLUMN shipping_address TEXT NULL");
      await query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100) DEFAULT 'Paystack (Card/Momo)'");
      console.log('Successfully completed order table database migration (added shipping_address and payment_method columns).');
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

    // 3. Update admin user seed password hash (to standard 'admin123') if it has placeholder
    await query(`
      UPDATE users 
      SET password_hash = '$2a$10$tZ8.sM1M7l67yA.E1P3FteS.J8L2F250nZ0Uf.n2e.32l42o3FbeW' 
      WHERE email = 'admin@boutique.com' AND password_hash = 'hashed_password_placeholder'
    `);
  } catch (err) {
    console.error('Database migration error:', err);
  }
};

runMigrations();
