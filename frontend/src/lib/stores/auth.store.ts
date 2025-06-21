// frontend/src/lib/stores/auth.store.ts
// ✅ FIXED Authentication Store - Prevents Race Conditions
// Properly syncs server-side and client-side authentication state

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import type { UserInfo } from '$lib/types/auth.types';
import { authAPI } from '$lib/api/auth.api';

// ============================================
// TYPES
// ============================================

export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // ✅ เพิ่มเพื่อป้องกัน race condition
  lastActivity: number;
}

export interface AuthDisplayInfo {
  fullName: string;
  roleName: string;
  roleColor: string;
  hospitalName: string;
  initials: string;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // เริ่มต้นเป็น loading
  error: null,
  isInitialized: false,
  lastActivity: Date.now(),
};

// ============================================
// AUTH STORE
// ============================================

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  /**
   * ✅ Verify token ในพื้นหลัง (ไม่ block UI)
   */
  const verifyTokenInBackground = async (): Promise<void> => {
    try {
      const response = await authAPI.verifyToken();
      
      if (response.success) {
        update(state => ({
          ...state,
          user: response.data.user,
          isAuthenticated: true,
          error: null,
          lastActivity: Date.now()
        }));
      }
    } catch (error) {
      console.warn('⚠️ Background token verification failed:', error);
      // ไม่ clear state ทันที - อาจเป็น network issue
    }
  };

  return {
    subscribe,
    
    /**
     * ✅ Initialize store with server-side data (ป้องกัน race condition)
     * เรียกจาก layout หรือ page component ที่ได้ data จาก server
     */
    initializeFromServer: (serverData: { user: UserInfo | null; isAuthenticated: boolean }) => {
      console.log('🔄 Initializing auth store from server data:', serverData);
      
      update(state => ({
        ...state,
        user: serverData.user,
        isAuthenticated: serverData.isAuthenticated,
        isLoading: false, // ✅ หยุด loading เมื่อได้ data จาก server
        isInitialized: true, // ✅ mark ว่า initialized แล้ว
        error: null,
        lastActivity: Date.now()
      }));

      // ✅ Sync กับ localStorage สำหรับ cross-tab
      if (browser && serverData.user) {
        localStorage.setItem('userInfo', JSON.stringify(serverData.user));
        localStorage.setItem('lastActivity', Date.now().toString());
      } else if (browser && !serverData.user) {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('lastActivity');
      }
    },

    /**
     * ✅ Initialize from client-side (fallback เมื่อไม่มี server data)
     */
    initializeFromClient: async (): Promise<void> => {
      if (!browser) return;
      
      try {
        console.log('🔄 Initializing auth store from client...');
        
        // ตรวจสอบ localStorage ก่อน
        const storedUser = localStorage.getItem('userInfo');
        const lastActivity = localStorage.getItem('lastActivity');
        
        if (storedUser) {
          const user: UserInfo = JSON.parse(storedUser);
          const lastActivityTime = lastActivity ? parseInt(lastActivity, 10) : 0;
          const now = Date.now();
          
          // ตรวจสอบว่า session หมดอายุหรือไม่ (15 นาที)
          const sessionTimeout = 15 * 60 * 1000;
          const isSessionExpired = (now - lastActivityTime) > sessionTimeout;
          
          if (!isSessionExpired) {
            // Session ยังไม่หมดอายุ - ใช้ข้อมูลจาก localStorage
            update(state => ({
              ...state,
              user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              lastActivity: now
            }));
            
            // ✅ Verify กับ server ในพื้นหลัง (ไม่ block UI)
            verifyTokenInBackground();
            return;
          }
        }
        
        // ไม่มีข้อมูลหรือ session หมดอายุ
        update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null
        }));
        
      } catch (error) {
        console.error('❌ Client auth initialization error:', error);
        
        update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: 'การเริ่มต้นระบบล้มเหลว'
        }));
      }
    },

    /**
     * Login action
     */
    login: async (credentials: { username: string; password: string }): Promise<void> => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const response = await authAPI.login(credentials);
        
        if (response.success) {
          update(state => ({
            ...state,
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
            lastActivity: Date.now()
          }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'เข้าสู่ระบบล้มเหลว';
        
        update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage
        }));
        
        throw error;
      }
    },

    /**
     * Logout action
     */
    logout: async (): Promise<void> => {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        await authAPI.logout();
      } catch (error) {
        console.warn('⚠️ Logout API call failed:', error);
        // ดำเนินการ logout ต่อไปแม้ API call ล้มเหลว
      }
      
      // Clear state และ storage
      update(state => ({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null
      }));
      
      if (browser) {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('lastActivity');
        // Clear cookies ด้วย
        document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    },

    /**
     * Update user profile
     */
    updateUser: (user: UserInfo): void => {
      update(state => ({
        ...state,
        user,
        lastActivity: Date.now()
      }));
      
      if (browser) {
        localStorage.setItem('userInfo', JSON.stringify(user));
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    },

    /**
     * Update last activity
     */
    updateActivity: (): void => {
      update(state => ({
        ...state,
        lastActivity: Date.now()
      }));
      
      if (browser) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    },

    /**
     * Clear error
     */
    clearError: (): void => {
      update(state => ({ ...state, error: null }));
    },

    /**
     * Force refresh auth state
     */
    refresh: async (): Promise<void> => {
      if (!browser) return;
      
      update(state => ({ ...state, isLoading: true }));
      
      try {
        const response = await authAPI.verifyToken();
        
        if (response.success) {
          update(state => ({
            ...state,
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: Date.now()
          }));
        } else {
          throw new Error('Token verification failed');
        }
      } catch (error) {
        console.error('❌ Auth refresh failed:', error);
        
        update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'การตรวจสอบสิทธิ์ล้มเหลว'
        }));
      }
    }
  };
}

// ============================================
// STORE INSTANCE
// ============================================

export const authStore = createAuthStore();

// ============================================
// DERIVED STORES
// ============================================

/**
 * ✅ Safe derived store - รอ initialization ก่อน
 */
export const userDisplayInfo = derived(
  authStore,
  ($authStore): AuthDisplayInfo | null => {
    if (!$authStore.isInitialized || !$authStore.user) {
      return null;
    }

    const user = $authStore.user;
    
    return {
      fullName: user.fname && user.lname ? `${user.fname} ${user.lname}` : user.username,
      roleName: getRoleDisplayName(user.userRoleId),
      roleColor: getRoleColor(user.userRoleId),
      hospitalName: user.hospital?.hospitalName || 'ไม่ระบุ',
      initials: getInitials(user.fname, user.lname, user.username)
    };
  }
);

/**
 * ✅ Check if ready to show UI (ป้องกัน flash of loading)
 */
export const isAuthReady = derived(
  authStore,
  ($authStore) => $authStore.isInitialized && !$authStore.isLoading
);

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRoleDisplayName(roleId: number): string {
  switch (roleId) {
    case 1: return 'ผู้ดูแลระบบหลัก';
    case 2: return 'ผู้ดูแลระบบ';
    case 3: return 'ผู้ใช้งาน';
    default: return 'ไม่ระบุ';
  }
}

function getRoleColor(roleId: number): string {
  switch (roleId) {
    case 1: return 'text-red-600 bg-red-50';
    case 2: return 'text-blue-600 bg-blue-50';
    case 3: return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

function getInitials(fname?: string, lname?: string, username?: string): string {
  if (fname && lname) {
    return `${fname.charAt(0)}${lname.charAt(0)}`.toUpperCase();
  }
  
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  
  return 'U';
}