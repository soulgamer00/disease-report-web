// frontend/src/lib/stores/user.store.ts
// ✅ Fixed charAt undefined error and improved type safety
// User state management store for SvelteKit 5

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { UserInfo, UserRoleId } from '$lib/types/auth.types';
import { authUtils, authAPI } from '$lib/api/auth.api';
import { 
  hasPermission, 
  canAccessAllHospitals, 
  canManageUsers,
  getRoleDisplayName,
  getRoleColor,
  type Permission 
} from '$lib/utils/permission.utils';

// ============================================
// TYPES
// ============================================

export interface UserState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
  permissions: Permission[];
}

export interface UserDisplayInfo {
  fullName: string;
  roleName: string;
  roleColor: string;
  hospitalName: string;
  initials: string;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  lastActivity: Date.now(),
  permissions: [],
};

// ============================================
// USER STORE
// ============================================

function createUserStore() {
  const { subscribe, set, update } = writable<UserState>(initialState);

  return {
    subscribe,
    
    /**
     * Initialize user store (check existing auth)
     */
    init: async (): Promise<void> => {
      if (!browser) return;
      
      try {
        update(state => ({ ...state, isLoading: true, error: null }));
        
        // Check if user is already authenticated
        if (!authUtils.isAuthenticated()) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lastActivity: Date.now(),
            permissions: [],
          });
          return;
        }
        
        // Get user info from storage first (for immediate UI)
        const storedUser = authUtils.getStoredUser();
        if (storedUser) {
          update(state => ({
            ...state,
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
          }));
        }
        
        // Verify with backend
        const response = await authAPI.verifyToken();
        if (response.success && response.data.user) {
          const user = response.data.user;
          
          // Update storage with fresh data
          setStoredUser(user);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: Date.now(),
            permissions: [], // Will be calculated by derived store
          });
        } else {
          // Token invalid, clear auth
          authUtils.clearAuthData();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired',
            lastActivity: Date.now(),
            permissions: [],
          });
        }
      } catch (error) {
        console.error('User store init error:', error);
        
        // Clear invalid auth data
        authUtils.clearAuthData();
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed',
          lastActivity: Date.now(),
          permissions: [],
        });
      }
    },
    
    /**
     * Set user after successful login
     */
    setUser: (user: UserInfo): void => {
      setStoredUser(user);
      
      update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastActivity: Date.now(),
      }));
    },
    
    /**
     * Clear user data (logout)
     */
    clearUser: (): void => {
      authUtils.clearAuthData();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivity: Date.now(),
        permissions: [],
      });
    },
    
    /**
     * Update last activity timestamp
     */
    updateActivity: (): void => {
      update(state => ({
        ...state,
        lastActivity: Date.now(),
      }));
    },
    
    /**
     * Set loading state
     */
    setLoading: (isLoading: boolean): void => {
      update(state => ({
        ...state,
        isLoading,
      }));
    },
    
    /**
     * Set error state
     */
    setError: (error: string | null): void => {
      update(state => ({
        ...state,
        error,
      }));
    },
    
    /**
     * Refresh user data from backend
     */
    refresh: async (): Promise<void> => {
      if (!browser) return;
      
      try {
        update(state => ({ ...state, isLoading: true, error: null }));
        
        const response = await authAPI.getProfile();
        if (response.success && response.data) {
          const user = response.data;
          
          // Store user info in localStorage
          if (browser) {
            localStorage.setItem('userInfo', JSON.stringify(user));
          }
          
          update(state => ({
            ...state,
            user,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
          }));
        } else {
          throw new Error('Failed to refresh user data');
        }
      } catch (error) {
        console.error('User refresh error:', error);
        
        update(state => ({
          ...state,
          isLoading: false,
          error: 'Failed to refresh user data',
        }));
      }
    },
    
    /**
     * Get current state (non-reactive)
     */
    getCurrentState: (): UserState => {
      let currentState = initialState;
      const unsubscribe = subscribe(state => {
        currentState = state;
      });
      unsubscribe();
      return currentState;
    },
  };
}

// ============================================
// EXPORT STORE INSTANCE
// ============================================

export const userStore = createUserStore();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safe string access with fallback
 */
function safeString(value: any, fallback: string = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * Generate initials from name parts
 */
function generateInitials(fname?: string, lname?: string): string {
  const first = safeString(fname);
  const last = safeString(lname);
  
  const firstChar = first.charAt(0) || '';
  const lastChar = last.charAt(0) || '';
  
  if (firstChar && lastChar) {
    return `${firstChar}${lastChar}`.toUpperCase();
  } else if (firstChar) {
    return firstChar.toUpperCase();
  } else if (lastChar) {
    return lastChar.toUpperCase();
  } else {
    return 'U'; // Default for "User"
  }
}

/**
 * Generate full name from name parts
 */
function generateFullName(fname?: string, lname?: string, username?: string): string {
  const first = safeString(fname);
  const last = safeString(lname);
  const user = safeString(username);
  
  // Try fname + lname first
  const fullName = `${first} ${last}`.trim();
  if (fullName) {
    return fullName;
  }
  
  // Fallback to username
  if (user) {
    return user;
  }
  
  // Last resort
  return 'ผู้ใช้งาน';
}

// ============================================
// DERIVED STORES
// ============================================

/**
 * User display information (formatted for UI)
 * ✅ Fixed charAt undefined error with safe string handling
 */
export const userDisplay = derived(
  userStore,
  ($userStore): UserDisplayInfo | null => {
    if (!$userStore.user) return null;
    
    const user = $userStore.user;
    
    // Safely handle potentially undefined name fields
    const fullName = generateFullName(user.fname, user.lname, user.username);
    const initials = generateInitials(user.fname, user.lname);
    
    return {
      fullName,
      roleName: getRoleDisplayName(user.userRoleId),
      roleColor: getRoleColor(user.userRoleId),
      hospitalName: user.hospital?.hospitalName || 'ไม่ระบุโรงพยาบาล',
      initials,
    };
  }
);

/**
 * User permissions (calculated based on role)
 */
export const userPermissions = derived(
  userStore,
  ($userStore): {
    hasPermission: (permission: Permission) => boolean;
    canAccessAllHospitals: boolean;
    canManageUsers: boolean;
    isSuperadmin: boolean;
    isAdmin: boolean;
    isUser: boolean;
  } => {
    const roleId = $userStore.user?.userRoleId;
    
    if (!roleId) {
      return {
        hasPermission: () => false,
        canAccessAllHospitals: false,
        canManageUsers: false,
        isSuperadmin: false,
        isAdmin: false,
        isUser: false,
      };
    }
    
    return {
      hasPermission: (permission: Permission) => hasPermission(roleId, permission),
      canAccessAllHospitals: canAccessAllHospitals(roleId),
      canManageUsers: canManageUsers(roleId),
      isSuperadmin: roleId === 1,
      isAdmin: roleId <= 2,
      isUser: roleId <= 3,
    };
  }
);

/**
 * Authentication status
 */
export const authStatus = derived(
  userStore,
  ($userStore) => ({
    isAuthenticated: $userStore.isAuthenticated,
    isLoading: $userStore.isLoading,
    error: $userStore.error,
    user: $userStore.user,
  })
);

/**
 * User role information
 */
export const userRole = derived(
  userStore,
  ($userStore): {
    roleId: UserRoleId | null;
    roleName: string;
    roleColor: string;
  } => {
    const roleId = $userStore.user?.userRoleId || null;
    
    return {
      roleId,
      roleName: roleId ? getRoleDisplayName(roleId) : 'ไม่ทราบ',
      roleColor: roleId ? getRoleColor(roleId) : 'text-gray-600 bg-gray-50 border-gray-200',
    };
  }
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Helper function to safely set user data
 */
function setStoredUser(user: UserInfo): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userInfo', JSON.stringify(user));
  }
}

/**
 * Quick check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const state = userStore.getCurrentState();
  return state.isAuthenticated;
};

/**
 * Quick get current user
 */
export const getCurrentUser = (): UserInfo | null => {
  const state = userStore.getCurrentState();
  return state.user;
};

/**
 * Quick get user role ID
 */
export const getCurrentUserRole = (): UserRoleId | null => {
  const user = getCurrentUser();
  return user?.userRoleId || null;
};

/**
 * Quick permission check
 */
export const checkPermission = (permission: Permission): boolean => {
  const roleId = getCurrentUserRole();
  return roleId ? hasPermission(roleId, permission) : false;
};

/**
 * Initialize user store (call this in root layout)
 */
export const initUserStore = async (): Promise<void> => {
  await userStore.init();
};