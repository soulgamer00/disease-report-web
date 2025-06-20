// frontend/src/routes/dashboard/$types.ts
// ✅ Updated Dashboard Types with user data from cookies

import type { UserInfo } from '$lib/types/auth.types';

// ============================================
// SIMPLE DASHBOARD TYPES
// ============================================

export interface SimpleStats {
  totalPatients: number;
  totalHospitals: number;
  totalDiseases: number;
  recentPatients: number;
}

export interface SimpleDashboard {
  stats: SimpleStats;
}

// ============================================
// LAYOUT DATA - Updated to include user
// ============================================

export interface LayoutData {
  user: UserInfo | null;  // ✅ Added user data from cookie
  isAuthenticated: boolean;
  currentPath: string;
}

// ============================================
// PAGE DATA
// ============================================

export interface PageData extends LayoutData {
  dashboard: SimpleDashboard;
  user: UserInfo;  // Page-specific user data (required)
}