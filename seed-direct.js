require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const bcrypt = require('bcrypt');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in .env');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Starting deployment seed directly...');

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    });

    if (existingAdmin) {
      console.log('Super Admin already exists. Skipping seed.');
      return;
    }

    const passwordHash = await bcrypt.hash('Admin@DroneBee2026', 12);

    const superAdmin = await prisma.user.create({
      data: {
        full_name: 'System Owner',
        username: 'superadmin',
        email: 'owner@dronebee.rw',
        password_hash: passwordHash,
        role: 'SUPERADMIN',
      },
    });

    console.log(`Created Super Admin successfully!`);
    console.log(`Username: ${superAdmin.username}`);
    console.log(`Password: Admin@DroneBee2026`);
  } catch (err) {
    console.error('Seed Error:', err);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
