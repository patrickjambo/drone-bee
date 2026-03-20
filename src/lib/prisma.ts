import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // For build time, return basic client without adapter
    return new PrismaClient();
  }

  try {
    // Dynamically require to avoid build-time loading
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");

    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } catch (e) {
    console.error("Failed to create PrismaClient with adapter:", e);
    // Fallback to basic client
    return new PrismaClient();
  }
}

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const client = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    return client;
  })();

export default prisma;
