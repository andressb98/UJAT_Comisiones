import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(); // Sin argumentos, Prisma leerá DATABASE_URL solo

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;