// frontend/src/lib/api/dashboard.api.ts
// ✅ Dashboard API integration with real backend
// Fetch dashboard data from actual endpoints

import { apiClient } from './client';
import type { ApiResponse } from '$lib/types/api.types';

// ============================================
// DASHBOARD API TYPES
// ============================================

export interface DashboardStats {
  totalPatients: number;
  totalHospitals: number;
  totalDiseases: number;
  recentPatients: number;
  monthlyGrowth: number;
  activeUsers: number;
}

export interface DashboardActivity {
  id: string;
  type: 'patient_added' | 'user_created' | 'report_generated' | 'system_update';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  hospitalName?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  requiredRole: number;
  category: 'primary' | 'secondary';
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: DashboardActivity[];
  quickActions: QuickAction[];
}

// ============================================
// DASHBOARD API ENDPOINTS
// ============================================

export const dashboardAPI = {
  
  /**
   * Get dashboard statistics from backend
   */
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Get public stats from reports endpoint
      const response = await apiClient.get<{
        totalDiseases: number;
        totalPatients: number;
        currentMonthPatients: number;
        lastMonthPatients: number;
        monthlyGrowth: number;
      }>('/reports/public-stats');
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      // Get hospital count (assuming we have this endpoint)
      let totalHospitals = 0;
      try {
        const hospitalsResponse = await apiClient.get<any[]>('/reports/hospitals');
        totalHospitals = hospitalsResponse.data?.length || 0;
      } catch (error) {
        console.warn('Could not fetch hospital count:', error);
      }
      
      // Transform to dashboard format
      const dashboardStats: DashboardStats = {
        totalPatients: response.data.totalPatients,
        totalHospitals: totalHospitals,
        totalDiseases: response.data.totalDiseases,
        recentPatients: response.data.currentMonthPatients,
        monthlyGrowth: response.data.monthlyGrowth,
        activeUsers: 0, // Will need separate endpoint for this
      };
      
      return {
        success: true,
        data: dashboardStats,
        message: 'Dashboard stats fetched successfully'
      };
      
    } catch (error) {
      console.error('Dashboard stats API error:', error);
      return {
        success: false,
        data: {
          totalPatients: 0,
          totalHospitals: 0,
          totalDiseases: 0,
          recentPatients: 0,
          monthlyGrowth: 0,
          activeUsers: 0
        },
        message: 'Failed to fetch dashboard statistics'
      };
    }
  },
  
  /**
   * Get recent activities (mock for now, can be implemented later)
   */
  async getRecentActivities(): Promise<ApiResponse<DashboardActivity[]>> {
    try {
      // For now, generate mock activities based on recent patient data
      // In future, this could be a real audit log endpoint
      
      const activities: DashboardActivity[] = [
        {
          id: '1',
          type: 'system_update',
          title: 'ระบบเริ่มทำงาน',
          description: 'ระบบรายงานโรคพร้อมใช้งาน',
          timestamp: new Date().toISOString(),
          user: 'ระบบ'
        }
      ];
      
      return {
        success: true,
        data: activities,
        message: 'Recent activities fetched successfully'
      };
      
    } catch (error) {
      console.error('Recent activities API error:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch recent activities'
      };
    }
  },
  
  /**
   * Get quick actions based on user role
   */
  getQuickActions(userRoleId: number): QuickAction[] {
    const allActions: QuickAction[] = [
      // USER Actions
      {
        id: 'add-patient',
        title: 'เพิ่มรายงานผู้ป่วย',
        description: 'บันทึกข้อมูลผู้ป่วยใหม่',
        icon: 'plus-circle',
        route: '/patients/add',
        requiredRole: 3,
        category: 'primary'
      },
      {
        id: 'view-patients',
        title: 'ดูรายการผู้ป่วย',
        description: 'ดูรายการผู้ป่วยในโรงพยาบาล',
        icon: 'list',
        route: '/patients',
        requiredRole: 3,
        category: 'primary'
      },
      {
        id: 'view-reports',
        title: 'ดูรายงาน',
        description: 'ดูรายงานสถิติโรค',
        icon: 'chart-bar',
        route: '/reports',
        requiredRole: 3,
        category: 'primary'
      },
      {
        id: 'patient-history',
        title: 'ค้นหาประวัติผู้ป่วย',
        description: 'ค้นหาประวัติการรักษา',
        icon: 'history',
        route: '/patients/search',
        requiredRole: 3,
        category: 'secondary'
      },
      {
        id: 'export-data',
        title: 'ส่งออกข้อมูล',
        description: 'ส่งออกข้อมูลเป็น Excel',
        icon: 'download',
        route: '/reports/export',
        requiredRole: 3,
        category: 'secondary'
      },
      // ADMIN Actions
      {
        id: 'manage-users',
        title: 'จัดการผู้ใช้งาน',
        description: 'เพิ่ม แก้ไข ผู้ใช้งาน',
        icon: 'users',
        route: '/admin/users',
        requiredRole: 2,
        category: 'primary'
      },
      {
        id: 'generate-report',
        title: 'สร้างรายงาน',
        description: 'สร้างรายงานสถิติ',
        icon: 'chart',
        route: '/reports/generate',
        requiredRole: 2,
        category: 'secondary'
      },
      // SUPERADMIN Actions
      {
        id: 'manage-hospitals',
        title: 'จัดการโรงพยาบาล',
        description: 'เพิ่ม แก้ไข โรงพยาบาล',
        icon: 'building',
        route: '/admin/hospitals',
        requiredRole: 1,
        category: 'primary'
      },
      {
        id: 'manage-diseases',
        title: 'จัดการโรค',
        description: 'เพิ่ม แก้ไข ประเภทโรค',
        icon: 'virus',
        route: '/admin/diseases',
        requiredRole: 1,
        category: 'secondary'
      },
      {
        id: 'system-settings',
        title: 'ตั้งค่าระบบ',
        description: 'จัดการการตั้งค่าระบบ',
        icon: 'settings',
        route: '/admin/settings',
        requiredRole: 1,
        category: 'secondary'
      }
    ];
    
    // Filter actions based on user role
    return allActions.filter(action => userRoleId <= action.requiredRole);
  },
  
  /**
   * Get complete dashboard data
   */
  async getDashboardData(userRoleId: number): Promise<ApiResponse<DashboardData>> {
    try {
      console.log('🔄 Fetching dashboard data from backend...');
      
      // Fetch stats and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        this.getStats(),
        this.getRecentActivities()
      ]);
      
      // Get quick actions (no API call needed)
      const quickActions = this.getQuickActions(userRoleId);
      
      // Check if stats fetch was successful
      if (!statsResponse.success) {
        throw new Error(statsResponse.message || 'Failed to fetch stats');
      }
      
      const dashboardData: DashboardData = {
        stats: statsResponse.data!,
        recentActivities: activitiesResponse.data || [],
        quickActions
      };
      
      console.log('✅ Dashboard data fetched successfully:', {
        statsCount: Object.keys(dashboardData.stats).length,
        activitiesCount: dashboardData.recentActivities.length,
        actionsCount: dashboardData.quickActions.length
      });
      
      return {
        success: true,
        data: dashboardData,
        message: 'Dashboard data fetched successfully'
      };
      
    } catch (error) {
      console.error('❌ Dashboard data API error:', error);
      
      // Return minimal fallback data
      const fallbackData: DashboardData = {
        stats: {
          totalPatients: 0,
          totalHospitals: 0,
          totalDiseases: 0,
          recentPatients: 0,
          monthlyGrowth: 0,
          activeUsers: 0
        },
        recentActivities: [],
        quickActions: this.getQuickActions(userRoleId)
      };
      
      return {
        success: false,
        data: fallbackData,
        message: 'Failed to fetch dashboard data'
      };
    }
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default dashboardAPI;