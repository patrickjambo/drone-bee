import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const prismaClientSingleton = () => {
  const cn = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  if (!cn) {
    if (process.env.NODE_ENV === 'development') return new PrismaClient(); // Local fallback
    throw new Error('DATABASE_URL is missing!');
  }
  const pool = new Pool({ connectionString: cn })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: { prismaGlobal: ReturnType<typeof prismaClientSingleton>; } & typeof global;
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()
export default prisma;
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
