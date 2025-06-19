// frontend/src/lib/api/auth.api.ts
// Authentication API client methods
// ✅ Type-safe authentication with the backend

import { apiClient } from './client';
import { config } from '$lib/config';
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ProfileResponse,
  VerifyTokenResponse,
  UserInfo,
  AuthError
} from '$lib/types/auth.types';
import type { ApiResponse } from '$lib/types/api.types';

// ============================================
// AUTHENTICATION API METHODS
// ============================================

/**
 * Authentication API client
 */
export const authAPI = {
  
  /**
   * Login user with credentials
   * @param credentials - Username and password
   * @returns Login response with user info and tokens
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse['data']>(
        config.auth.endpoints.LOGIN,
        credentials as any
      );
      
      if (response.success) {
        // Store user info in localStorage for quick access
        if (typeof window !== 'undefined') {
          localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        }
        
        return response as LoginResponse;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      // Re-throw with proper typing
      throw error;
    }
  },

  /**
   * Logout current user
   * @returns Logout confirmation
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse['data']>(
        config.auth.endpoints.LOGOUT
      );
      
      // Clear stored user info
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('lastActivity');
      }
      
      return response as LogoutResponse;
    } catch (error) {
      // Even if logout fails on server, clear local data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('lastActivity');
      }
      
      throw error;
    }
  },

  /**
   * Refresh access token
   * @param refreshToken - Optional refresh token (uses httpOnly cookie by default)
   * @returns New access token
   */
  async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    try {
      const requestData: RefreshTokenRequest = refreshToken ? { refreshToken } : {};
      
      const response = await apiClient.post<RefreshTokenResponse['data']>(
        config.auth.endpoints.REFRESH,
        requestData as any
      );
      
      // Update user info if provided
      if (response.success && response.data.user && typeof window !== 'undefined') {
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      }
      
      return response as RefreshTokenResponse;
    } catch (error) {
      // If refresh fails, user needs to login again
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
      }
      
      throw error;
    }
  },

  /**
   * Verify current token validity
   * @returns Token verification result with user info
   */
  async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      const response = await apiClient.get<VerifyTokenResponse['data']>(
        config.auth.endpoints.VERIFY
      );
      
      // Update stored user info
      if (response.success && typeof window !== 'undefined') {
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        localStorage.setItem('lastActivity', Date.now().toString());
      }
      
      return response as VerifyTokenResponse;
    } catch (error) {
      // Clear invalid user info
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userInfo');
      }
      
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns User profile information
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get<UserInfo>(config.auth.endpoints.PROFILE);
      
      // Update stored user info
      if (response.success && typeof window !== 'undefined') {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }
      
      return response as ProfileResponse;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change user password
   * @param passwordData - Current and new password
   * @returns Password change confirmation
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.post<ChangePasswordResponse['data']>(
        config.auth.endpoints.CHANGE_PASSWORD,
        passwordData as any
      );
      
      return response as ChangePasswordResponse;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check authentication service health
   * @returns Service health status
   */
  async getHealthStatus(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await apiClient.get<{ status: string; timestamp: string }>(
        config.auth.endpoints.HEALTH
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// ============================================
// AUTHENTICATION UTILITIES
// ============================================

/**
 * Authentication utility functions
 */
export const authUtils = {
  
  /**
   * Get stored user info from localStorage
   * @returns User info or null if not found
   */
  getStoredUser(): UserInfo | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('userInfo');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is currently authenticated (has valid stored user info)
   * @returns True if user appears to be authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getStoredUser();
    return user !== null && user.isActive;
  },

  /**
   * Get user's role ID
   * @returns User role ID or null
   */
  getUserRoleId(): number | null {
    const user = this.getStoredUser();
    return user?.userRoleId || null;
  },

  /**
   * Get user's hospital code
   * @returns Hospital code or null
   */
  getHospitalCode(): string | null {
    const user = this.getStoredUser();
    return user?.hospitalCode9eDigit || null;
  },

  /**
   * Get user's display name
   * @returns Full name or username
   */
  getUserDisplayName(): string | null {
    const user = this.getStoredUser();
    if (!user) return null;
    
    if (user.fname && user.lname) {
      return `${user.fname} ${user.lname}`;
    }
    
    return user.username;
  },

  /**
   * Check if session might be expired based on last activity
   * @param timeoutMs - Session timeout in milliseconds
   * @returns True if session might be expired
   */
  isSessionExpired(timeoutMs: number = 15 * 60 * 1000): boolean {
    if (typeof window === 'undefined') return true;
    
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return true;
    
    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    
    return (now - lastActivityTime) > timeoutMs;
  },

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastActivity', Date.now().toString());
    }
  },

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('lastActivity');
    }
  },

  /**
   * Check if user has specific permission
   * @param permission - Permission to check
   * @returns True if user has permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getStoredUser();
    if (!user) return false;
    
    // Import permission check from config
    // This would need to be imported from your auth config
    // For now, basic role-based check
    switch (permission) {
      case 'canManageUsers':
        return user.userRoleId <= 2; // ADMIN or SUPERADMIN
      case 'canManageSystemData':
        return user.userRoleId === 1; // SUPERADMIN only
      case 'canAccessAllHospitals':
        return user.userRoleId <= 2; // ADMIN or SUPERADMIN
      case 'canExportData':
        return true; // All authenticated users
      case 'canDeleteData':
        return user.userRoleId <= 2; // ADMIN or SUPERADMIN
      default:
        return false;
    }
  }
};

// ============================================
// AUTO-REFRESH TOKEN SETUP
// ============================================

/**
 * Setup automatic token refresh
 * This will attempt to refresh the token before it expires
 */
export function setupAutoRefresh(): void {
  if (typeof window === 'undefined') return;

  // Check token validity every 5 minutes
  const checkInterval = 5 * 60 * 1000;
  
  setInterval(async () => {
    if (authUtils.isAuthenticated() && !authUtils.isSessionExpired()) {
      try {
        await authAPI.verifyToken();
      } catch (error) {
        console.warn('Token verification failed:', error);
        // Don't automatically logout, let the user handle it
      }
    }
  }, checkInterval);
}

// ============================================
// ACTIVITY TRACKING SETUP
// ============================================

/**
 * Setup user activity tracking
 * This updates the last activity timestamp on user interactions
 */
export function setupActivityTracking(): void {
  if (typeof window === 'undefined') return;

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  const updateActivity = () => {
    if (authUtils.isAuthenticated()) {
      authUtils.updateLastActivity();
    }
  };

  // Throttle activity updates to once per minute
  let lastUpdate = 0;
  const throttledUpdate = () => {
    const now = Date.now();
    if (now - lastUpdate > 60000) { // 1 minute
      updateActivity();
      lastUpdate = now;
    }
  };

  events.forEach(event => {
    document.addEventListener(event, throttledUpdate, true);
  });
}

// ============================================
// AUTHENTICATION GUARD
// ============================================

/**
 * Authentication guard for protecting routes
 * @param redirectTo - Where to redirect if not authenticated
 * @returns True if authenticated
 */
export async function requireAuth(redirectTo: string = '/login'): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Quick check with stored data
  if (!authUtils.isAuthenticated()) {
    window.location.href = redirectTo;
    return false;
  }

  // Verify with server if session might be expired
  if (authUtils.isSessionExpired()) {
    try {
      await authAPI.verifyToken();
      return true;
    } catch {
      window.location.href = redirectTo;
      return false;
    }
  }

  return true;
}

// ============================================
// INITIALIZE AUTH FEATURES
// ============================================

// Auto-setup when module loads
if (typeof window !== 'undefined') {
  setupAutoRefresh();
  setupActivityTracking();
}

// Export default auth API
export default authAPI;