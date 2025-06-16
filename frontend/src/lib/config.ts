// frontend/src/lib/config.ts
// Single source of truth for all frontend configuration

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

export const APP_CONFIG = {
  // API Configuration
  API_BASE_URL: 'http://localhost:3000/api',
  
  // App Information
  APP_NAME: 'ระบบรายงานโรค',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'ระบบรายงานการติดตาม การเฝ้าระวัง และควบคุมโรค',
  
  // Timezone
  TIMEZONE: 'Asia/Bangkok',
  
  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
    MAX_PAGE_SIZE: 100,
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
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES_PER_REQUEST: 5,
    ALLOWED_TYPES: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/pdf', // .pdf
      'image/jpeg', // .jpg
      'image/png', // .png
    ] as const,
    ALLOWED_EXTENSIONS: ['xlsx', 'xls', 'csv', 'pdf', 'jpg', 'jpeg', 'png'] as const,
  },
  
  // Authentication Configuration
  AUTH: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_KEY: 'user_info',
    AUTO_LOGOUT_TIME: 15 * 60 * 1000, // 15 minutes
    REMEMBER_LOGIN_DAYS: 7,
  },
  
  // UI Configuration
  UI: {
    THEME: 'light' as const,
    LANGUAGE: 'th' as const,
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 48,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
  },
  
  // Chart Configuration
  CHARTS: {
    COLORS: {
      PRIMARY: '#3B82F6',
      SECONDARY: '#EF4444',
      SUCCESS: '#10B981',
      WARNING: '#F59E0B',
      INFO: '#06B6D4',
      PURPLE: '#8B5CF6',
      PINK: '#EC4899',
      INDIGO: '#6366F1',
    } as const,
    DEFAULT_HEIGHT: 300,
    ANIMATION_DURATION: 1000,
  },
  
  // Table Configuration
  TABLE: {
    DEFAULT_PAGE_SIZE: 20,
    ROWS_PER_PAGE_OPTIONS: [10, 20, 50, 100] as const,
    MAX_ROWS_PER_PAGE: 100,
    STICKY_HEADER: true,
  },
  
  // Form Configuration
  FORM: {
    DEBOUNCE_DELAY: 300, // ms
    AUTO_SAVE_DELAY: 2000, // ms
    VALIDATION_DELAY: 500, // ms
    MAX_TEXT_LENGTH: 255,
    MAX_TEXTAREA_LENGTH: 1000,
  },
  
  // Cache Configuration
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_ENTRIES: 100,
    STORAGE_KEY: 'app_cache',
  },
  
  // Development Configuration
  DEV: {
    ENABLE_LOGGER: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    MOCK_API: false,
    SHOW_DEBUG_INFO: false,
  },
} as const;

// ============================================
// API ENDPOINTS MAPPING
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
    EXPORT_EXCEL: '/patient-visits/export/excel',
    HEALTH: '/patient-visits/health',
  },
  
  // Disease Endpoints
  DISEASES: {
    LIST: '/diseases',
    BY_ID: (id: string) => `/diseases/${id}`,
    SEARCH: '/diseases/search',
    CREATE: '/diseases',
    UPDATE: (id: string) => `/diseases/${id}`,
    DELETE: (id: string) => `/diseases/${id}`,
    STATISTICS: '/diseases/statistics/summary',
    HEALTH: '/diseases/health',
  },
  
  // Hospital Endpoints
  HOSPITALS: {
    LIST: '/hospitals',
    BY_ID: (id: string) => `/hospitals/${id}`,
    BY_CODE: (code: string) => `/hospitals/code/${code}`,
    SEARCH: '/hospitals/search',
    MY_HOSPITAL: '/hospitals/my-hospital',
    CREATE: '/hospitals',
    UPDATE: (id: string) => `/hospitals/${id}`,
    DELETE: (id: string) => `/hospitals/${id}`,
    STATISTICS: '/hospitals/statistics/summary',
    HEALTH: '/hospitals/health',
  },
  
  // User Endpoints
  USERS: {
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    CHANGE_PASSWORD: (id: string) => `/users/${id}/password`,
    HEALTH: '/users/health',
  },
  
  // Report Endpoints
  REPORTS: {
    PATIENT_VISITS: '/reports/patient-visits',
    INCIDENCE_DATA: '/reports/incidence-data',
    GENDER_DATA: '/reports/gender-data',
    TREND_DATA: '/reports/trend-data',
    EXPORT_PDF: '/reports/export/pdf',
    EXPORT_EXCEL: '/reports/export/excel',
    HEALTH: '/reports/health',
  },
  
  // Symptom Endpoints
  SYMPTOMS: {
    LIST: '/symptoms',
    BY_ID: (id: string) => `/symptoms/${id}`,
    BY_DISEASE: (diseaseId: string) => `/symptoms/disease/${diseaseId}`,
    CREATE: '/symptoms',
    UPDATE: (id: string) => `/symptoms/${id}`,
    DELETE: (id: string) => `/symptoms/${id}`,
    STATISTICS: '/symptoms/statistics/summary',
    HEALTH: '/symptoms/health',
  },
  
  // Population Endpoints
  POPULATIONS: {
    LIST: '/populations',
    BY_ID: (id: string) => `/populations/${id}`,
    BY_HOSPITAL: (hospitalCode: string) => `/populations/hospital/${hospitalCode}`,
    BY_YEAR: (year: number) => `/populations/year/${year}`,
    STATISTICS: '/populations/statistics/summary',
    TRENDS: '/populations/trends',
    MY_HOSPITAL: '/populations/my-hospital',
    CREATE: '/populations',
    UPDATE: (id: string) => `/populations/${id}`,
    DELETE: (id: string) => `/populations/${id}`,
    HEALTH: '/populations/health',
  },
  
  // Health Check
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
  
  // Admin Routes
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
  return APP_CONFIG.FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(extension.toLowerCase() as any);
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
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return !isDevelopment();
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback: string = ''): string {
  // In browser environment, we don't have access to process.env
  // Use window.location or other browser APIs to determine environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (key === 'NODE_ENV') {
      return hostname === 'localhost' ? 'development' : 'production';
    }
  }
  return fallback;
}

/**
 * Get API base URL (can be overridden by environment)
 */
export function getApiBaseUrl(): string {
  // In development, use localhost
  if (isDevelopment()) {
    return 'http://localhost:3000/api';
  }
  // In production, use relative path or configured URL
  return '/api';
}

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  // Core Features
  AUTHENTICATION: true,
  PATIENT_MANAGEMENT: true,
  REPORTING: true,
  
  // Admin Features
  USER_MANAGEMENT: true,
  HOSPITAL_MANAGEMENT: true,
  DISEASE_MANAGEMENT: true,
  
  // Advanced Features
  EXCEL_EXPORT: true,
  PDF_EXPORT: true,
  CHART_VISUALIZATION: true,
  ADVANCED_SEARCH: true,
  
  // Experimental Features
  DARK_MODE: false,
  PUSH_NOTIFICATIONS: false,
  OFFLINE_MODE: false,
  
  // Development Features
  DEBUG_MODE: typeof window !== 'undefined' && window.location.hostname === 'localhost',
  MOCK_DATA: typeof window !== 'undefined' && window.location.hostname === 'localhost',
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type AppConfig = typeof APP_CONFIG;
export type ApiEndpoints = typeof API_ENDPOINTS;
export type Routes = typeof ROUTES;
export type Features = typeof FEATURES;

// Environment type
export type Environment = 'development' | 'production' | 'test';

// Theme type
export type Theme = 'light' | 'dark';

// Language type
export type Language = 'th' | 'en';

// Export config object for easier imports
export const config = {
  app: APP_CONFIG,
  api: API_ENDPOINTS,
  routes: ROUTES,
  features: FEATURES,
} as const;