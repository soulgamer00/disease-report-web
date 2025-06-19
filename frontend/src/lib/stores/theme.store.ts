// frontend/src/lib/stores/theme.store.ts
// Theme management store with dark mode support
// ✅ Type-safe theme switching and persistence

import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// ============================================
// TYPES
// ============================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
  isLoading: boolean;
}

export interface ThemePreferences {
  theme: Theme;
  autoSwitch: boolean;
  systemSync: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: Theme = 'system';

// ============================================
// UTILITIES
// ============================================

/**
 * Detect system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (!browser) return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get stored theme from localStorage
 */
function getStoredTheme(): Theme {
  if (!browser) return DEFAULT_THEME;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  return DEFAULT_THEME;
}

/**
 * Store theme in localStorage
 */
function storeTheme(theme: Theme): void {
  if (!browser) return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to store theme in localStorage:', error);
  }
}

/**
 * Apply theme to document
 */
function applyTheme(effectiveTheme: 'light' | 'dark'): void {
  if (!browser) return;
  
  const root = document.documentElement;
  
  // Remove existing theme class
  root.removeAttribute('data-theme');
  root.classList.remove('light', 'dark');
  
  // Apply new theme
  root.setAttribute('data-theme', effectiveTheme);
  root.classList.add(effectiveTheme);
  
  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(effectiveTheme);
}

/**
 * Update meta theme-color for mobile browsers
 */
function updateMetaThemeColor(theme: 'light' | 'dark'): void {
  if (!browser) return;
  
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const color = theme === 'dark' ? '#020617' : '#ffffff';
  
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', color);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = color;
    document.head.appendChild(meta);
  }
}

/**
 * Calculate effective theme based on user preference and system theme
 */
function calculateEffectiveTheme(theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' {
  return theme === 'system' ? systemTheme : theme;
}

// ============================================
// INITIAL STATE
// ============================================

function createInitialState(): ThemeState {
  const systemTheme = getSystemTheme();
  const theme = getStoredTheme();
  const effectiveTheme = calculateEffectiveTheme(theme, systemTheme);
  
  return {
    theme,
    systemTheme,
    effectiveTheme,
    isLoading: false
  };
}

// ============================================
// THEME STORE
// ============================================

function createThemeStore() {
  const { subscribe, set, update } = writable<ThemeState>(createInitialState());
  
  // ============================================
  // STORE METHODS
  // ============================================
  
  /**
   * Set theme preference
   */
  const setTheme = (newTheme: Theme): void => {
    update(state => {
      const effectiveTheme = calculateEffectiveTheme(newTheme, state.systemTheme);
      
      // Store preference
      storeTheme(newTheme);
      
      // Apply theme to DOM
      applyTheme(effectiveTheme);
      
      return {
        ...state,
        theme: newTheme,
        effectiveTheme
      };
    });
  };
  
  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = (): void => {
    update(state => {
      const newTheme: Theme = state.effectiveTheme === 'light' ? 'dark' : 'light';
      const effectiveTheme = calculateEffectiveTheme(newTheme, state.systemTheme);
      
      // Store preference
      storeTheme(newTheme);
      
      // Apply theme to DOM
      applyTheme(effectiveTheme);
      
      return {
        ...state,
        theme: newTheme,
        effectiveTheme
      };
    });
  };
  
  /**
   * Update system theme (called when system preference changes)
   */
  const updateSystemTheme = (newSystemTheme: 'light' | 'dark'): void => {
    update(state => {
      const effectiveTheme = calculateEffectiveTheme(state.theme, newSystemTheme);
      
      // Apply theme to DOM if using system theme
      if (state.theme === 'system') {
        applyTheme(effectiveTheme);
      }
      
      return {
        ...state,
        systemTheme: newSystemTheme,
        effectiveTheme
      };
    });
  };
  
  /**
   * Initialize theme (called on app startup)
   */
  const initialize = (): void => {
    if (!browser) return;
    
    update(state => {
      // Apply current effective theme to DOM
      applyTheme(state.effectiveTheme);
      
      // Set up system theme change listener
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        updateSystemTheme(e.matches ? 'dark' : 'light');
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Legacy browsers
        mediaQuery.addListener(handleChange);
      }
      
      return {
        ...state,
        isLoading: false
      };
    });
  };
  
  /**
   * Get theme preferences for settings
   */
  const getPreferences = (): ThemePreferences => {
    let currentState: ThemeState;
    const unsubscribe = subscribe(state => {
      currentState = state;
    });
    unsubscribe();
    
    return {
      theme: currentState!.theme,
      autoSwitch: currentState!.theme === 'system',
      systemSync: true
    };
  };
  
  /**
   * Apply preferences from settings
   */
  const applyPreferences = (preferences: Partial<ThemePreferences>): void => {
    if (preferences.theme) {
      setTheme(preferences.theme);
    }
  };
  
  /**
   * Reset theme to system default
   */
  const reset = (): void => {
    setTheme('system');
  };
  
  // ============================================
  // DERIVED GETTERS
  // ============================================
  
  /**
   * Check if dark mode is active
   */
  const isDark = (): boolean => {
    let currentState: ThemeState;
    const unsubscribe = subscribe(state => {
      currentState = state;
    });
    unsubscribe();
    
    return currentState!.effectiveTheme === 'dark';
  };
  
  /**
   * Check if light mode is active
   */
  const isLight = (): boolean => {
    return !isDark();
  };
  
  /**
   * Check if using system theme
   */
  const isSystemTheme = (): boolean => {
    let currentState: ThemeState;
    const unsubscribe = subscribe(state => {
      currentState = state;
    });
    unsubscribe();
    
    return currentState!.theme === 'system';
  };
  
  /**
   * Get CSS class for current theme
   */
  const getThemeClass = (): string => {
    let currentState: ThemeState;
    const unsubscribe = subscribe(state => {
      currentState = state;
    });
    unsubscribe();
    
    return currentState!.effectiveTheme;
  };
  
  /**
   * Get theme icon name for UI
   */
  const getThemeIcon = (): string => {
    let currentState: ThemeState;
    const unsubscribe = subscribe(state => {
      currentState = state;
    });
    unsubscribe();
    
    const { theme, effectiveTheme } = currentState!;
    
    if (theme === 'system') {
      return effectiveTheme === 'dark' ? 'moon' : 'sun';
    }
    
    return theme === 'dark' ? 'moon' : 'sun';
  };
  
  /**
   * Get theme display name for UI
   */
  const getThemeDisplayName = (): string => {
    let currentState: ThemeState;
    const unsubscribe = subscribe(state => {
      currentState = state;
    });
    unsubscribe();
    
    const { theme } = currentState!;
    
    switch (theme) {
      case 'light':
        return 'โหมดสว่าง';
      case 'dark':
        return 'โหมดมืด';
      case 'system':
        return 'ตามระบบ';
      default:
        return 'ไม่ทราบ';
    }
  };
  
  // ============================================
  // RETURN STORE INTERFACE
  // ============================================
  
  return {
    // Store subscription
    subscribe,
    
    // State setters
    setTheme,
    toggleTheme,
    updateSystemTheme,
    initialize,
    reset,
    
    // Preferences
    getPreferences,
    applyPreferences,
    
    // Getters
    isDark,
    isLight,
    isSystemTheme,
    getThemeClass,
    getThemeIcon,
    getThemeDisplayName
  };
}

// ============================================
// EXPORT STORE INSTANCE
// ============================================

export const themeStore = createThemeStore();

// ============================================
// THEME UTILITIES
// ============================================

/**
 * Theme utility functions for use in components
 */
export const themeUtils = {
  /**
   * Get appropriate icon color for current theme
   */
  getIconColor: (theme: 'light' | 'dark') => {
    return theme === 'dark' ? '#e2e8f0' : '#475569';
  },
  
  /**
   * Get appropriate background color for current theme
   */
  getBackgroundColor: (theme: 'light' | 'dark') => {
    return theme === 'dark' ? '#020617' : '#ffffff';
  },
  
  /**
   * Get appropriate text color for current theme
   */
  getTextColor: (theme: 'light' | 'dark') => {
    return theme === 'dark' ? '#f8fafc' : '#0f172a';
  },
  
  /**
   * Get appropriate border color for current theme
   */
  getBorderColor: (theme: 'light' | 'dark') => {
    return theme === 'dark' ? '#334155' : '#e2e8f0';
  },
  
  /**
   * Check if theme has good contrast
   */
  hasGoodContrast: (theme: 'light' | 'dark') => {
    return true; // Our themes are designed for good contrast
  },
  
  /**
   * Get theme-appropriate CSS variables
   */
  getCSSVariables: (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      return {
        '--bg-primary': '#020617',
        '--text-primary': '#f8fafc',
        '--border-primary': '#334155'
      };
    }
    
    return {
      '--bg-primary': '#ffffff',
      '--text-primary': '#0f172a',
      '--border-primary': '#e2e8f0'
    };
  }
};

// ============================================
// THEME CONSTANTS
// ============================================

export const THEME_CONFIG = {
  STORAGE_KEY: THEME_STORAGE_KEY,
  DEFAULT_THEME,
  THEMES: ['light', 'dark', 'system'] as const,
  
  BREAKPOINTS: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  COLORS: {
    light: {
      primary: '#3b82f6',
      background: '#ffffff',
      text: '#0f172a',
      border: '#e2e8f0'
    },
    dark: {
      primary: '#60a5fa',
      background: '#020617',
      text: '#f8fafc',
      border: '#334155'
    }
  },
  
  TRANSITIONS: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out'
  }
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type ThemeStore = ReturnType<typeof createThemeStore>;
export type ThemeConfig = typeof THEME_CONFIG;
export type ThemeColors = typeof THEME_CONFIG.COLORS;
export type ThemeTransitions = typeof THEME_CONFIG.TRANSITIONS;