// backend/src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Global variable to store PrismaClient instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Create PrismaClient singleton
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: config.server.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });
};

// Singleton pattern - reuse existing client in development to avoid connection issues
const prisma = globalThis.__prisma ?? createPrismaClient();

// In development, store the client globally to prevent multiple instances
if (config.server.nodeEnv === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown handling
const gracefulShutdown = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('🔌 Prisma Client disconnected');
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

export { prisma };
export default prisma;