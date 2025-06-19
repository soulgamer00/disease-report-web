// frontend/src/lib/types/auth.types.ts
// Authentication and authorization types
// ✅ Type-safe auth system for login functionality

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
 * Refresh token request payload
 */
export interface RefreshTokenRequest {
  refreshToken?: string; // Optional if using httpOnly cookies
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
 */
export interface LoginResponseData {
  user: UserInfo;
  accessToken?: string; // Optional if using httpOnly cookies
  refreshToken?: string; // Optional if using httpOnly cookies
  expiresIn: string; // Token expiration duration
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
 * Refresh token response data
 */
export interface RefreshTokenResponseData {
  accessToken?: string; // Optional if using httpOnly cookies
  refreshToken?: string; // Optional if using httpOnly cookies
  expiresIn: string;
  user?: UserInfo; // Updated user info if needed
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse extends BaseResponse<RefreshTokenResponseData> {
  success: true;
  data: RefreshTokenResponseData;
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
 */
export interface VerifyTokenResponseData {
  user: UserInfo;
  isValid: boolean;
  expiresAt: string;
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
// JWT & TOKEN TYPES
// ============================================

/**
 * JWT payload structure (from backend)
 */
export interface JwtPayload {
  userId: string;
  username: string;
  userRoleId: UserRoleId;
  hospitalCode9eDigit: string | null;
  iat: number; // Issued at
  exp: number; // Expires at
}

/**
 * Token information
 */
export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  expiresAt: number; // Timestamp
}

/**
 * Token storage interface
 */
export interface TokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string): void;
  clearTokens(): void;
  isTokenExpired(): boolean;
}

// ============================================
// AUTHENTICATION STATE TYPES
// ============================================

/**
 * Authentication state
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
 * Permission names (matches frontend config)
 */
export type PermissionName = 
  | 'canAccessAllHospitals'
  | 'canManageUsers'
  | 'canManageHospitals'
  | 'canManageDiseases'
  | 'canManagePopulations'
  | 'canViewAllReports'
  | 'canExportData'
  | 'canDeleteData'
  | 'canChangeOwnPassword'
  | 'canEditOwnProfile';

/**
 * Permission check result
 */
export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string; // Why permission was denied
}

/**
 * Role permissions matrix
 */
export interface RolePermissions {
  [roleId: number]: {
    [permission in PermissionName]: boolean;
  };
}

// ============================================
// SESSION & SECURITY TYPES
// ============================================

/**
 * Session information
 */
export interface SessionInfo {
  id: string;
  userId: string;
  startedAt: string;
  lastActivity: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

/**
 * Security event types
 */
export type SecurityEventType = 
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'token_refresh'
  | 'password_change'
  | 'session_timeout'
  | 'suspicious_activity';

/**
 * Security event
 */
export interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Login attempt tracking
 */
export interface LoginAttempt {
  username: string;
  ipAddress?: string;
  timestamp: string;
  success: boolean;
  failureReason?: string;
}

/**
 * Account lockout information
 */
export interface AccountLockout {
  userId: string;
  lockedAt: string;
  lockoutDuration: number; // Milliseconds
  attemptCount: number;
  isLocked: boolean;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Authentication error codes
 */
export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DISABLED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'SESSION_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'WEAK_PASSWORD'
  | 'PASSWORD_MISMATCH'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

/**
 * Authentication error
 */
export interface AuthError {
  success: false;
  message: string;
  error?: string;
  code: AuthErrorCode;
  timestamp?: string;
  authDetails?: {
    remainingAttempts?: number;
    lockoutDuration?: number;
    passwordRequirements?: string[];
  };
}

/**
 * Login error response
 */
export interface LoginErrorResponse extends AuthError {
  success: false;
}

// ============================================
// API RESPONSE UNION TYPES
// ============================================

/**
 * All possible auth API responses
 */
export type AuthApiResponse = 
  | LoginResponse
  | LoginErrorResponse
  | LogoutResponse
  | RefreshTokenResponse
  | ProfileResponse
  | VerifyTokenResponse
  | ChangePasswordResponse
  | AuthError;

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Extract user role from UserInfo
 */
export type ExtractUserRole<T extends UserInfo> = T['userRoleId'];

/**
 * User with specific role
 */
export type UserWithRole<R extends UserRoleId> = UserInfo & {
  userRoleId: R;
};

/**
 * Superadmin user
 */
export type SuperAdminUser = UserWithRole<1>;

/**
 * Admin user  
 */
export type AdminUser = UserWithRole<2>;

/**
 * Regular user
 */
export type RegularUser = UserWithRole<3>;

/**
 * Any admin level user (Superadmin or Admin)
 */
export type AdminLevelUser = SuperAdminUser | AdminUser;