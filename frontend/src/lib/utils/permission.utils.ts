// frontend/src/lib/utils/permission.utils.ts
// Permission utilities for role-based access control
// ✅ Type-safe permission checking with detailed permissions

import type { UserRoleId, UserInfo } from '$lib/types/auth.types';
import { AUTH_CONFIG } from '$lib/config/auth.config';

// ============================================
// PERMISSION CONSTANTS
// ============================================

export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'USER_CREATE',
  USER_READ: 'USER_READ', 
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_MANAGE_ALL: 'USER_MANAGE_ALL',
  USER_MANAGE_LIMITED: 'USER_MANAGE_LIMITED',
  
  // Hospital Management
  HOSPITAL_CREATE: 'HOSPITAL_CREATE',
  HOSPITAL_READ: 'HOSPITAL_READ',
  HOSPITAL_UPDATE: 'HOSPITAL_UPDATE', 
  HOSPITAL_DELETE: 'HOSPITAL_DELETE',
  HOSPITAL_MANAGE_ALL: 'HOSPITAL_MANAGE_ALL',
  HOSPITAL_MANAGE_OWN: 'HOSPITAL_MANAGE_OWN',
  
  // Disease Management
  DISEASE_CREATE: 'DISEASE_CREATE',
  DISEASE_READ: 'DISEASE_READ',
  DISEASE_UPDATE: 'DISEASE_UPDATE',
  DISEASE_DELETE: 'DISEASE_DELETE',
  
  // Patient Visit Management
  PATIENT_VISIT_CREATE: 'PATIENT_VISIT_CREATE',
  PATIENT_VISIT_READ: 'PATIENT_VISIT_READ',
  PATIENT_VISIT_UPDATE: 'PATIENT_VISIT_UPDATE', 
  PATIENT_VISIT_DELETE: 'PATIENT_VISIT_DELETE',
  PATIENT_VISIT_READ_ALL: 'PATIENT_VISIT_READ_ALL',
  PATIENT_VISIT_READ_OWN: 'PATIENT_VISIT_READ_OWN',
  
  // Population Management
  POPULATION_CREATE: 'POPULATION_CREATE',
  POPULATION_READ: 'POPULATION_READ',
  POPULATION_UPDATE: 'POPULATION_UPDATE',
  POPULATION_DELETE: 'POPULATION_DELETE',
  POPULATION_MANAGE_ALL: 'POPULATION_MANAGE_ALL',
  POPULATION_MANAGE_OWN: 'POPULATION_MANAGE_OWN',
  
  // Report & Export
  REPORT_VIEW_ALL: 'REPORT_VIEW_ALL',
  REPORT_VIEW_OWN: 'REPORT_VIEW_OWN',
  REPORT_EXPORT_ALL: 'REPORT_EXPORT_ALL',
  REPORT_EXPORT_OWN: 'REPORT_EXPORT_OWN',
  
  // System Settings
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS',
  PROFILE_MANAGE: 'PROFILE_MANAGE',
  PASSWORD_CHANGE_OWN: 'PASSWORD_CHANGE_OWN',
  PASSWORD_CHANGE_OTHER: 'PASSWORD_CHANGE_OTHER',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================
// ROLE PERMISSION MATRIX
// ============================================

const ROLE_PERMISSIONS: Record<UserRoleId, Permission[]> = {
  // SUPERADMIN (roleId: 1) - Full System Access
  1: [
    // User Management - Full
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_ALL,
    
    // Hospital Management - Full
    PERMISSIONS.HOSPITAL_CREATE,
    PERMISSIONS.HOSPITAL_READ,
    PERMISSIONS.HOSPITAL_UPDATE,
    PERMISSIONS.HOSPITAL_DELETE,
    PERMISSIONS.HOSPITAL_MANAGE_ALL,
    
    // Disease Management - Full
    PERMISSIONS.DISEASE_CREATE,
    PERMISSIONS.DISEASE_READ,
    PERMISSIONS.DISEASE_UPDATE,
    PERMISSIONS.DISEASE_DELETE,
    
    // Patient Visit Management - Full
    PERMISSIONS.PATIENT_VISIT_CREATE,
    PERMISSIONS.PATIENT_VISIT_READ,
    PERMISSIONS.PATIENT_VISIT_UPDATE,
    PERMISSIONS.PATIENT_VISIT_DELETE,
    PERMISSIONS.PATIENT_VISIT_READ_ALL,
    
    // Population Management - Full
    PERMISSIONS.POPULATION_CREATE,
    PERMISSIONS.POPULATION_READ,
    PERMISSIONS.POPULATION_UPDATE,
    PERMISSIONS.POPULATION_DELETE,
    PERMISSIONS.POPULATION_MANAGE_ALL,
    
    // Reports - Full
    PERMISSIONS.REPORT_VIEW_ALL,
    PERMISSIONS.REPORT_EXPORT_ALL,
    
    // System
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.PROFILE_MANAGE,
    PERMISSIONS.PASSWORD_CHANGE_OWN,
    PERMISSIONS.PASSWORD_CHANGE_OTHER,
  ],
  
  // ADMIN (roleId: 2) - Hospital Level Management
  2: [
    // User Management - Limited (USER role only)
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_LIMITED,
    
    // Hospital Management - Own hospital only
    PERMISSIONS.HOSPITAL_READ,
    PERMISSIONS.HOSPITAL_UPDATE,
    PERMISSIONS.HOSPITAL_MANAGE_OWN,
    
    // Disease Management - Read only
    PERMISSIONS.DISEASE_READ,
    
    // Patient Visit Management - Own hospital
    PERMISSIONS.PATIENT_VISIT_CREATE,
    PERMISSIONS.PATIENT_VISIT_READ,
    PERMISSIONS.PATIENT_VISIT_UPDATE,
    PERMISSIONS.PATIENT_VISIT_DELETE,
    PERMISSIONS.PATIENT_VISIT_READ_OWN,
    
    // Population Management - Own hospital
    PERMISSIONS.POPULATION_CREATE,
    PERMISSIONS.POPULATION_READ,
    PERMISSIONS.POPULATION_UPDATE,
    PERMISSIONS.POPULATION_DELETE,
    PERMISSIONS.POPULATION_MANAGE_OWN,
    
    // Reports - Own hospital
    PERMISSIONS.REPORT_VIEW_OWN,
    PERMISSIONS.REPORT_EXPORT_OWN,
    
    // Profile
    PERMISSIONS.PROFILE_MANAGE,
    PERMISSIONS.PASSWORD_CHANGE_OWN,
    PERMISSIONS.PASSWORD_CHANGE_OTHER, // Can change USER passwords
  ],
  
  // USER (roleId: 3) - Basic Operations
  3: [
    // User Management - None
    
    // Hospital Management - Read only
    PERMISSIONS.HOSPITAL_READ,
    
    // Disease Management - Read only
    PERMISSIONS.DISEASE_READ,
    
    // Patient Visit Management - Limited
    PERMISSIONS.PATIENT_VISIT_CREATE,
    PERMISSIONS.PATIENT_VISIT_READ,
    PERMISSIONS.PATIENT_VISIT_READ_OWN,
    
    // Population Management - Read only
    PERMISSIONS.POPULATION_READ,
    
    // Reports - Own hospital, export only
    PERMISSIONS.REPORT_VIEW_OWN,
    PERMISSIONS.REPORT_EXPORT_OWN,
    
    // Profile
    PERMISSIONS.PROFILE_MANAGE,
    PERMISSIONS.PASSWORD_CHANGE_OWN,
  ],
};

// ============================================
// PERMISSION CHECKING FUNCTIONS
// ============================================

/**
 * Check if user has specific permission
 */
export function hasPermission(userRoleId: UserRoleId, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRoleId];
  return rolePermissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userRoleId: UserRoleId, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRoleId, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(userRoleId: UserRoleId, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRoleId, permission));
}

/**
 * Get all permissions for user role
 */
export function getUserPermissions(userRoleId: UserRoleId): Permission[] {
  return ROLE_PERMISSIONS[userRoleId] ?? [];
}

// ============================================
// ROLE-SPECIFIC PERMISSION CHECKS
// ============================================

/**
 * Check if user is Superadmin
 */
export function isSuperadmin(userRoleId: UserRoleId): boolean {
  return userRoleId === AUTH_CONFIG.roles.SUPERADMIN;
}

/**
 * Check if user is Admin or above
 */
export function isAdmin(userRoleId: UserRoleId): boolean {
  return userRoleId <= AUTH_CONFIG.roles.ADMIN;
}

/**
 * Check if user is authenticated (any role)
 */
export function isUser(userRoleId: UserRoleId): boolean {
  return userRoleId <= AUTH_CONFIG.roles.USER;
}

// ============================================
// DATA ACCESS PERMISSION CHECKS
// ============================================

/**
 * Check if user can access all hospitals data
 */
export function canAccessAllHospitals(userRoleId: UserRoleId): boolean {
  return hasPermission(userRoleId, PERMISSIONS.HOSPITAL_MANAGE_ALL) ||
         hasPermission(userRoleId, PERMISSIONS.PATIENT_VISIT_READ_ALL) ||
         hasPermission(userRoleId, PERMISSIONS.REPORT_VIEW_ALL);
}

/**
 * Check if user can only access own hospital data
 */
export function canAccessOwnHospitalOnly(userRoleId: UserRoleId): boolean {
  return !canAccessAllHospitals(userRoleId) && isUser(userRoleId);
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(userRoleId: UserRoleId): boolean {
  return hasPermission(userRoleId, PERMISSIONS.USER_MANAGE_ALL) ||
         hasPermission(userRoleId, PERMISSIONS.USER_MANAGE_LIMITED);
}

/**
 * Check if user can manage specific target user
 */
export function canManageSpecificUser(managerRoleId: UserRoleId, targetRoleId: UserRoleId): boolean {
  // SUPERADMIN can manage everyone
  if (hasPermission(managerRoleId, PERMISSIONS.USER_MANAGE_ALL)) {
    return true;
  }
  
  // ADMIN can only manage USER role
  if (hasPermission(managerRoleId, PERMISSIONS.USER_MANAGE_LIMITED)) {
    return targetRoleId === AUTH_CONFIG.roles.USER;
  }
  
  return false;
}

/**
 * Check if user can create/edit patient visits
 */
export function canEditPatientVisits(userRoleId: UserRoleId): boolean {
  return hasPermission(userRoleId, PERMISSIONS.PATIENT_VISIT_CREATE) &&
         hasPermission(userRoleId, PERMISSIONS.PATIENT_VISIT_UPDATE);
}

/**
 * Check if user can delete patient visits
 */
export function canDeletePatientVisits(userRoleId: UserRoleId): boolean {
  return hasPermission(userRoleId, PERMISSIONS.PATIENT_VISIT_DELETE);
}

/**
 * Check if user can export data
 */
export function canExportData(userRoleId: UserRoleId): boolean {
  return hasPermission(userRoleId, PERMISSIONS.REPORT_EXPORT_ALL) ||
         hasPermission(userRoleId, PERMISSIONS.REPORT_EXPORT_OWN);
}

/**
 * Check if user can manage system settings
 */
export function canManageSystemSettings(userRoleId: UserRoleId): boolean {
  return hasPermission(userRoleId, PERMISSIONS.SYSTEM_SETTINGS);
}

// ============================================
// USER INFO HELPERS
// ============================================

/**
 * Check if user can access specific route based on role
 */
export function canAccessRoute(userRoleId: UserRoleId, route: string): boolean {
  // Admin routes - Superadmin only
  if (route.startsWith('/admin/hospitals') || 
      route.startsWith('/admin/diseases') || 
      route.startsWith('/admin/settings')) {
    return isSuperadmin(userRoleId);
  }
  
  // Admin routes - Admin+ only
  if (route.startsWith('/admin')) {
    return isAdmin(userRoleId);
  }
  
  // Patient management routes - User+ (all roles)
  if (route.startsWith('/patients')) {
    return isUser(userRoleId);
  }
  
  // Profile routes - User+ (all roles)
  if (route.startsWith('/profile')) {
    return isUser(userRoleId);
  }
  
  // Dashboard and reports - User+ (all roles)
  if (route.startsWith('/dashboard') || route.startsWith('/reports')) {
    return isUser(userRoleId);
  }
  
  // Default: allow access
  return true;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(userRoleId: UserRoleId): string {
  switch (userRoleId) {
    case 1:
      return 'ผู้ดูแลระบบหลัก';
    case 2:
      return 'ผู้ดูแลระบบ';
    case 3:
      return 'ผู้ใช้งาน';
    default:
      return 'ไม่ทราบ';
  }
}

/**
 * Get role color for UI display
 */
export function getRoleColor(userRoleId: UserRoleId): string {
  switch (userRoleId) {
    case 1:
      return 'text-red-600 bg-red-50 border-red-200'; // Superadmin - Red
    case 2:
      return 'text-blue-600 bg-blue-50 border-blue-200'; // Admin - Blue
    case 3:
      return 'text-green-600 bg-green-50 border-green-200'; // User - Green
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'; // Unknown - Gray
  }
}