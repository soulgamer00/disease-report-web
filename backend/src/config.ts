// backend/src/config.ts

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define configuration schema with Zod
const configSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // Authentication
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Cookie
  COOKIE_SECRET: z.string(),
  
  // Timezone
  TZ: z.string().default('Asia/Bangkok'),
});

// Parse and validate environment variables
const env = configSchema.parse({
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  TZ: process.env.TZ,
});

// Single Configuration File - All constants and settings
export const config = {
  // Server Configuration
  server: {
    port: parseInt(env.PORT, 10),
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
  },

  // Database Configuration
  database: {
    url: env.DATABASE_URL,
  },

  // JWT Configuration
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  // Cookie Configuration
  cookie: {
    secret: env.COOKIE_SECRET,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },

  // Security Configuration
  security: {
    bcryptRounds: 12,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // requests per window
  },

  // Application Constants
  constants: {
    // User Role IDs
    roleIds: {
      SUPERADMIN: 1,
      ADMIN: 2,
      USER: 3,
    } as const,

    // Pagination defaults
    pagination: {
      defaultPage: 1,
      defaultLimit: 10,
      maxLimit: 100,
    },

    // Date/Time
    timezone: env.TZ,
    dateFormat: 'YYYY-MM-DD',
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',

    // Excel Export
    excel: {
      maxRows: 10000,
      sheetName: 'Patient Visits',
    },
  },

  // CORS Configuration
  cors: {
    origin: env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
} as const;

// Export individual configs for convenience
export const { server, database, jwt, cookie, security, constants, cors } = config;