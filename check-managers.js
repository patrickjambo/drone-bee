const { Pool } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_SjILsR70YEMl@ep-dark-tree-a8iaz1t8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkManagers() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    const res = await pool.query('SELECT username, is_blocked, is_deleted, role FROM "User" WHERE role = \'MANAGER\'');
    console.log('Managers:', res.rows);
  } finally {
    await pool.end();
  }
}
checkManagers();