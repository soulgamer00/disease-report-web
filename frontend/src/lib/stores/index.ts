// frontend/src/lib/stores/index.ts
// Central export for all Svelte stores

import type { ComponentType } from 'svelte';

// ============================================
// AUTHENTICATION STORES
// ============================================

export {
  // Main auth store
  authStore,
  
  // Derived stores
  user,
  isAuthenticated,
  isLoading,
  authError,
  userRole,
  isAdmin,
  isSuperAdmin,
  userHospital,
  hospitalCode,
  
  // Utility functions
  hasRole,
  getUserDisplayName,
  belongsToHospital,
} from './auth';

// Re-export default for convenience
export { default as auth } from './auth';

// ============================================
// UI STORES (for future use)
// ============================================

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import authStore from './auth';

// Theme store
const createThemeStore = () => {
  const defaultTheme = 'light';
  const initialTheme = browser 
    ? localStorage.getItem('theme') || defaultTheme 
    : defaultTheme;
  
  const { subscribe, set } = writable<'light' | 'dark'>(initialTheme as 'light' | 'dark');
  
  return {
    subscribe,
    setTheme: (theme: 'light' | 'dark') => {
      set(theme);
      if (browser) {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
    },
    toggleTheme: () => {
      subscribe(currentTheme => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set(newTheme);
        if (browser) {
          localStorage.setItem('theme', newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
        }
        return newTheme;
      })();
    }
  };
};

export const themeStore = createThemeStore();

// Sidebar store (for mobile responsiveness)
const createSidebarStore = () => {
  const { subscribe, set, update } = writable({
    isOpen: false,
    isPinned: browser ? localStorage.getItem('sidebar-pinned') === 'true' : false,
  });
  
  return {
    subscribe,
    toggle: () => update(state => ({ ...state, isOpen: !state.isOpen })),
    open: () => update(state => ({ ...state, isOpen: true })),
    close: () => update(state => ({ ...state, isOpen: false })),
    pin: () => {
      update(state => ({ ...state, isPinned: true }));
      if (browser) localStorage.setItem('sidebar-pinned', 'true');
    },
    unpin: () => {
      update(state => ({ ...state, isPinned: false }));
      if (browser) localStorage.setItem('sidebar-pinned', 'false');
    },
  };
};

export const sidebarStore = createSidebarStore();

// Loading store (global loading indicator)
const createLoadingStore = () => {
  const { subscribe, set, update } = writable({
    isLoading: false,
    message: '',
    tasks: new Set<string>(),
  });
  
  return {
    subscribe,
    start: (taskId: string = 'default', message: string = 'กำลังโหลด...') => {
      update(state => {
        const newTasks = new Set(state.tasks);
        newTasks.add(taskId);
        return {
          isLoading: true,
          message,
          tasks: newTasks,
        };
      });
    },
    stop: (taskId: string = 'default') => {
      update(state => {
        const newTasks = new Set(state.tasks);
        newTasks.delete(taskId);
        return {
          isLoading: newTasks.size > 0,
          message: newTasks.size > 0 ? state.message : '',
          tasks: newTasks,
        };
      });
    },
    stopAll: () => {
      set({
        isLoading: false,
        message: '',
        tasks: new Set(),
      });
    },
  };
};

export const loadingStore = createLoadingStore();

// Toast/Notification store
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

const createToastStore = () => {
  const { subscribe, update } = writable<Toast[]>([]);
  
  const removeToast = (id: string) => {
    update(toasts => toasts.filter(toast => toast.id !== id));
  };
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      dismissible: true,
      duration: 5000,
      ...toast,
    };
    
    update(toasts => [...toasts, newToast]);
    
    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  };
  
  return {
    subscribe,
    add: addToast,
    remove: removeToast,
    clear: () => update(() => []),
    success: (title: string, message?: string, duration?: number) => 
      addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) => 
      addToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) => 
      addToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) => 
      addToast({ type: 'info', title, message, duration }),
  };
};

export const toastStore = createToastStore();

// Modal store
interface Modal {
  id: string;
  component: ComponentType;
  props?: Record<string, unknown>;
  options?: {
    closable?: boolean;
    backdrop?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  };
}

const createModalStore = () => {
  const { subscribe, set, update } = writable<Modal | null>(null);
  
  return {
    subscribe,
    open: (
      component: ComponentType, 
      props?: Record<string, unknown>, 
      options?: Modal['options']
    ) => {
      const modal: Modal = {
        id: Math.random().toString(36).substr(2, 9),
        component,
        props,
        options: {
          closable: true,
          backdrop: true,
          size: 'md',
          ...options,
        },
      };
      set(modal);
      return modal.id;
    },
    close: () => set(null),
    update: (props: Record<string, unknown>) => {
      update(modal => modal ? { ...modal, props: { ...modal.props, ...props } } : null);
    },
  };
};

export const modalStore = createModalStore();

// Form validation store
const createFormStore = () => {
  const { subscribe, set, update } = writable<{
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
    isValid: boolean;
  }>({
    errors: {},
    touched: {},
    isValid: true,
  });
  
  return {
    subscribe,
    setError: (field: string, errors: string[]) => {
      update(state => ({
        ...state,
        errors: { ...state.errors, [field]: errors },
        isValid: Object.keys({ ...state.errors, [field]: errors }).length === 0,
      }));
    },
    clearError: (field: string) => {
      update(state => {
        const newErrors = { ...state.errors };
        delete newErrors[field];
        return {
          ...state,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    setTouched: (field: string, touched: boolean = true) => {
      update(state => ({
        ...state,
        touched: { ...state.touched, [field]: touched },
      }));
    },
    reset: () => {
      set({
        errors: {},
        touched: {},
        isValid: true,
      });
    },
  };
};

export const formStore = createFormStore();

// ============================================
// STORE UTILITIES
// ============================================

/**
 * Create a persisted store that saves to localStorage
 */
export const createPersistedStore = <T>(
  key: string,
  initialValue: T,
  serializer: {
    parse: (text: string) => T;
    stringify: (value: T) => string;
  } = JSON
) => {
  let storedValue = initialValue;
  
  if (browser) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        storedValue = serializer.parse(stored);
      }
    } catch (error) {
      console.warn(`Failed to parse stored value for key "${key}":`, error);
    }
  }
  
  const { subscribe, set, update } = writable<T>(storedValue);
  
  return {
    subscribe,
    set: (value: T) => {
      set(value);
      if (browser) {
        try {
          localStorage.setItem(key, serializer.stringify(value));
        } catch (error) {
          console.warn(`Failed to persist value for key "${key}":`, error);
        }
      }
    },
    update: (updater: (value: T) => T) => {
      update((currentValue) => {
        const newValue = updater(currentValue);
        if (browser) {
          try {
            localStorage.setItem(key, serializer.stringify(newValue));
          } catch (error) {
            console.warn(`Failed to persist updated value for key "${key}":`, error);
          }
        }
        return newValue;
      });
    },
    reset: () => {
      set(initialValue);
      if (browser) {
        localStorage.removeItem(key);
      }
    },
  };
};

/**
 * Create a debounced store that delays updates
 */
export const createDebouncedStore = <T>(initialValue: T, delay: number = 300) => {
  const { subscribe, set } = writable<T>(initialValue);
  let timeout: ReturnType<typeof setTimeout>;
  
  return {
    subscribe,
    set: (value: T) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        set(value);
      }, delay);
    },
    setImmediate: (value: T) => {
      clearTimeout(timeout);
      set(value);
    },
  };
};

// ============================================
// TYPE EXPORTS
// ============================================

export type { Toast };
export type { Modal };

// ============================================
// STORE COLLECTIONS
// ============================================

// UI Stores
export const ui = {
  theme: themeStore,
  sidebar: sidebarStore,
  loading: loadingStore,
  toast: toastStore,
  modal: modalStore,
  form: formStore,
};

// All stores for easy access
export const stores = {
  auth: authStore,
  ui,
};