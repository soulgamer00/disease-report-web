// frontend/src/lib/config/core.ts
// Core configuration - reads from environment variables only
// ✅ No hard coding - everything from .env

import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

// ============================================
// ENVIRONMENT DETECTION
// ============================================

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return env.PUBLIC_NODE_ENV === 'development' || 
         (!env.PUBLIC_NODE_ENV && browser && window.location.hostname === 'localhost');
}

/**
 * Check if running in production mode  
 */
export function isProduction(): boolean {
  return env.PUBLIC_NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return env.PUBLIC_NODE_ENV === 'test';
}

// ============================================
// API CONNECTION CONFIGURATION
// ============================================

/**
 * Get API base URL based on environment
 * Reads from .env - no hard coding
 */
function getApiBaseUrl(): string {
  // 1. Explicit environment variable takes highest precedence
  if (env.PUBLIC_API_BASE_URL) {
    return env.PUBLIC_API_BASE_URL;
  }
  
  // 2. Environment-specific URLs
  if (isDevelopment() && env.PUBLIC_DEV_API_URL) {
    return env.PUBLIC_DEV_API_URL;
  }
  
  if (isProduction() && env.PUBLIC_PROD_API_URL) {
    return env.PUBLIC_PROD_API_URL;
  }
  
  // 3. Auto-detect for development (last resort)
  if (isDevelopment() && browser) {
    const { protocol, hostname } = window.location;
    const port = env.PUBLIC_BACKEND_PORT || '3000';
    return `${protocol}//${hostname}:${port}/api`;
  }
  
  // 4. Fallback error - should never happen with proper .env
  throw new Error('API Base URL not configured. Please set PUBLIC_API_BASE_URL in .env file.');
}

// ============================================
// CORE CONFIGURATION OBJECT
// ============================================

export const CORE_CONFIG = {
  // Environment Information
  environment: (env.PUBLIC_NODE_ENV as 'development' | 'production' | 'test') || 'development',
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  isTest: isTest(),
  
  // API Connection (All from .env)
  apiBaseUrl: getApiBaseUrl(),
  apiTimeout: parseInt(env.PUBLIC_API_TIMEOUT || '30000', 10),
  
  // Application Identity (All from .env)
  appName: env.PUBLIC_APP_NAME || 'ระบบรายงานโรค',
  appVersion: env.PUBLIC_APP_VERSION || '1.0.0',
  appDescription: env.PUBLIC_APP_DESCRIPTION || 'ระบบรายงานการติดตาม การเฝ้าระวัง และควบคุมโรค',
  
  // Regional Settings (All from .env)
  timezone: env.PUBLIC_TIMEZONE || 'Asia/Bangkok',
  language: (env.PUBLIC_LANGUAGE as 'th' | 'en') || 'th',
  
  // Performance & Connection Settings (All from .env)
  requestTimeout: parseInt(env.PUBLIC_REQUEST_TIMEOUT || '30000', 10),
  maxRetries: parseInt(env.PUBLIC_MAX_RETRIES || '3', 10),
  retryDelay: parseInt(env.PUBLIC_RETRY_DELAY || '1000', 10),
  
  // Security Settings (All from .env)
  corsOrigins: env.PUBLIC_CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  csrfEnabled: env.PUBLIC_CSRF_ENABLED === 'true',
  
  // Development Settings (All from .env)
  debugMode: env.PUBLIC_DEBUG_MODE === 'true',
  verboseLogging: env.PUBLIC_VERBOSE_LOGGING === 'true',
  
  // UI/UX Settings (All from .env)
  pagination: {
    defaultPageSize: parseInt(env.PUBLIC_DEFAULT_PAGE_SIZE || '20', 10),
    pageSizeOptions: (env.PUBLIC_PAGE_SIZE_OPTIONS || '10,20,50,100')
      .split(',')
      .map(size => parseInt(size.trim(), 10)) as readonly number[],
    maxPageSize: parseInt(env.PUBLIC_MAX_PAGE_SIZE || '100', 10),
  },
  
  // File Upload Settings (All from .env)
  fileUpload: {
    maxFileSize: parseInt(env.PUBLIC_MAX_FILE_SIZE || '10485760', 10), // 10MB default
    maxFilesPerRequest: parseInt(env.PUBLIC_MAX_FILES_PER_REQUEST || '5', 10),
    allowedTypes: (env.PUBLIC_ALLOWED_FILE_TYPES || 'xlsx,xls,csv,pdf,jpg,jpeg,png')
      .split(',')
      .map(type => type.trim()),
  },
  
  // Date Formats (All from .env)
  dateFormats: {
    display: env.PUBLIC_DATE_DISPLAY || 'DD/MM/YYYY',
    displayWithTime: env.PUBLIC_DATE_WITH_TIME || 'DD/MM/YYYY HH:mm',
    displayFull: env.PUBLIC_DATE_FULL || 'วันdddd ที่ DD MMMM YYYY',
    api: env.PUBLIC_DATE_API || 'YYYY-MM-DD',
    datetimeApi: env.PUBLIC_DATETIME_API || 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    timeOnly: env.PUBLIC_TIME_ONLY || 'HH:mm',
  },
  
  // UI Features (All from .env)
  features: {
    animations: env.PUBLIC_ENABLE_ANIMATIONS === 'true',
    responsive: env.PUBLIC_ENABLE_RESPONSIVE !== 'false', // default true
    pushNotifications: env.PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
    offlineMode: env.PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    pwa: env.PUBLIC_ENABLE_PWA === 'true',
    performanceMonitoring: env.PUBLIC_ENABLE_PERFORMANCE_MONITORING !== 'false', // default true
  },
  
  // Chart Colors (All from .env)
  chartColors: {
    primary: env.PUBLIC_CHART_PRIMARY || '#3B82F6',
    secondary: env.PUBLIC_CHART_SECONDARY || '#EF4444',
    success: env.PUBLIC_CHART_SUCCESS || '#10B981',
    warning: env.PUBLIC_CHART_WARNING || '#F59E0B',
    info: env.PUBLIC_CHART_INFO || '#06B6D4',
    purple: env.PUBLIC_CHART_PURPLE || '#8B5CF6',
    pink: env.PUBLIC_CHART_PINK || '#EC4899',
    indigo: env.PUBLIC_CHART_INDIGO || '#6366F1',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build full API URL from endpoint path
 */
export function buildApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${CORE_CONFIG.apiBaseUrl}/${cleanEndpoint}`;
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    environment: CORE_CONFIG.environment,
    apiBaseUrl: CORE_CONFIG.apiBaseUrl,
    isDevelopment: CORE_CONFIG.isDevelopment,
    isProduction: CORE_CONFIG.isProduction,
    debugMode: CORE_CONFIG.debugMode,
    timezone: CORE_CONFIG.timezone,
    language: CORE_CONFIG.language,
    features: CORE_CONFIG.features,
    ...(CORE_CONFIG.isDevelopment && browser && {
      browserInfo: {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        userAgent: navigator.userAgent.substring(0, 100),
      },
    }),
  };
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof CORE_CONFIG.features): boolean {
  return CORE_CONFIG.features[feature];
}

/**
 * Get page size options for pagination
 */
export function getPageSizeOptions(): readonly number[] {
  return CORE_CONFIG.pagination.pageSizeOptions;
}

/**
 * Get default page size
 */
export function getDefaultPageSize(): number {
  return CORE_CONFIG.pagination.defaultPageSize;
}

/**
 * Get chart color by name
 */
export function getChartColor(colorName: keyof typeof CORE_CONFIG.chartColors): string {
  return CORE_CONFIG.chartColors[colorName];
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(fileType: string): boolean {
  return CORE_CONFIG.fileUpload.allowedTypes.includes(fileType.toLowerCase());
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get max file size in human readable format
 */
export function getMaxFileSize(): string {
  return formatFileSize(CORE_CONFIG.fileUpload.maxFileSize);
}

// ============================================
// TYPE EXPORTS
// ============================================

export type CoreConfig = typeof CORE_CONFIG;
export type Environment = 'development' | 'production' | 'test';
export type Language = 'th' | 'en';
export type ChartColor = keyof typeof CORE_CONFIG.chartColors;
export type UIFeature = keyof typeof CORE_CONFIG.features;