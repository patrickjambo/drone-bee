import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Starting deployment seed...');

  // Check if superadmin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'SUPERADMIN' }
  });

  if (existingAdmin) {
    console.log('Super Admin already exists. Skipping seed.');
    return;
  }

  // Pre-seed a Super Admin based on SRS Rules
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
  console.log(`IMPORTANT: Change this password immediately after first login.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
