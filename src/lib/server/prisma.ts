import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { env } from '$env/dynamic/private';

function mustGetDbUrl() {
  const url = env.DATABASE_URL;
  if (!url || !url.trim()) {
    throw new Error('DATABASE_URL no está definido. Usa .env: DATABASE_URL="file:./dev.db"');
  }
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: mustGetDbUrl() })
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
