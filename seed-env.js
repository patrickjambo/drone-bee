require('dotenv').config();
require('child_process').execSync('tsx prisma/seed.ts', { stdio: 'inherit', env: process.env });
