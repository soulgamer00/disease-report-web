// frontend/src/routes/dashboard/$types.ts
// ✅ SIMPLE Dashboard Types - เรียบง่าย ไม่ซับซ้อน

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
// LAYOUT DATA
// ============================================

export interface LayoutData {
  isAuthenticated: boolean;
  currentPath: string;
}

// ============================================
// PAGE DATA
// ============================================

export interface PageData extends LayoutData {
  dashboard: SimpleDashboard;
  user: UserInfo;
}