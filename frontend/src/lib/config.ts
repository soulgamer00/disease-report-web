// frontend/src/lib/config.ts
// Single source of truth for all frontend configuration
// Uses SvelteKit environment variables properly

import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

// ============================================
// ENVIRONMENT DETECTION
// ============================================

/**
 * Get current environment based on NODE_ENV or URL
 */
function getEnvironment(): 'development' | 'production' | 'test' {
  // In SvelteKit, check PUBLIC_NODE_ENV first
  if (env.PUBLIC_NODE_ENV) {
    return env.PUBLIC_NODE_ENV as 'development' | 'production' | 'test';
  }
  
  // Browser-based detection as fallback
  if (browser) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Development indicators
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.endsWith('.local') ||
        protocol === 'http:') {
      return 'development';
    }
    
    // Production by default
    return 'production';
  }
  
  // Server-side default
  return 'development';
}

/**
 * Get API base URL based on environment
 */
function getApiBaseUrl(): string {
  // Use explicit environment variable if provided
  if (env.PUBLIC_API_BASE_URL) {
    return env.PUBLIC_API_BASE_URL;
  }
  
  const environment = getEnvironment();
  
  switch (environment) {
    case 'development':
      // Local development - use localhost:3000
      return 'http://localhost:3000/api';
      
    case 'production':
      // Production - use relative path (assumes frontend and backend on same domain)
      // or can be overridden by PUBLIC_API_BASE_URL
      return '/api';
      
    case 'test':
      // Test environment
      return 'http://localhost:3001/api';
      
    default:
      return '/api';
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

// ============================================
// MAIN CONFIGURATION
// ============================================

export const APP_CONFIG = {
  // Environment
  ENVIRONMENT: getEnvironment(),
  
  // API Configuration
  API_BASE_URL: getApiBaseUrl(),
  
  // App Information
  APP_NAME: env.PUBLIC_APP_NAME || 'ระบบรายงานโรค',
  APP_VERSION: env.PUBLIC_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: env.PUBLIC_APP_DESCRIPTION || 'ระบบรายงานการติดตาม การเฝ้าระวัง และควบคุมโรค',
  
  // Timezone
  TIMEZONE: env.PUBLIC_TIMEZONE || 'Asia/Bangkok',
  
  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: parseInt(env.PUBLIC_DEFAULT_PAGE_SIZE || '20', 10),
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
    MAX_PAGE_SIZE: parseInt(env.PUBLIC_MAX_PAGE_SIZE || '100', 10),
  },
  
  // Date Format
  DATE_FORMATS: {
    DISPLAY: 'DD/MM/YYYY',
    DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
    DISPLAY_FULL: 'วันdddd ที่ DD MMMM YYYY',
    API: 'YYYY-MM-DD',
    DATETIME_API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    TIME_ONLY: 'HH:mm',
  },
  
  // File Upload Configuration
  FILE_UPLOAD: {
    MAX_FILE_SIZE: parseInt(env.PUBLIC_MAX_FILE_SIZE || '10485760', 10), // 10MB default
    MAX_FILES_PER_REQUEST: parseInt(env.PUBLIC_MAX_FILES_PER_REQUEST || '5', 10),
    ALLOWED_TYPES: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/pdf', // .pdf
      'image/jpeg', // .jpg
      'image/png', // .png
    ] as const,
    ALLOWED_EXTENSIONS: (env.PUBLIC_ALLOWED_FILE_TYPES || 'xlsx,xls,csv,pdf,jpg,jpeg,png').split(','),
  },
  
  // Authentication Configuration
  AUTH: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_KEY: 'user_info',
    AUTO_LOGOUT_TIME: parseInt(env.PUBLIC_SESSION_TIMEOUT || '900000', 10), // 15 minutes default
    REMEMBER_LOGIN_DAYS: parseInt(env.PUBLIC_REMEMBER_LOGIN_DAYS || '7', 10),
  },
  
  // UI Configuration
  UI: {
    THEME: (env.PUBLIC_DEFAULT_THEME as 'light' | 'dark') || 'light',
    LANGUAGE: (env.PUBLIC_DEFAULT_LANGUAGE as 'th' | 'en') || 'th',
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 48,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
  },
  
  // Chart Configuration
  CHARTS: {
    COLORS: {
      PRIMARY: env.PUBLIC_CHART_PRIMARY_COLOR || '#3B82F6',
      SECONDARY: env.PUBLIC_CHART_SECONDARY_COLOR || '#EF4444',
      SUCCESS: '#10B981',
      WARNING: '#F59E0B',
      INFO: '#06B6D4',
      PURPLE: '#8B5CF6',
      PINK: '#EC4899',
      INDIGO: '#6366F1',
    } as const,
    DEFAULT_HEIGHT: parseInt(env.PUBLIC_CHART_DEFAULT_HEIGHT || '300', 10),
    ANIMATION_DURATION: parseInt(env.PUBLIC_CHART_ANIMATION_DURATION || '1000', 10),
  },
  
  // Table Configuration
  TABLE: {
    DEFAULT_PAGE_SIZE: parseInt(env.PUBLIC_DEFAULT_PAGE_SIZE || '20', 10),
    ROWS_PER_PAGE_OPTIONS: [10, 20, 50, 100] as const,
    MAX_ROWS_PER_PAGE: parseInt(env.PUBLIC_MAX_PAGE_SIZE || '100', 10),
    STICKY_HEADER: (env.PUBLIC_STICKY_TABLE_HEADER || 'true') === 'true',
  },
  
  // Form Configuration
  FORM: {
    DEBOUNCE_DELAY: parseInt(env.PUBLIC_FORM_DEBOUNCE_DELAY || '300', 10),
    AUTO_SAVE_DELAY: parseInt(env.PUBLIC_FORM_AUTO_SAVE_DELAY || '2000', 10),
    VALIDATION_DELAY: parseInt(env.PUBLIC_FORM_VALIDATION_DELAY || '500', 10),
    MAX_TEXT_LENGTH: parseInt(env.PUBLIC_MAX_TEXT_LENGTH || '255', 10),
    MAX_TEXTAREA_LENGTH: parseInt(env.PUBLIC_MAX_TEXTAREA_LENGTH || '1000', 10),
  },
  
  // Cache Configuration
  CACHE: {
    ENABLED: (env.PUBLIC_ENABLE_CACHE || 'true') === 'true',
    DEFAULT_TTL: parseInt(env.PUBLIC_CACHE_TTL || '300000', 10), // 5 minutes
    MAX_ENTRIES: parseInt(env.PUBLIC_CACHE_MAX_ENTRIES || '100', 10),
    STORAGE_KEY: env.PUBLIC_CACHE_STORAGE_KEY || 'app_cache',
  },
  
  // Performance Configuration
  PERFORMANCE: {
    REQUEST_TIMEOUT: parseInt(env.PUBLIC_REQUEST_TIMEOUT || '30000', 10), // 30 seconds
    RETRY_ATTEMPTS: parseInt(env.PUBLIC_RETRY_ATTEMPTS || '3', 10),
    RETRY_DELAY: parseInt(env.PUBLIC_RETRY_DELAY || '1000', 10),
  },
} as const;

// ============================================
// FEATURE FLAGS (Environment-based)
// ============================================

export const FEATURES = {
  // Core Features
  AUTHENTICATION: true,
  PATIENT_MANAGEMENT: true,
  REPORTING: true,
  
  // Admin Features
  USER_MANAGEMENT: (env.PUBLIC_ENABLE_USER_MANAGEMENT || 'true') === 'true',
  HOSPITAL_MANAGEMENT: (env.PUBLIC_ENABLE_HOSPITAL_MANAGEMENT || 'true') === 'true',
  DISEASE_MANAGEMENT: (env.PUBLIC_ENABLE_DISEASE_MANAGEMENT || 'true') === 'true',
  
  // Advanced Features
  EXCEL_EXPORT: (env.PUBLIC_ENABLE_EXCEL_EXPORT || 'true') === 'true',
  PDF_EXPORT: (env.PUBLIC_ENABLE_PDF_EXPORT || 'false') === 'true',
  CHART_VISUALIZATION: (env.PUBLIC_ENABLE_CHARTS || 'true') === 'true',
  ADVANCED_SEARCH: (env.PUBLIC_ENABLE_ADVANCED_SEARCH || 'true') === 'true',
  
  // UI Features
  DARK_MODE: (env.PUBLIC_ENABLE_DARK_MODE || 'false') === 'true',
  RESPONSIVE_DESIGN: (env.PUBLIC_ENABLE_RESPONSIVE || 'true') === 'true',
  ANIMATIONS: (env.PUBLIC_ENABLE_ANIMATIONS || 'true') === 'true',
  
  // Experimental Features
  PUSH_NOTIFICATIONS: (env.PUBLIC_ENABLE_PUSH_NOTIFICATIONS || 'false') === 'true',
  OFFLINE_MODE: (env.PUBLIC_ENABLE_OFFLINE_MODE || 'false') === 'true',
  PWA: (env.PUBLIC_ENABLE_PWA || 'false') === 'true',
  
  // Development Features (only in development)
  DEBUG_MODE: isDevelopment() && (env.PUBLIC_ENABLE_DEBUG_MODE || 'true') === 'true',
  MOCK_DATA: isDevelopment() && (env.PUBLIC_ENABLE_MOCK_DATA || 'false') === 'true',
  PERFORMANCE_MONITORING: (env.PUBLIC_ENABLE_PERFORMANCE_MONITORING || 'true') === 'true',
} as const;

// ============================================
// API ENDPOINTS MAPPING (Complete based on backend routes)
// ============================================

export const API_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    VERIFY: '/auth/verify',
    CHANGE_PASSWORD: '/auth/change-password',
    HEALTH: '/auth/health',
  },
  
  // Patient Visit Endpoints
  PATIENT_VISITS: {
    // Public Routes
    LIST: '/patient-visits',
    BY_ID: (id: string) => `/patient-visits/${id}`,
    BY_DISEASE: (diseaseId: string) => `/patient-visits/disease/${diseaseId}`,
    BY_HOSPITAL: (hospitalCode: string) => `/patient-visits/hospital/${hospitalCode}`,
    HISTORY: '/patient-visits/history',
    STATISTICS: '/patient-visits/statistics',
    
    // Protected Routes
    CREATE: '/patient-visits',
    UPDATE: (id: string) => `/patient-visits/${id}`,
    DELETE: (id: string) => `/patient-visits/${id}`,
    
    // Export & Search
    EXPORT_EXCEL: '/patient-visits/export/excel',
    SEARCH_ADVANCED: '/patient-visits/search/advanced',
    FILTERS_OPTIONS: '/patient-visits/filters/options',
    
    // Bulk Operations (Admin+)
    BULK_IMPORT: '/patient-visits/bulk-import',
    BULK_UPDATE: '/patient-visits/bulk-update',
    
    // Hospital-specific Routes (User+)
    MY_HOSPITAL: '/patient-visits/my-hospital',
    MY_HOSPITAL_STATISTICS: '/patient-visits/my-hospital/statistics',
    MY_HOSPITAL_HISTORY: '/patient-visits/my-hospital/history',
    
    HEALTH: '/patient-visits/health',
  },
  
  // Disease Endpoints
  DISEASES: {
    LIST: '/diseases',
    BY_ID: (id: string) => `/diseases/${id}`,
    SYMPTOMS: (id: string) => `/diseases/${id}/symptoms`,
    STATISTICS: '/diseases/statistics/summary',
    
    // Protected Routes (Superadmin only)
    CREATE: '/diseases',
    UPDATE: (id: string) => `/diseases/${id}`,
    DELETE: (id: string) => `/diseases/${id}`,
    
    HEALTH: '/diseases/health',
  },
  
  // Symptom Endpoints
  SYMPTOMS: {
    LIST: '/symptoms',
    BY_ID: (id: string) => `/symptoms/${id}`,
    BY_DISEASE: (diseaseId: string) => `/symptoms/disease/${diseaseId}`,
    STATISTICS: '/symptoms/statistics/summary',
    
    // Protected Routes (Superadmin only)
    CREATE: '/symptoms',
    UPDATE: (id: string) => `/symptoms/${id}`,
    DELETE: (id: string) => `/symptoms/${id}`,
    
    HEALTH: '/symptoms/health',
  },
  
  // Hospital Endpoints
  HOSPITALS: {
    LIST: '/hospitals',
    BY_ID: (id: string) => `/hospitals/${id}`,
    BY_CODE: (code: string) => `/hospitals/code/${code}`,
    CODES_MAP: '/hospitals/codes/map',
    STATISTICS: '/hospitals/statistics/summary',
    
    // Protected Routes (Superadmin only)
    CREATE: '/hospitals',
    UPDATE: (id: string) => `/hospitals/${id}`,
    DELETE: (id: string) => `/hospitals/${id}`,
    
    HEALTH: '/hospitals/health',
  },
  
  // Population Endpoints
  POPULATIONS: {
    LIST: '/populations',
    BY_ID: (id: string) => `/populations/${id}`,
    BY_HOSPITAL: (hospitalCode: string) => `/populations/hospital/${hospitalCode}`,
    BY_YEAR: (year: number) => `/populations/year/${year}`,
    STATISTICS: '/populations/statistics/summary',
    TRENDS: '/populations/trends',
    
    // Protected Routes (Admin+)
    MY_HOSPITAL: '/populations/my-hospital',
    CREATE: '/populations',
    UPDATE: (id: string) => `/populations/${id}`,
    DELETE: (id: string) => `/populations/${id}`,
    
    HEALTH: '/populations/health',
  },
  
  // User Endpoints (Admin+ only)
  USERS: {
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    
    // Admin password change
    ADMIN_CHANGE_PASSWORD: (id: string) => `/users/${id}/password`,
    
    // Profile management (Any user)
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/profile/password',
    
    // Debug & Docs (Development)
    DEBUG_PERMISSIONS: '/users/debug/permissions',
    DOCS: '/users/docs',
    
    HEALTH: '/users/health',
  },
  
  // Report Endpoints
  REPORTS: {
    // Age & Demographics
    AGE_GROUPS: '/reports/age-groups',
    GENDER_RATIO: '/reports/gender-ratio',
    OCCUPATION: '/reports/occupation',
    
    // Incidence & Statistics
    INCIDENCE_RATES: '/reports/incidence-rates',
    
    // Support Data
    DISEASES: '/reports/diseases',
    HOSPITALS: '/reports/hospitals',
    PUBLIC_STATS: '/reports/public-stats',
    
    // Additional Reports (from backend routes)
    PATIENT_VISIT_DATA: '/reports/patient-visit-data',
    INCIDENCE_DATA: '/reports/incidence-data',
    GENDER_DATA: '/reports/gender-data',
    TREND_DATA: '/reports/trend-data',
    POPULATION_DATA: '/reports/population-data',
    FILTER_OPTIONS: '/reports/filter-options',
    
    DOCS: '/reports/docs',
    HEALTH: '/reports/health',
  },
  
  // Root & Health Check
  ROOT: '/',
  HEALTH: '/health',
} as const;

// ============================================
// ROUTE PATHS (for SvelteKit routing)
// ============================================

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  
  // Dashboard Routes
  DASHBOARD: '/dashboard',
  
  // Patient Visit Routes
  PATIENTS: '/patients',
  PATIENT_DETAIL: (id: string) => `/patients/${id}`,
  PATIENT_CREATE: '/patients/create',
  PATIENT_EDIT: (id: string) => `/patients/${id}/edit`,
  
  // Report Routes
  REPORTS: '/reports',
  REPORT_INCIDENCE: '/reports/incidence',
  REPORT_GENDER: '/reports/gender',
  REPORT_TREND: '/reports/trend',
  
  // Admin Routes (only if enabled)
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_HOSPITALS: '/admin/hospitals',
  ADMIN_DISEASES: '/admin/diseases',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Profile Routes
  PROFILE: '/profile',
  PROFILE_SETTINGS: '/profile/settings',
  CHANGE_PASSWORD: '/profile/change-password',
  
  // Error Routes
  ERROR_404: '/404',
  ERROR_500: '/500',
  UNAUTHORIZED: '/unauthorized',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build full API URL from endpoint
 */
export function buildApiUrl(endpoint: string): string {
  return `${APP_CONFIG.API_BASE_URL}${endpoint}`;
}

/**
 * Get page size options for pagination
 */
export function getPageSizeOptions(): readonly number[] {
  return APP_CONFIG.PAGINATION.PAGE_SIZE_OPTIONS;
}

/**
 * Get default page size
 */
export function getDefaultPageSize(): number {
  return APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(type: string): boolean {
  return APP_CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(type as any);
}

/**
 * Check if file extension is allowed
 */
export function isAllowedFileExtension(extension: string): boolean {
  return APP_CONFIG.FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(extension.toLowerCase());
}

/**
 * Get chart color by index
 */
export function getChartColor(index: number): string {
  const colors = Object.values(APP_CONFIG.CHARTS.COLORS);
  return colors[index % colors.length] || APP_CONFIG.CHARTS.COLORS.PRIMARY;
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
  return formatFileSize(APP_CONFIG.FILE_UPLOAD.MAX_FILE_SIZE);
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    environment: APP_CONFIG.ENVIRONMENT,
    apiBaseUrl: APP_CONFIG.API_BASE_URL,
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    features: FEATURES,
    ...(isDevelopment() && {
      browserInfo: browser ? {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        userAgent: navigator.userAgent,
      } : null,
    }),
  };
}

// ============================================
// TYPE EXPORTS
// ============================================

export type AppConfig = typeof APP_CONFIG;
export type ApiEndpoints = typeof API_ENDPOINTS;
export type Routes = typeof ROUTES;
export type Features = typeof FEATURES;
export type Environment = 'development' | 'production' | 'test';
export type Theme = 'light' | 'dark';
export type Language = 'th' | 'en';

// Export config object for easier imports
export const config = {
  app: APP_CONFIG,
  api: API_ENDPOINTS,
  routes: ROUTES,
  features: FEATURES,
} as const;