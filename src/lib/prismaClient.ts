import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma || new PrismaClient();

export const prismaClient = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;