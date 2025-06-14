// backend/src/config/index.ts

import { z } from 'zod';
import { UserRoleEnum } from '@prisma/client';

// ============================================
// ENVIRONMENT VALIDATION SCHEMA
// ============================================

const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Timezone Configuration
  TZ: z.string().default('Asia/Bangkok'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Cookie Configuration
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
  
  // Security Configuration
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).transform(Number).default('5'),
  
  // CORS Configuration
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  ENABLE_FILE_LOGGING: z.string().transform(val => val === 'true').default('false'),
  LOG_MAX_FILE_SIZE: z.string().default('20m'),
  LOG_MAX_FILES: z.string().default('14d'),
  LOG_DIR: z.string().default('logs'),
  
  // Error Handling Configuration
  ENABLE_ERROR_DETAILS: z.string().transform(val => val === 'true').optional(),
  ERROR_STACK_TRACE: z.string().transform(val => val === 'true').optional(),
  
  // Performance Configuration
  REQUEST_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default('30000'), // 30 seconds
  MAX_REQUEST_SIZE: z.string().default('10mb'),
  
  // Cache Configuration (Redis)
  REDIS_URL: z.string().url().optional(),
  CACHE_TTL: z.string().regex(/^\d+$/).transform(Number).default('3600'), // 1 hour
  
  // Email Configuration (for notifications)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// ============================================
// APPLICATION CONSTANTS
// ============================================

export const constants = {
  // Application Information
  app: {
    name: 'Disease Report System',
    version: '1.0.0',
    description: 'ระบบรายงานโรคติดต่อ จังหวัดเพชรบูรณ์',
  },
  
  // Timezone Configuration
  timezone: 'Asia/Bangkok',
  
  // User Role IDs (must match database)
  roleIds: {
    SUPERADMIN: 1,
    ADMIN: 2,
    USER: 3,
  } as const,
  
  // User Role Names (for display)
  roleNames: {
    [UserRoleEnum.SUPERADMIN]: 'ผู้ดูแลระบบหลัก',
    [UserRoleEnum.ADMIN]: 'ผู้ดูแลระบบ',
    [UserRoleEnum.USER]: 'ผู้ใช้งาน',
  } as const,
  
  // Pagination Defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultPage: 1,
  },
  
  // File Upload Limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/pdf', // .pdf
    ],
    maxFiles: 5,
  },
  
  // Chart Colors (for consistency)
  chartColors: {
    primary: '#3B82F6',
    secondary: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#06B6D4',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1',
  },
  
  // Database Constraints
  database: {
    maxStringLength: 10000,
    idCardLength: 13,
    hospitalCodeLength: 9,
    phoneNumberMaxLength: 10,
  },
  
  // API Response Messages
  messages: {
    success: {
      created: 'สร้างข้อมูลเรียบร้อยแล้ว',
      updated: 'แก้ไขข้อมูลเรียบร้อยแล้ว',
      deleted: 'ลบข้อมูลเรียบร้อยแล้ว',
      retrieved: 'ดึงข้อมูลเรียบร้อยแล้ว',
    },
    error: {
      notFound: 'ไม่พบข้อมูลที่ต้องการ',
      unauthorized: 'กรุณาเข้าสู่ระบบ',
      forbidden: 'ไม่มีสิทธิ์ในการดำเนินการนี้',
      validation: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
      duplicate: 'ข้อมูลนี้มีอยู่ในระบบแล้ว',
      internal: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    },
  },
} as const;

// ============================================
// CONFIGURATION OBJECT
// ============================================

export const config = {
  // Server Configuration
  server: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    requestTimeout: env.REQUEST_TIMEOUT,
    maxRequestSize: env.MAX_REQUEST_SIZE,
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
    algorithm: 'HS256' as const,
  },
  
  // Cookie Configuration
  cookie: {
    secret: env.COOKIE_SECRET,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  
  // CORS Configuration
  cors: {
    origin: env.NODE_ENV === 'production' 
      ? [env.FRONTEND_URL]
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
    ],
    optionsSuccessStatus: 200,
  },
  
  // Security Configuration
  security: {
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: env.RATE_LIMIT_MAX,
    bcryptRounds: 12,
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
  },
  
  // Logging Configuration
  logging: {
    level: env.LOG_LEVEL,
    enableFile: env.ENABLE_FILE_LOGGING,
    maxFileSize: env.LOG_MAX_FILE_SIZE,
    maxFiles: env.LOG_MAX_FILES,
    logDir: env.LOG_DIR,
    enableConsole: true,
    format: env.NODE_ENV === 'production' ? 'json' : 'pretty',
  },
  
  // Error Handling Configuration
  errorHandling: {
    enableDetails: env.ENABLE_ERROR_DETAILS ?? (env.NODE_ENV === 'development'),
    enableStackTrace: env.ERROR_STACK_TRACE ?? (env.NODE_ENV === 'development'),
    logErrors: true,
    logSuspiciousActivity: true,
  },
  
  // Cache Configuration
  cache: {
    url: env.REDIS_URL,
    ttl: env.CACHE_TTL,
    keyPrefix: 'disease-report:',
    enableCache: !!env.REDIS_URL,
  },
  
  // Email Configuration
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
    enabled: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
  },
  
  // Feature Flags
  features: {
    enableRegistration: env.NODE_ENV === 'development',
    enableEmailNotifications: !!(env.SMTP_HOST && env.EMAIL_FROM),
    enableFileUpload: true,
    enableExcelExport: true,
    enableAdvancedLogging: env.NODE_ENV === 'production',
    enablePerformanceMonitoring: true,
    enableSecurityAlerts: env.NODE_ENV === 'production',
  },
  
  // Constants reference
  constants,
} as const;

// ============================================
// CONFIGURATION VALIDATION
// ============================================

// Validate configuration at startup
export const validateConfig = (): void => {
  const errors: string[] = [];
  
  // Validate JWT secrets are different
  if (config.jwt.secret === config.jwt.refreshSecret) {
    errors.push('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }
  
  // Validate timezone
  try {
    new Intl.DateTimeFormat('en', { timeZone: constants.timezone });
  } catch {
    errors.push(`Invalid timezone: ${constants.timezone}`);
  }
  
  // Validate role IDs
  const roleIds = Object.values(constants.roleIds);
  if (new Set(roleIds).size !== roleIds.length) {
    errors.push('Role IDs must be unique');
  }
  
  // Validate CORS origins in production
  if (config.server.nodeEnv === 'production') {
    if (!Array.isArray(config.cors.origin) || config.cors.origin.length === 0) {
      errors.push('CORS origins must be configured for production');
    }
  }
  
  // Validate file upload limits
  if (constants.upload.maxFileSize < 1024 * 1024) { // 1MB minimum
    errors.push('File upload size must be at least 1MB');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  console.log('✅ Configuration validated successfully');
};

// ============================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ============================================

export const isDevelopment = config.server.nodeEnv === 'development';
export const isProduction = config.server.nodeEnv === 'production';
export const isTest = config.server.nodeEnv === 'test';

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getAppInfo = () => ({
  name: constants.app.name,
  version: constants.app.version,
  description: constants.app.description,
  environment: config.server.nodeEnv,
  timezone: constants.timezone,
  nodeVersion: process.version,
  platform: process.platform,
});

export const getDatabaseInfo = () => ({
  url: config.database.url.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
  timezone: constants.timezone,
});

export const getSecurityInfo = () => ({
  rateLimiting: {
    windowMs: config.security.rateLimitWindowMs,
    maxRequests: config.security.rateLimitMax,
  },
  bcryptRounds: config.security.bcryptRounds,
  sessionTimeout: config.security.sessionTimeout,
  corsEnabled: true,
  helmetEnabled: true,
});

// Run validation on import
validateConfig();

export default config;