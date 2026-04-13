import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { env } from '$env/dynamic/private';

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;