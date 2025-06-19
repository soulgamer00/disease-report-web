// frontend/src/lib/config/auth.config.ts
// Authentication and authorization configuration
// ✅ No hard coding - everything from .env

import { env } from '$env/dynamic/public';

// ============================================
// AUTHENTICATION CONFIGURATION
// ============================================

export const AUTH_CONFIG = {
  // Token Management (All from .env)
  tokenStorage: {
    accessTokenKey: env.PUBLIC_ACCESS_TOKEN_KEY || 'accessToken',
    refreshTokenKey: env.PUBLIC_REFRESH_TOKEN_KEY || 'refreshToken',
    userInfoKey: env.PUBLIC_USER_INFO_KEY || 'userInfo',
  },
  
  // Token Expiration (All from .env, must match backend)
  tokenExpiration: {
    accessToken: parseInt(env.PUBLIC_ACCESS_TOKEN_EXPIRES || '900000', 10), // 15 minutes
    refreshToken: parseInt(env.PUBLIC_REFRESH_TOKEN_EXPIRES || '604800000', 10), // 7 days
  },
  
  // Login Behavior (All from .env)
  features: {
    autoLogin: env.PUBLIC_AUTO_LOGIN !== 'false', // default true
    rememberMe: env.PUBLIC_REMEMBER_ME !== 'false', // default true
    sessionTimeout: parseInt(env.PUBLIC_SESSION_TIMEOUT || '900000', 10), // 15 minutes
    showLastLogin: env.PUBLIC_SHOW_LAST_LOGIN === 'true', // default false
  },
  
  // Security Settings (All from .env)
  security: {
    maxLoginAttempts: parseInt(env.PUBLIC_MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(env.PUBLIC_LOCKOUT_DURATION || '900000', 10), // 15 minutes
    requireStrongPassword: env.PUBLIC_REQUIRE_STRONG_PASSWORD === 'true',
    sessionTimeoutWarning: parseInt(env.PUBLIC_SESSION_WARNING || '60000', 10), // 1 minute before
  },
  
  // Role-based Access Control (All from .env, must match backend)
  roles: {
    SUPERADMIN: parseInt(env.PUBLIC_ROLE_SUPERADMIN || '1', 10),
    ADMIN: parseInt(env.PUBLIC_ROLE_ADMIN || '2', 10),
    USER: parseInt(env.PUBLIC_ROLE_USER || '3', 10),
  } as const,
  
  // Role Names for Display (All from .env)
  roleNames: {
    [parseInt(env.PUBLIC_ROLE_SUPERADMIN || '1', 10)]: env.PUBLIC_ROLE_NAME_1 || 'ผู้ดูแลระบบหลัก',
    [parseInt(env.PUBLIC_ROLE_ADMIN || '2', 10)]: env.PUBLIC_ROLE_NAME_2 || 'ผู้ดูแลระบบ',
    [parseInt(env.PUBLIC_ROLE_USER || '3', 10)]: env.PUBLIC_ROLE_NAME_3 || 'ผู้ใช้งาน',
  } as const,
  
  // Role Permissions Matrix
  permissions: {
    // What each role can access
    SUPERADMIN: {
      canAccessAllHospitals: true,
      canManageUsers: true,              // ✅ จัดการผู้ใช้ทุกคน (รวม ADMIN)
      canManageHospitals: true,          // ✅ จัดการโรงพยาบาล
      canManageDiseases: true,           // ✅ จัดการโรค
      canManagePopulations: true,        // ✅ จัดการประชากรทุก รพ.
      canViewAllReports: true,           // ✅ รายงานทุก รพ.
      canExportData: true,               // ✅ Export ทุก รพ.
      canDeleteData: true,               // ✅ ลบ/แก้ไขทุก รพ.
      canChangeOwnPassword: true,        // ✅ เปลี่ยนรหัสผ่านตัวเองได้
      canEditOwnProfile: true,           // ✅ แก้ไขโปรไฟล์ตัวเองได้
    },
    ADMIN: {
      canAccessAllHospitals: true,       // ✅ เข้าถึงข้อมูลทุก รพ.
      canManageUsers: true,              // ✅ จัดการผู้ใช้ (เฉพาะ USER เท่านั้น)
      canManageHospitals: false,         // ❌ จัดการโรงพยาบาลไม่ได้
      canManageDiseases: false,          // ❌ จัดการโรคไม่ได้  
      canManagePopulations: true,        // ✅ จัดการประชากรทุก รพ.
      canViewAllReports: true,           // ✅ รายงานทุก รพ.
      canExportData: true,               // ✅ Export ทุก รพ.
      canDeleteData: true,               // ✅ ลบ/แก้ไขทุก รพ.
      canChangeOwnPassword: true,        // ✅ เปลี่ยนรหัสผ่านตัวเองได้
      canEditOwnProfile: true,           // ✅ แก้ไขโปรไฟล์ตัวเองได้
    },
    USER: {
      canAccessAllHospitals: false,      // ❌ เฉพาะ รพ.ตัวเอง
      canManageUsers: false,             // ❌ จัดการผู้ใช้ไม่ได้
      canManageHospitals: false,         // ❌ จัดการโรงพยาบาลไม่ได้
      canManageDiseases: false,          // ❌ จัดการโรคไม่ได้
      canManagePopulations: false,       // ❌ จัดการประชากรไม่ได้
      canViewAllReports: true,           // ✅ ดูรายงานได้ (เฉพาะ รพ.ตัวเอง)
      canExportData: true,               // ✅ Export ได้ (เฉพาะ รพ.ตัวเอง)
      canDeleteData: false,              // ❌ ลบ/แก้ไขไม่ได้
      canChangeOwnPassword: true,        // ✅ เปลี่ยนรหัสผ่านตัวเองได้
      canEditOwnProfile: true,           // ✅ แก้ไขโปรไฟล์ตัวเองได้
    },
  } as const,
} as const;

// ============================================
// AUTH API ENDPOINTS (All from .env)
// ============================================

export const AUTH_ENDPOINTS = {
  // Authentication (All from .env)
  LOGIN: env.PUBLIC_AUTH_LOGIN || '/auth/login',
  LOGOUT: env.PUBLIC_AUTH_LOGOUT || '/auth/logout', 
  REFRESH: env.PUBLIC_AUTH_REFRESH || '/auth/refresh',
  VERIFY: env.PUBLIC_AUTH_VERIFY || '/auth/verify',
  
  // User Profile (All from .env)
  PROFILE: env.PUBLIC_AUTH_PROFILE || '/auth/profile',
  CHANGE_PASSWORD: env.PUBLIC_AUTH_CHANGE_PASSWORD || '/auth/change-password',
  
  // Health Check
  HEALTH: '/auth/health',
} as const;

// ============================================
// ROUTE GUARDS CONFIGURATION (All from .env)
// ============================================

export const ROUTE_GUARDS = {
  // Routes that require authentication (from .env)
  PROTECTED_ROUTES: (env.PUBLIC_PROTECTED_ROUTES || '/patients,/dashboard,/reports,/profile,/admin')
    .split(',')
    .map(route => route.trim()),
  
  // Routes that require admin access (from .env)
  ADMIN_ROUTES: (env.PUBLIC_ADMIN_ROUTES || '/admin,/admin/users,/admin/hospitals,/admin/diseases')
    .split(',')
    .map(route => route.trim()),
  
  // Routes that require superadmin access (from .env)
  SUPERADMIN_ROUTES: (env.PUBLIC_SUPERADMIN_ROUTES || '/admin/hospitals,/admin/diseases,/admin/settings')
    .split(',')
    .map(route => route.trim()),
  
  // Routes that redirect to /patients if authenticated (from .env)
  GUEST_ONLY_ROUTES: (env.PUBLIC_GUEST_ONLY_ROUTES || '/login')
    .split(',')
    .map(route => route.trim()),
  
  // Default redirect after login (from .env)
  DEFAULT_REDIRECT: env.PUBLIC_DEFAULT_REDIRECT || '/patients',
  
  // Default redirect after logout (from .env)
  LOGOUT_REDIRECT: env.PUBLIC_LOGOUT_REDIRECT || '/login',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get role name in Thai
 */
export function getRoleName(roleId: number): string {
  return AUTH_CONFIG.roleNames[roleId as keyof typeof AUTH_CONFIG.roleNames] || 'ไม่ทราบ';
}

/**
 * Check if user has permission for specific action
 */
export function hasPermission(
  userRoleId: number, 
  permission: keyof typeof AUTH_CONFIG.permissions.SUPERADMIN
): boolean {
  if (userRoleId === AUTH_CONFIG.roles.SUPERADMIN) {
    return AUTH_CONFIG.permissions.SUPERADMIN[permission];
  }
  if (userRoleId === AUTH_CONFIG.roles.ADMIN) {
    return AUTH_CONFIG.permissions.ADMIN[permission];
  }
  if (userRoleId === AUTH_CONFIG.roles.USER) {
    return AUTH_CONFIG.permissions.USER[permission];
  }
  return false;
}

/**
 * Check if user can manage other users
 * SUPERADMIN: Can manage all users (SUPERADMIN, ADMIN, USER)
 * ADMIN: Can manage only USER role
 * USER: Cannot manage any users
 */
export function canManageUsers(userRoleId: number): boolean {
  return userRoleId <= AUTH_CONFIG.roles.ADMIN;
}

/**
 * Check if user can manage specific target user
 * @param managerRoleId - Role ID of the person trying to manage
 * @param targetRoleId - Role ID of the person being managed
 */
export function canManageSpecificUser(managerRoleId: number, targetRoleId: number): boolean {
  // SUPERADMIN can manage everyone
  if (managerRoleId === AUTH_CONFIG.roles.SUPERADMIN) {
    return true;
  }
  
  // ADMIN can only manage USER (role 3)
  if (managerRoleId === AUTH_CONFIG.roles.ADMIN) {
    return targetRoleId === AUTH_CONFIG.roles.USER;
  }
  
  // USER cannot manage anyone
  return false;
}

/**
 * Get list of roles that current user can create/manage
 */
export function getManageableRoles(userRoleId: number): number[] {
  if (userRoleId === AUTH_CONFIG.roles.SUPERADMIN) {
    return [AUTH_CONFIG.roles.SUPERADMIN, AUTH_CONFIG.roles.ADMIN, AUTH_CONFIG.roles.USER];
  }
  
  if (userRoleId === AUTH_CONFIG.roles.ADMIN) {
    return [AUTH_CONFIG.roles.USER]; // Can only manage USER
  }
  
  return []; // USER cannot manage anyone
}

/**
 * Check if user can change their own password
 * All users should be able to change their own password
 */
export function canChangeOwnPassword(userRoleId: number): boolean {
  return hasPermission(userRoleId, 'canChangeOwnPassword');
}

/**
 * Check if user can edit their own profile
 * All users should be able to edit their own profile
 */
export function canEditOwnProfile(userRoleId: number): boolean {
  return hasPermission(userRoleId, 'canEditOwnProfile');
}

/**
 * Check if user can change another user's password (Admin function)
 * SUPERADMIN: Can change anyone's password
 * ADMIN: Can change USER's password only
 * USER: Cannot change others' passwords
 */
export function canChangeOtherPassword(managerRoleId: number, targetRoleId: number): boolean {
  // SUPERADMIN can change anyone's password
  if (managerRoleId === AUTH_CONFIG.roles.SUPERADMIN) {
    return true;
  }
  
  // ADMIN can change USER's password only
  if (managerRoleId === AUTH_CONFIG.roles.ADMIN) {
    return targetRoleId === AUTH_CONFIG.roles.USER;
  }
  
  // USER cannot change others' passwords
  return false;
}

/**
 * Check if user can manage system data (hospitals, diseases)
 * Only SUPERADMIN can manage core system data
 */
export function canManageSystemData(userRoleId: number): boolean {
  return userRoleId === AUTH_CONFIG.roles.SUPERADMIN;
}

/**
 * Check if user can access all hospitals data
 * SUPERADMIN and ADMIN can access all hospitals
 */
export function canAccessAllHospitals(userRoleId: number): boolean {
  return userRoleId <= AUTH_CONFIG.roles.ADMIN;
}

/**
 * Get session timeout warning time
 */
export function getSessionTimeoutWarning(): number {
  return AUTH_CONFIG.security.sessionTimeoutWarning;
}

/**
 * Check if session timeout warning should be shown
 */
export function shouldShowSessionWarning(lastActivity: number): boolean {
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;
  const timeoutThreshold = AUTH_CONFIG.features.sessionTimeout - AUTH_CONFIG.security.sessionTimeoutWarning;
  
  return timeSinceLastActivity >= timeoutThreshold;
}

/**
 * Check if session is expired
 */
export function isSessionExpired(lastActivity: number): boolean {
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;
  
  return timeSinceLastActivity >= AUTH_CONFIG.features.sessionTimeout;
}

/**
 * Check if route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return ROUTE_GUARDS.PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires admin access
 */
export function isAdminRoute(pathname: string): boolean {
  return ROUTE_GUARDS.ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires superadmin access
 */
export function isSuperAdminRoute(pathname: string): boolean {
  return ROUTE_GUARDS.SUPERADMIN_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route is guest-only (redirect if authenticated)
 */
export function isGuestOnlyRoute(pathname: string): boolean {
  return ROUTE_GUARDS.GUEST_ONLY_ROUTES.some(route => pathname.startsWith(route));
}

// ============================================
// TYPE EXPORTS
// ============================================

export type AuthConfig = typeof AUTH_CONFIG;
export type UserRole = keyof typeof AUTH_CONFIG.roles;
export type UserRoleId = typeof AUTH_CONFIG.roles[UserRole];
export type Permission = keyof typeof AUTH_CONFIG.permissions.SUPERADMIN;
export type AuthEndpoints = typeof AUTH_ENDPOINTS;
export type RouteGuards = typeof ROUTE_GUARDS;