// frontend/src/lib/stores/theme.store.ts
// ✅ Fixed Theme management store with proper implementation
// Simplified and working version for SvelteKit 5

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

// ============================================
// CONSTANTS
// ============================================

const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: Theme = 'system';

// ============================================
// UTILITIES
// ============================================

/**
 * Get system theme preference
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
  
  // Add transitioning class to prevent flash
  root.classList.add('theme-transitioning');
  
  // Apply theme
  root.setAttribute('data-theme', effectiveTheme);
  
  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(effectiveTheme);
  
  // Remove transitioning class after a short delay
  setTimeout(() => {
    root.classList.remove('theme-transitioning');
  }, 50);
}

/**
 * Update meta theme-color for mobile browsers
 */
function updateMetaThemeColor(theme: 'light' | 'dark'): void {
  if (!browser) return;
  
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const color = theme === 'dark' ? '#1e293b' : '#ffffff';
  
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', color);
  }
}

/**
 * Calculate effective theme based on theme setting and system preference
 */
function calculateEffectiveTheme(theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' {
  return theme === 'system' ? systemTheme : theme;
}

// ============================================
// INITIAL STATE
// ============================================

function createInitialState(): ThemeState {
  const systemTheme = getSystemTheme();
  const storedTheme = getStoredTheme();
  const effectiveTheme = calculateEffectiveTheme(storedTheme, systemTheme);
  
  return {
    theme: storedTheme,
    systemTheme,
    effectiveTheme,
    isLoading: false
  };
}

// ============================================
// STORE CREATION
// ============================================

function createThemeStore() {
  const initialState = createInitialState();
  const { subscribe, set, update } = writable<ThemeState>(initialState);
  
  // Apply initial theme
  if (browser) {
    applyTheme(initialState.effectiveTheme);
  }
  
  // Watch system theme changes
  if (browser) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      
      update(state => {
        const newEffectiveTheme = calculateEffectiveTheme(state.theme, newSystemTheme);
        
        // Apply theme if it changed
        if (newEffectiveTheme !== state.effectiveTheme) {
          applyTheme(newEffectiveTheme);
        }
        
        return {
          ...state,
          systemTheme: newSystemTheme,
          effectiveTheme: newEffectiveTheme
        };
      });
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Legacy browsers  
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }
  
  return {
    subscribe,
    
    /**
     * Set theme preference
     */
    setTheme: (newTheme: Theme) => {
      update(state => {
        const systemTheme = getSystemTheme();
        const effectiveTheme = calculateEffectiveTheme(newTheme, systemTheme);
        
        // Store theme preference
        storeTheme(newTheme);
        
        // Apply theme to DOM
        applyTheme(effectiveTheme);
        
        return {
          ...state,
          theme: newTheme,
          systemTheme,
          effectiveTheme
        };
      });
    },
    
    /**
     * Toggle between light and dark (skipping system)
     */
    toggle: () => {
      update(state => {
        // If currently system, toggle to opposite of effective theme
        // If light/dark, toggle to opposite
        const currentEffective = state.effectiveTheme;
        const newTheme: Theme = currentEffective === 'light' ? 'dark' : 'light';
        
        const systemTheme = getSystemTheme();
        const effectiveTheme = calculateEffectiveTheme(newTheme, systemTheme);
        
        // Store and apply
        storeTheme(newTheme);
        applyTheme(effectiveTheme);
        
        return {
          ...state,
          theme: newTheme,
          systemTheme,
          effectiveTheme
        };
      });
    },
    
    /**
     * Reset to system theme
     */
    reset: () => {
      update(state => {
        const systemTheme = getSystemTheme();
        const effectiveTheme = calculateEffectiveTheme('system', systemTheme);
        
        storeTheme('system');
        applyTheme(effectiveTheme);
        
        return {
          ...state,
          theme: 'system',
          systemTheme,
          effectiveTheme
        };
      });
    },
    
    /**
     * Initialize theme (call this in onMount)
     */
    init: () => {
      update(state => {
        const systemTheme = getSystemTheme();
        const storedTheme = getStoredTheme();
        const effectiveTheme = calculateEffectiveTheme(storedTheme, systemTheme);
        
        applyTheme(effectiveTheme);
        
        return {
          theme: storedTheme,
          systemTheme,
          effectiveTheme,
          isLoading: false
        };
      });
    },
    
    /**
     * Get current theme state (for non-reactive access)
     */
    getCurrentState: (): ThemeState => {
      let currentState: ThemeState = initialState;
      const unsubscribe = subscribe(state => {
        currentState = state;
      });
      unsubscribe();
      return currentState;
    }
  };
}

// ============================================
// EXPORT STORE INSTANCE
// ============================================

export const themeStore = createThemeStore();

// ============================================
// CONVENIENCE EXPORTS
// ============================================

// For components that just need to check current theme
export const isDark = () => {
  const state = themeStore.getCurrentState();
  return state.effectiveTheme === 'dark';
};

export const isLight = () => {
  const state = themeStore.getCurrentState();
  return state.effectiveTheme === 'light';
};

export const isSystemTheme = () => {
  const state = themeStore.getCurrentState();
  return state.theme === 'system';
};

// Theme icons for UI
export const getThemeIcon = (theme: Theme) => {
  switch (theme) {
    case 'light': return '☀️';
    case 'dark': return '🌙';
    case 'system': return '💻';
    default: return '💻';
  }
};

export const getThemeDisplayName = (theme: Theme) => {
  switch (theme) {
    case 'light': return 'โหมดสว่าง';
    case 'dark': return 'โหมดมืด';
    case 'system': return 'ตามระบบ';
    default: return 'ตามระบบ';
  }
};