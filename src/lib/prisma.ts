import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * In serverless/dev with hot-reload, creating a new PrismaClient on
 * every request/reload can exhaust the database's connection limit.
 * Caching it on `globalThis` in development avoids that; in
 * production, each serverless function instance gets its own client,
 * which is fine since Supabase's pooled (port 6543) connection string
 * is designed for exactly this.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
