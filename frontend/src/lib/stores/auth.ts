// frontend/src/lib/stores/auth.ts
// Authentication store with hybrid approach (Memory + localStorage cache)

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { authAPI } from '$lib/api';
import type { UserInfo, LoginRequest } from '$lib/types/backend';

// ============================================
// TYPES
// ============================================

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastVerified: number | null;
}

interface StoredUserData {
  user: UserInfo;
  timestamp: number;
}

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEY = 'auth_user';
const VERIFY_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours

// ============================================
// INITIAL STATE
// ============================================

const createInitialState = (): AuthState => {
  if (!browser) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastVerified: null,
    };
  }

  // Try to load cached user data
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { user, timestamp }: StoredUserData = JSON.parse(stored);
      
      // Check if cache is still valid
      if (Date.now() - timestamp < MAX_CACHE_AGE) {
        return {
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          lastVerified: timestamp,
        };
      } else {
        // Cache expired, remove it
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (error) {
    console.warn('Failed to load cached user data:', error);
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    lastVerified: null,
  };
};

// ============================================
// STORE CREATION
// ============================================

const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>(createInitialState());

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const saveUserToStorage = (user: UserInfo) => {
    if (!browser) return;
    
    try {
      const data: StoredUserData = {
        user,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save user to localStorage:', error);
    }
  };

  const clearStorage = () => {
    if (!browser) return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  };

  const setLoading = (loading: boolean) => {
    update(state => ({ ...state, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    update(state => ({ ...state, error }));
  };

  const setUser = (user: UserInfo | null) => {
    const now = Date.now();
    if (user) {
      saveUserToStorage(user);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastVerified: now,
      });
    } else {
      clearStorage();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastVerified: null,
      });
    }
  };

  // ============================================
  // AUTHENTICATION ACTIONS
  // ============================================

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        return true;
      } else {
        setError('เข้าสู่ระบบไม่สำเร็จ');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);

    try {
      // Call logout API to clear httpOnly cookies
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API error:', error);
      // Continue with logout even if API fails
    } finally {
      // Clear local state regardless of API result
      setUser(null);
      setLoading(false);
      
      // Redirect to login page
      if (browser) {
        goto('/login');
      }
    }
  };

  const verify = async (): Promise<boolean> => {
    const currentState = get({ subscribe });
    
    // Don't verify if already loading or recently verified
    if (currentState.isLoading || 
        (currentState.lastVerified && Date.now() - currentState.lastVerified < VERIFY_INTERVAL)) {
      return currentState.isAuthenticated;
    }

    try {
      const response = await authAPI.verify();
      
      if (response.success && response.data.user) {
        // Update user data with fresh info from server
        setUser(response.data.user);
        return true;
      } else {
        // Verification failed, clear auth state
        setUser(null);
        return false;
      }
    } catch (error: any) {
      console.warn('Auth verification failed:', error);
      
      // If it's an auth error, clear the state
      if (error?.status === 401) {
        setUser(null);
        return false;
      }
      
      // For other errors, keep current state but don't update timestamp
      return currentState.isAuthenticated;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await authAPI.getProfile();
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.warn('Failed to refresh profile:', error);
    }
  };

  const checkAuth = async (): Promise<boolean> => {
    const currentState = get({ subscribe });
    
    // If we have cached user data, return true immediately
    // and verify in background
    if (currentState.user && currentState.isAuthenticated) {
      // Background verification
      verify();
      return true;
    }
    
    // No cached data, need to verify first
    return await verify();
  };

  // ============================================
  // AUTO-INITIALIZATION
  // ============================================

  // Auto-verify on store creation if we have cached data
  if (browser) {
    const initialState = get({ subscribe });
    if (initialState.user && initialState.isAuthenticated) {
      // Verify in background without blocking
      setTimeout(() => verify(), 100);
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Store subscription
    subscribe,
    
    // Actions
    login,
    logout,
    verify,
    refreshProfile,
    checkAuth,
    
    // Utilities
    setError,
    clearError: () => setError(null),
  };
};

// ============================================
// DERIVED STORES
// ============================================

export const authStore = createAuthStore();

// Derived stores for convenience
export const user = derived(authStore, $auth => $auth.user);
export const isAuthenticated = derived(authStore, $auth => $auth.isAuthenticated);
export const isLoading = derived(authStore, $auth => $auth.isLoading);
export const authError = derived(authStore, $auth => $auth.error);

// User role helpers
export const userRole = derived(user, $user => $user?.userRole || null);
export const isAdmin = derived(user, $user => 
  $user?.userRole === 'ADMIN' || $user?.userRole === 'SUPERADMIN'
);
export const isSuperAdmin = derived(user, $user => 
  $user?.userRole === 'SUPERADMIN'
);

// Hospital info
export const userHospital = derived(user, $user => $user?.hospital || null);
export const hospitalCode = derived(user, $user => $user?.hospitalCode9eDigit || null);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if user has specific role
 */
export const hasRole = (requiredRole: 'USER' | 'ADMIN' | 'SUPERADMIN'): boolean => {
  const currentUser = get(user);
  if (!currentUser) return false;
  
  const roleHierarchy = {
    'USER': 1,
    'ADMIN': 2,
    'SUPERADMIN': 3,
  };
  
  const userLevel = roleHierarchy[currentUser.userRole];
  const requiredLevel = roleHierarchy[requiredRole];
  
  return userLevel >= requiredLevel;
};

/**
 * Get user display name
 */
export const getUserDisplayName = (): string => {
  const currentUser = get(user);
  return currentUser?.name || currentUser?.username || 'ผู้ใช้งาน';
};

/**
 * Check if user belongs to specific hospital
 */
export const belongsToHospital = (hospitalCode: string): boolean => {
  const currentUser = get(user);
  return currentUser?.hospitalCode9eDigit === hospitalCode;
};

// Export default
export default authStore;