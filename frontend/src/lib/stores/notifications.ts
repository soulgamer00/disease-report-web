// src/lib/stores/notifications.ts
import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const createToastStore = () => {
  const { subscribe, update } = writable<Toast[]>([]);

  const removeToast = (id: string) => {
    update(toasts => toasts.filter(toast => toast.id !== id));
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, duration: 5000, ...toast };
    
    update(toasts => [...toasts, newToast]);
    
    if (newToast.duration) {
      setTimeout(() => removeToast(id), newToast.duration);
    }
    return id;
  };

  return {
    subscribe,
    add: addToast,
    remove: removeToast,
    success: (title: string, message?: string, duration?: number) => addToast({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) => addToast({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) => addToast({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) => addToast({ type: 'info', title, message, duration }),
  };
};

export const toastStore = createToastStore();