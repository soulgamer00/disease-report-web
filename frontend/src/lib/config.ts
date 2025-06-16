// src/lib/config.ts

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
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
  
  // Date Format
  DATE_FORMATS: {
    DISPLAY: 'DD/MM/YYYY',
    DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
    API: 'YYYY-MM-DD',
    DATETIME_API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
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
    MY_HOSPITAL: '/patient-visits/my-hospital',
    MY_HOSPITAL_STATS: '/patient-visits/my-hospital/statistics',
    MANAGE: '/patient-visits/manage',
  },
  
  // Disease Endpoints
  DISEASES: {
    LIST: '/diseases',
    BY_ID: (id: string) => `/diseases/${id}`,
    SYMPTOMS: (id: string) => `/diseases/${id}/symptoms`,
    STATISTICS: '/diseases/statistics/summary',
    CREATE: '/diseases',
    UPDATE: (id: string) => `/diseases/${id}`,
    DELETE: (id: string) => `/diseases/${id}`,
  },
  
  // Hospital Endpoints
  HOSPITALS: {
    LIST: '/hospitals',
    BY_ID: (id: string) => `/hospitals/${id}`,
    BY_CODE: (code: string) => `/hospitals/code/${code}`,
    CODES_MAP: '/hospitals/codes/map',
    STATISTICS: '/hospitals/statistics/summary',
    CREATE: '/hospitals',
    UPDATE: (id: string) => `/hospitals/${id}`,
    DELETE: (id: string) => `/hospitals/${id}`,
  },
  
  // Report Endpoints
  REPORTS: {
    PATIENT_VISIT_DATA: '/reports/patient-visit-data',
    INCIDENCE_DATA: '/reports/incidence-data',
    GENDER_DATA: '/reports/gender-data',
    TREND_DATA: '/reports/trend-data',
    POPULATION_DATA: '/reports/population-data',
    FILTER_OPTIONS: '/reports/filter-options',
  },
  
  // User Management Endpoints (Admin only)
  USERS: {
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
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

// ============================================
// TYPE EXPORTS
// ============================================

export type AppConfig = typeof APP_CONFIG;
export type ApiEndpoints = typeof API_ENDPOINTS;