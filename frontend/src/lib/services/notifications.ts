// src/lib/services/notifications.ts
import { toastStore } from '$lib/stores';

/**
 * Shows a success notification.
 * @param title - The title of the notification.
 * @param message - The main message of the notification.
 */
export function showSuccess(title: string, message?: string) {
  toastStore.success(title, message);
}

/**
 * Shows an error notification.
 * @param title - The title of the notification.
 * @param message - The main message of the notification.
 */
export function showError(title: string, message?: string) {
  toastStore.error(title, message);
}

/**
 * Shows a warning notification.
 * @param title - The title of the notification.
 * @param message - The main message of the notification.
 */
export function showWarning(title: string, message?: string) {
  toastStore.warning(title, message);
}

/**
 * Shows an informational notification.
 * @param title - The title of the notification.
 * @param message - The main message of the notification.
 */
export function showInfo(title: string, message?: string) {
  toastStore.info(title, message);
}