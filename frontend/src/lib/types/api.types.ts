// frontend/src/lib/types/auth.types.ts
// ✅ Updated Authentication types - Pure HttpOnly Cookies
// ลบ token types ที่ไม่จำเป็นออก เพราะ browser จัดการ cookies อัตโนมัติ

import type { BaseResponse, ErrorResponse, BaseEntity } from './common.types';

// ============================================
// USER ROLE TYPES
// ============================================

/**
 * User role IDs (must match backend)
 */
export type UserRoleId = 1 | 2 | 3;

/**
 * User role names
 */
export type UserRoleName = 'SUPERADMIN' | 'ADMIN' | 'USER';

/**
 * User role mapping
 */
export interface UserRole {
  id: UserRoleId;
  name: UserRoleName;
  displayName: string;
}

// ============================================
// USER ENTITY TYPES
// ============================================

/**
 * Core user information
 */
export interface UserInfo extends BaseEntity {
  username: string;
  email: string | null;
  fname: string;
  lname: string;
  userRoleId: UserRoleId;
  userRole: string; // Display name of role
  hospitalCode9eDigit: string | null;
  hospital: {
    id: string;
    hospitalName: string;
    hospitalCode9eDigit: string;
  } | null;
  lastLoginAt: string | null;
  isActive: boolean;
}

/**
 * User profile (subset of UserInfo for display)
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  fname: string;
  lname: string;
  fullName: string;
  userRoleId: UserRoleId;
  userRole: string;
  hospitalName: string | null;
  lastLoginAt: string | null;
}

/**
 * User summary (minimal info for listings)
 */
export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  userRoleId: UserRoleId;
  userRole: string;
  hospitalName: string | null;
  isActive: boolean;
}

// ============================================
// AUTHENTICATION REQUEST TYPES
// ============================================

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Change password request payload
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Reset password request payload (future feature)
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Admin change password request (admin changing user's password)
 */
export interface AdminChangePasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

// ============================================
// AUTHENTICATION RESPONSE TYPES
// ============================================

/**
 * Login response data
 * ✅ ตรงกับ backend structure - ไม่มี tokens เพราะใช้ httpOnly cookies
 */
export interface LoginResponseData {
  user: UserInfo;
  expiresIn: string; // Token expiration duration (ส่งมาจาก backend)
}

/**
 * Login response
 */
export interface LoginResponse extends BaseResponse<LoginResponseData> {
  success: true;
  data: LoginResponseData;
}

/**
 * Logout response
 */
export interface LogoutResponse extends BaseResponse<{ message: string }> {
  success: true;
  data: { message: string };
}

/**
 * Profile response
 */
export interface ProfileResponse extends BaseResponse<UserInfo> {
  success: true;
  data: UserInfo;
}

/**
 * Verify token response data
 * ✅ แก้ไขให้เหมาะกับ httpOnly cookies
 */
export interface VerifyTokenResponseData {
  user: UserInfo;
  authenticated: boolean;
}

/**
 * Verify token response
 */
export interface VerifyTokenResponse extends BaseResponse<VerifyTokenResponseData> {
  success: true;
  data: VerifyTokenResponseData;
}

/**
 * Change password response
 */
export interface ChangePasswordResponse extends BaseResponse<{ updatedAt: string }> {
  success: true;
  data: { updatedAt: string };
}

// ============================================
// AUTHENTICATION STATE TYPES (สำหรับ Frontend)
// ============================================

/**
 * Authentication state for UI
 * ✅ ไม่มี token fields เพราะใช้ cookies
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  error: string | null;
  lastActivity: number; // Timestamp of last activity
}

/**
 * Login form state
 */
export interface LoginFormState {
  username: string;
  password: string;
  rememberMe: boolean;
  isSubmitting: boolean;
  errors: {
    username?: string;
    password?: string;
    general?: string;
  };
}

/**
 * Change password form state
 */
export interface ChangePasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isSubmitting: boolean;
  errors: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  };
}

// ============================================
// PERMISSION TYPES
// ============================================

/**
 * Available permissions in the system
 */
export type Permission = 
  | 'canManageUsers'
  | 'canManageSystemData'
  | 'canAccessAllHospitals'
  | 'canExportData'
  | 'canDeleteData'
  | 'canViewReports'
  | 'canCreateReports'
  | 'canEditReports'
  | 'canDeleteReports';

/**
 * Permission check result
 */
export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  requiredRole?: UserRoleId;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Authentication specific errors
 */
export interface AuthError extends ErrorResponse {
  code: 'AUTH_FAILED' | 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'ACCESS_DENIED';
  timestamp: string;
}

/**
 * Login error details
 */
export interface LoginError {
  field?: 'username' | 'password' | 'general';
  message: string;
  code?: string;
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Password validation rules
 */
export interface PasswordValidationRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

// ============================================
// SESSION TYPES
// ============================================

/**
 * Session information (local storage based)
 * ✅ ไม่มี token เพราะอยู่ใน httpOnly cookies
 */
export interface SessionInfo {
  user: UserInfo;
  lastActivity: number;
  loginTime: number;
  isExpired: boolean;
}

/**
 * Activity tracking
 */
export interface ActivityTracker {
  lastMouseMove: number;
  lastKeyPress: number;
  lastClick: number;
  lastApiCall: number;
  isActive: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Auth context for React/Svelte stores
 */
export interface AuthContext {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  updateProfile: (data: Partial<UserInfo>) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  clearError: () => void;
}

// ============================================
// DEPRECATED TYPES (Removed)
// ============================================

/* ❌ ลบ types เหล่านี้ออกแล้ว เพราะใช้ httpOnly cookies:

- JwtPayload
- TokenInfo  
- TokenStorage
- RefreshTokenRequest
- RefreshTokenResponse
- RefreshTokenResponseData
- LoginResponseData.accessToken
- LoginResponseData.refreshToken

*/