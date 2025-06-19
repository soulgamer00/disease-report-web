// frontend/src/lib/stores/theme.store.ts
// ✅ COMPLETE Theme management store for SvelteKit 5
// Fixed all missing functions and exports

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
// STORE CREATION
// ============================================

/**
 * Create theme store with all methods
 */
function createThemeStore() {
  // Initial state
  const initialState: ThemeState = {
    theme: DEFAULT_THEME,
    systemTheme: 'light',
    effectiveTheme: 'light',
    isLoading: true
  };

  const { subscribe, update } = writable<ThemeState>(initialState);

  return {
    subscribe,
    
    /**
     * Set theme
     */
    setTheme: (newTheme: Theme) => {
      update(state => {
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
     * Toggle between light and dark (ignores system)
     */
    toggle: () => {
      update(state => {
        const newTheme: Theme = state.effectiveTheme === 'dark' ? 'light' : 'dark';
        
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
        
        // Listen for system theme changes
        if (browser) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          mediaQuery.addEventListener('change', (e) => {
            update(currentState => {
              const newSystemTheme = e.matches ? 'dark' : 'light';
              const newEffectiveTheme = calculateEffectiveTheme(currentState.theme, newSystemTheme);
              
              if (currentState.theme === 'system') {
                applyTheme(newEffectiveTheme);
              }
              
              return {
                ...currentState,
                systemTheme: newSystemTheme,
                effectiveTheme: newEffectiveTheme
              };
            });
          });
        }
        
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