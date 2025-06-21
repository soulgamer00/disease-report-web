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
// ✅ Removed ApiResponse import - not needed since we use specific response types

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
        credentials
      );
      
      if (response.success) {
        // Store user info in cookie (secure, httpOnly-like behavior)
        if (typeof window !== 'undefined') {
          // เก็บใน cookie แทน localStorage
          const userData = JSON.stringify(response.data.user);
          document.cookie = `userData=${encodeURIComponent(userData)}; path=/; secure; samesite=strict; max-age=604800`; // 7 days
          
          // ยังเก็บใน localStorage ไว้เป็น backup (optional)
          localStorage.setItem('userInfo', userData);
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
        // Clear cookie
        document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Clear localStorage
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
        requestData
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
        passwordData
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
  async getHealthStatus(): Promise<{ success: boolean; data: { status: string; timestamp: string } }> {
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
      // Clear localStorage
      localStorage.removeItem('userInfo');
      localStorage.removeItem('lastActivity');
      
      // Clear cookies
      document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
};