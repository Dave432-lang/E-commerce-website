import { query } from './config/db.js';
import bcrypt from 'bcryptjs';

const resetAdmin = async () => {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const result = await query(
      `UPDATE users SET password_hash = ? WHERE email = 'admin@boutique.com'`,
      [hash]
    );
    console.log(`✅ Admin password reset successfully. Rows updated: ${result.affectedRows}`);
    
    // Verify the user exists
    const rows = await query(`SELECT id, name, email, role FROM users WHERE email = 'admin@boutique.com'`);
    if (rows.length === 0) {
      console.log('⚠️  Admin user not found in database. Running seed insert...');
      await query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ('Admin User', 'admin@boutique.com', ?, 'admin')`,
        [hash]
      );
      console.log('✅ Admin user created.');
    } else {
      console.log('👤 Admin user:', rows[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

resetAdmin();
