// frontend/src/lib/stores/index.ts
// Central export for all stores
// ✅ Single point of import for stores

// ============================================
// THEME STORE
// ============================================
export { 
  themeStore, 
  themeUtils, 
  THEME_CONFIG,
  type Theme,
  type ThemeState,
  type ThemePreferences,
  type ThemeStore,
  type ThemeConfig,
  type ThemeColors,
  type ThemeTransitions
} from './theme.store';

// ============================================
// FUTURE STORES
// ============================================
// Export other stores here when created
// export { authStore } from './auth.store';
// export { userStore } from './user.store';
// export { notificationStore } from './notification.store';