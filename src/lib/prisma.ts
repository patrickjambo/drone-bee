import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please add it to your Vercel environment variables or .env file"
    );
  }

  try {
    const pool = new Pool({ connectionString: url });
    // @ts-ignore - Neon adapter type issue
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } catch (e) {
    console.error("Failed to create Prisma with Neon adapter:", e);
    throw e;
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
