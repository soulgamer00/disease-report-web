// frontend/src/lib/stores/index.ts
// ✅ Fixed central export for all stores
// Only export what actually exists in theme.store.ts

// ============================================
// THEME STORE - ONLY EXISTING EXPORTS
// ============================================
export { 
  themeStore,
  isDark,
  isLight,
  isSystemTheme,
  getThemeIcon,
  getThemeDisplayName,
  type Theme,
  type ThemeState
} from './theme.store';

// ============================================
// FUTURE STORES
// ============================================
// Export other stores here when created
// export { authStore } from './auth.store';
// export { userStore } from './user.store';
// export { notificationStore } from './notification.store';