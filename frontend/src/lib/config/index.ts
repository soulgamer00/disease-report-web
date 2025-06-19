// frontend/src/lib/config/index.ts
// Single point of export for all configuration modules
// ✅ True Single Config - everything from .env, no hard coding

// ============================================
// IMPORT ALL CONFIG MODULES
// ============================================

import { 
  CORE_CONFIG, 
  buildApiUrl, 
  getEnvironmentInfo, 
  isFeatureEnabled,
  getPageSizeOptions,
  getDefaultPageSize,
  getChartColor,
  isAllowedFileType,
  formatFileSize,
  getMaxFileSize,
  type CoreConfig,
  type Environment,
  type Language,
  type ChartColor,
  type UIFeature
} from './core';

import { 
  AUTH_CONFIG, 
  AUTH_ENDPOINTS, 
  ROUTE_GUARDS,
  getRoleName,
  hasPermission,
  canManageUsers,
  canManageSpecificUser,
  getManageableRoles,
  canChangeOwnPassword,
  canEditOwnProfile,
  canChangeOtherPassword,
  canManageSystemData,
  canAccessAllHospitals,
  getSessionTimeoutWarning,
  shouldShowSessionWarning,
  isSessionExpired,
  isProtectedRoute,
  isAdminRoute,
  isSuperAdminRoute,
  isGuestOnlyRoute,
  type AuthConfig,
  type UserRole,
  type UserRoleId,
  type Permission,
  type AuthEndpoints,
  type RouteGuards
} from './auth.config';

// ============================================
// UNIFIED CONFIG OBJECT (True Single Source)
// ============================================

/**
 * Main configuration object - Single source of truth
 * All values come from .env files, no hard coding
 */
export const config = {
  // Core system configuration (from .env)
  core: CORE_CONFIG,
  
  // Authentication & authorization (from .env)
  auth: {
    ...AUTH_CONFIG,
    endpoints: AUTH_ENDPOINTS,
    routes: ROUTE_GUARDS,
  },
  
  // Future feature configs will be added here
  // patient: PATIENT_CONFIG,
  // diseases: DISEASES_CONFIG,
  // hospitals: HOSPITALS_CONFIG,
  // reports: REPORTS_CONFIG,
  // users: USERS_CONFIG,
} as const;

// ============================================
// CONVENIENCE EXPORTS (Most commonly used)
// ============================================

// Core utilities (frequently used)
export { 
  buildApiUrl,
  getEnvironmentInfo,
  isFeatureEnabled,
  getPageSizeOptions,
  getDefaultPageSize,
  getChartColor,
  isAllowedFileType,
  formatFileSize,
  getMaxFileSize
};

// Auth utilities (frequently used)
export { 
  getRoleName,
  hasPermission,
  canManageUsers,
  canManageSpecificUser,
  getManageableRoles,
  canChangeOwnPassword,
  canEditOwnProfile,
  canChangeOtherPassword,
  canManageSystemData,
  canAccessAllHospitals,
  getSessionTimeoutWarning,
  shouldShowSessionWarning,
  isSessionExpired,
  isProtectedRoute,
  isAdminRoute,
  isSuperAdminRoute,
  isGuestOnlyRoute
};

// ============================================
// TYPE EXPORTS (Complete TypeScript support)
// ============================================

// Core types
export type { CoreConfig, Environment, Language, ChartColor, UIFeature };

// Auth types  
export type { AuthConfig, UserRole, UserRoleId, Permission, AuthEndpoints, RouteGuards };

// Config types
export type Config = typeof config;
export type ConfigCore = typeof config.core;
export type ConfigAuth = typeof config.auth;

// ============================================
// QUICK ACCESS CONSTANTS (Most used values)
// ============================================

/**
 * Quick access to frequently used values
 * Saves typing config.core.apiBaseUrl etc.
 */
export const QUICK_ACCESS = {
  // API & Environment
  apiBaseUrl: CORE_CONFIG.apiBaseUrl,
  isDevelopment: CORE_CONFIG.isDevelopment,
  isProduction: CORE_CONFIG.isProduction,
  
  // App Info
  appName: CORE_CONFIG.appName,
  appVersion: CORE_CONFIG.appVersion,
  timezone: CORE_CONFIG.timezone,
  language: CORE_CONFIG.language,
  
  // Auth essentials
  roles: AUTH_CONFIG.roles,
  roleNames: AUTH_CONFIG.roleNames,
  
  // Routes
  defaultRedirect: ROUTE_GUARDS.DEFAULT_REDIRECT,
  loginPage: ROUTE_GUARDS.LOGOUT_REDIRECT,
  protectedRoutes: ROUTE_GUARDS.PROTECTED_ROUTES,
  
  // UI essentials
  defaultPageSize: CORE_CONFIG.pagination.defaultPageSize,
  pageSizeOptions: CORE_CONFIG.pagination.pageSizeOptions,
  maxFileSize: CORE_CONFIG.fileUpload.maxFileSize,
  
  // Chart colors
  chartColors: CORE_CONFIG.chartColors,
} as const;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate if config is properly loaded
 * Useful for debugging configuration issues
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check critical values
  if (!CORE_CONFIG.apiBaseUrl) {
    errors.push('API Base URL is not configured');
  }
  
  if (!CORE_CONFIG.appName) {
    errors.push('App name is not configured');
  }
  
  // Check auth config
  if (!AUTH_CONFIG.roles.SUPERADMIN) {
    errors.push('SUPERADMIN role is not configured');
  }
  
  if (AUTH_CONFIG.tokenExpiration.accessToken <= 0) {
    errors.push('Access token expiration must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all environment variables that are being used
 * Useful for documentation and debugging
 */
export function getUsedEnvironmentVars(): string[] {
  return [
    // Core environment vars
    'PUBLIC_NODE_ENV',
    'PUBLIC_API_BASE_URL',
    'PUBLIC_DEV_API_URL',
    'PUBLIC_PROD_API_URL',
    'PUBLIC_APP_NAME',
    'PUBLIC_APP_VERSION',
    'PUBLIC_TIMEZONE',
    'PUBLIC_LANGUAGE',
    
    // Auth environment vars
    'PUBLIC_ROLE_SUPERADMIN',
    'PUBLIC_ROLE_ADMIN',
    'PUBLIC_ROLE_USER',
    'PUBLIC_DEFAULT_REDIRECT',
    'PUBLIC_SESSION_TIMEOUT',
    'PUBLIC_MAX_LOGIN_ATTEMPTS',
    
    // Feature flags
    'PUBLIC_ENABLE_ANIMATIONS',
    'PUBLIC_ENABLE_RESPONSIVE',
    'PUBLIC_DEBUG_MODE',
    
    // And many more...
  ];
}

// ============================================
// USAGE EXAMPLES & DOCUMENTATION
// ============================================

/**
 * 📖 Usage Examples:
 * 
 * // 1. Complete config object
 * import { config } from '$lib/config';
 * const apiUrl = config.core.apiBaseUrl;
 * const canEdit = config.auth.permissions.ADMIN.canDeleteData;
 * 
 * // 2. Convenience imports (recommended)
 * import { buildApiUrl, hasPermission, canManageUsers } from '$lib/config';
 * const loginUrl = buildApiUrl('/auth/login');
 * const canManage = hasPermission(2, 'canManageUsers');
 * 
 * // 3. Quick access (for frequently used values)
 * import { QUICK_ACCESS } from '$lib/config';
 * const roles = QUICK_ACCESS.roles;
 * const isDev = QUICK_ACCESS.isDevelopment;
 * 
 * // 4. Type imports
 * import type { UserRoleId, Permission } from '$lib/config';
 * 
 * // 5. Validation
 * import { validateConfig } from '$lib/config';
 * const { isValid, errors } = validateConfig();
 */

// ============================================
// DEFAULT EXPORT (Alternative usage)
// ============================================

export default config;

// ============================================
// CONFIG SUMMARY (for debugging)
// ============================================

if (CORE_CONFIG.isDevelopment && CORE_CONFIG.debugMode) {
  console.log('🔧 Config loaded:', {
    environment: CORE_CONFIG.environment,
    apiBaseUrl: CORE_CONFIG.apiBaseUrl,
    features: CORE_CONFIG.features,
    roles: AUTH_CONFIG.roles,
    validation: validateConfig()
  });
}