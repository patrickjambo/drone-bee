const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { createId } = require('@paralleldrive/cuid2');

const DATABASE_URL = "postgresql://neondb_owner:npg_SjILsR70YEMl@ep-dark-tree-a8iaz1t8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

async function createTestManager() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    // Create a test manager
    const managerId = createId();
    const testPassword = 'TestManager@123';
    const passwordHash = await bcrypt.hash(testPassword, 12);
    
    // Check if test manager exists
    const existing = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      ['test_manager']
    );
    
    if (existing.rows.length > 0) {
      console.log('Test manager already exists');
      // Update password
      await pool.query(
        'UPDATE "User" SET password_hash = $1, role = $2 WHERE id = $3',
        [passwordHash, 'MANAGER', existing.rows[0].id]
      );
      console.log('Updated existing test manager');
    } else {
      // Create new manager
      await pool.query(
        'INSERT INTO "User" (id, full_name, username, email, password_hash, role, is_blocked, is_deleted, shift_start, shift_end, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [managerId, 'Test Manager', 'test_manager', 'test@example.com', passwordHash, 'MANAGER', false, false, '08:00', '17:00', '1234567890']
      );
      console.log('Created new test manager');
    }
    
    console.log('\n✓ Test Manager Credentials:');
    console.log('Username: test_manager');
    console.log('Password: TestManager@123');
    console.log('\nUse these to test manager login on:');
    console.log('https://drone-bee.vercel.app/manager/login');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createTestManager();
