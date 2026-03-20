const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { createId } = require('@paralleldrive/cuid2');

const DATABASE_URL = "postgresql://neondb_owner:npg_SjILsR70YEMl@ep-dark-tree-a8iaz1t8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

async function updateAdmin() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash('drone456', 12);
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      ['Jambo Patrick']
    );
    
    if (existingUser.rows.length > 0) {
      // Update existing user
      const userId = existingUser.rows[0].id;
      await pool.query(
        'UPDATE "User" SET password_hash = $1, full_name = $2, role = $3, is_blocked = false, is_deleted = false WHERE id = $4',
        [passwordHash, 'Jambo Patrick', 'SUPERADMIN', userId]
      );
      console.log('✓ Updated existing user: Jambo Patrick');
    } else {
      // Create new user with generated CUID
      const newId = createId();
      await pool.query(
        'INSERT INTO "User" (id, full_name, username, email, password_hash, role, is_blocked, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [newId, 'Jambo Patrick', 'Jambo Patrick', 'jambopatrick456@gmail.com', passwordHash, 'SUPERADMIN', false, false]
      );
      console.log('✓ Created new user: Jambo Patrick');
    }
    
    console.log('Login credentials:');
    console.log('Username: Jambo Patrick');
    console.log('Password: drone456');
    
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await pool.end();
  }
}

updateAdmin();
