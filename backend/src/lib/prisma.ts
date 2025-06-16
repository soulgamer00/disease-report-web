// backend/src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Global variable to store PrismaClient instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// ============================================
// PRISMA CLIENT CONFIGURATION
// ============================================

const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    // Logging configuration based on environment
    log: config.server.nodeEnv === 'development' 
      ? ['query', 'error', 'warn', 'info'] 
      : ['error', 'warn'],
    
    // Database connection configuration
    datasources: {
      db: {
        url: config.database.url,
      },
    },

    // ============================================
    // CONNECTION POOLING CONFIGURATION
    // ============================================
    // Note: Connection pooling is handled at the database URL level for PostgreSQL
    // Format: postgresql://user:password@host:port/db?connection_limit=10&pool_timeout=20
    // But we can also configure transaction timeouts and other options here
    
    // Error formatting for better debugging
    errorFormat: config.server.nodeEnv === 'development' ? 'pretty' : 'minimal',
    
    // Transaction options
    transactionOptions: {
      maxWait: 10000,        // Maximum time to wait for a transaction slot (10s)
      timeout: 30000,        // Maximum time for a transaction to complete (30s)
      isolationLevel: 'ReadCommitted', // Transaction isolation level
    },
  });
};

// ============================================
// SINGLETON PATTERN IMPLEMENTATION
// ============================================

// Singleton pattern - reuse existing client in development to avoid connection issues
const prisma = globalThis.__prisma ?? createPrismaClient();

// In development, store the client globally to prevent multiple instances
// This prevents "too many connections" errors during hot reload
if (config.server.nodeEnv === 'development') {
  globalThis.__prisma = prisma;
}

// ============================================
// CONNECTION HEALTH CHECK
// ============================================

/**
 * Check if Prisma connection is healthy
 * @returns Promise<boolean> - true if connection is healthy
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

/**
 * Get database connection info
 * @returns Promise<object> - Connection statistics
 */
export const getDatabaseInfo = async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as version,
        now() as current_time
    ` as Array<{
      database_name: string;
      current_user: string; 
      version: string;
      current_time: Date;
    }>;

    return result[0];
  } catch (error) {
    console.error('Failed to get database info:', error);
    return null;
  }
};

// ============================================
// GRACEFUL SHUTDOWN HANDLING
// ============================================

/**
 * Gracefully disconnect from database
 */
const gracefulShutdown = async (): Promise<void> => {
  try {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error during database disconnection:', error);
    process.exit(1);
  }
};

// ============================================
// PROCESS EVENT HANDLERS
// ============================================

// Handle graceful shutdown on various process signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT (Ctrl+C)');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM');
  await gracefulShutdown();
  process.exit(0);
});

process.on('beforeExit', async () => {
  console.log('🔄 Process about to exit');
  await gracefulShutdown();
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught Exception:', error);
  await gracefulShutdown();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  await gracefulShutdown();
  process.exit(1);
});

// ============================================
// CONNECTION MONITORING
// ============================================

/**
 * Monitor database connection and log statistics
 */
export const startConnectionMonitoring = () => {
  if (config.server.nodeEnv === 'development') {
    // Log connection status every 30 seconds in development
    const interval = setInterval(async () => {
      const isHealthy = await checkDatabaseConnection();
      if (!isHealthy) {
        console.warn('⚠️  Database connection appears to be unhealthy');
      }
    }, 30000);

    // Clear interval on shutdown
    process.on('SIGINT', () => clearInterval(interval));
    process.on('SIGTERM', () => clearInterval(interval));
  }
};

// ============================================
// EXPORTS
// ============================================

export { prisma };
export default prisma;

// Auto-start connection monitoring
if (config.server.nodeEnv === 'development') {
  startConnectionMonitoring();
}