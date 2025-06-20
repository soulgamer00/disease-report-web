// frontend/src/routes/dashboard/+page.server.ts
// ✅ TEMPORARY BYPASS VERSION - For testing only
// Remove auth checks to fix redirect loop

import type { PageServerLoad } from './$types';

// ============================================
// TYPES (Same as before)
// ============================================

export interface DashboardStats {
  totalPatients: number;
  totalHospitals: number;
  totalDiseases: number;
  recentPatients: number;
  monthlyGrowth: number;
  activeUsers: number;
}

export interface RecentActivity {
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
  recentActivities: RecentActivity[];
  quickActions: QuickAction[];
  userInfo: {
    fullName: string;
    roleName: string;
    hospitalName: string | null;
    canAccessAllHospitals: boolean;
  };
}

// ============================================
// MOCK DATA FOR TESTING
// ============================================

const MOCK_QUICK_ACTIONS: QuickAction[] = [
  // USER Actions
  {
    id: 'add-patient',
    title: 'เพิ่มรายงานผู้ป่วย',
    description: 'บันทึกข้อมูลผู้ป่วยใหม่',
    icon: 'plus-circle',
    route: '/dashboard', // ชั่วคราวให้ไปที่ dashboard
    requiredRole: 3,
    category: 'primary'
  },
  {
    id: 'view-patients',
    title: 'ดูรายการผู้ป่วย',
    description: 'ดูรายการผู้ป่วยในโรงพยาบาล',
    icon: 'list',
    route: '/dashboard', // ชั่วคราวให้ไปที่ dashboard
    requiredRole: 3,
    category: 'primary'
  },
  {
    id: 'patient-history',
    title: 'ค้นหาประวัติผู้ป่วย',
    description: 'ค้นหาประวัติการรักษา',
    icon: 'history',
    route: '/dashboard', // ชั่วคราว
    requiredRole: 3,
    category: 'secondary'
  },
  {
    id: 'export-data',
    title: 'ส่งออกข้อมูล',
    description: 'ส่งออกข้อมูลเป็น Excel',
    icon: 'download',
    route: '/dashboard', // ชั่วคราว
    requiredRole: 3,
    category: 'secondary'
  }
];

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    type: 'patient_added',
    title: 'เพิ่มรายงานผู้ป่วยใหม่',
    description: 'ผู้ป่วยโรคไข้เลือดออก - เพศหญิง อายุ 25 ปี',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    user: 'นางสาวสมหญิง ใจดี',
    hospitalName: 'โรงพยาบาลทดสอบ'
  },
  {
    id: '2',
    type: 'report_generated',
    title: 'สร้างรายงานรายเดือน',
    description: 'รายงานสถิติผู้ป่วยประจำเดือน ' + new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    user: 'นายแพทย์สมชาย มั่นคง'
  },
  {
    id: '3',
    type: 'user_created',
    title: 'เพิ่มผู้ใช้งานใหม่',
    description: 'เจ้าหน้าที่ใหม่เข้าร่วมระบบ',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    user: 'ผู้ดูแลระบบ'
  }
];

// ============================================
// SIMPLIFIED LOAD FUNCTION - NO AUTH CHECKS
// ============================================

export const load: PageServerLoad = async () => {
  console.log('🚧 Dashboard loading - BYPASS MODE (no auth checks)');
  
  try {
    // Mock dashboard data - no API calls
    const mockStats: DashboardStats = {
      totalPatients: 150,
      totalHospitals: 5,
      totalDiseases: 25,
      recentPatients: 12,
      monthlyGrowth: 8.5,
      activeUsers: 45
    };
    
    const dashboardData: DashboardData = {
      stats: mockStats,
      recentActivities: MOCK_ACTIVITIES,
      quickActions: MOCK_QUICK_ACTIONS,
      userInfo: {
        fullName: 'ผู้ใช้ทดสอบ',
        roleName: 'ผู้ใช้งาน',
        hospitalName: 'โรงพยาบาลทดสอบ',
        canAccessAllHospitals: false
      }
    };
    
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      fullName: 'ผู้ใช้ทดสอบ',
      roleId: 3, // USER role
      roleName: 'ผู้ใช้งาน',
      hospitalCode: null,
      hospitalName: 'โรงพยาบาลทดสอบ'
    };
    
    console.log('✅ Mock data prepared successfully');
    
    return {
      dashboard: dashboardData,
      user: mockUser
    };
    
  } catch (error) {
    console.error('❌ Error in dashboard load:', error);
    
    // Return minimal fallback data
    return {
      dashboard: {
        stats: {
          totalPatients: 0,
          totalHospitals: 0,
          totalDiseases: 0,
          recentPatients: 0,
          monthlyGrowth: 0,
          activeUsers: 0
        },
        recentActivities: [],
        quickActions: [],
        userInfo: {
          fullName: 'Unknown User',
          roleName: 'ผู้ใช้งาน',
          hospitalName: null,
          canAccessAllHospitals: false
        }
      },
      user: {
        id: 'fallback-user',
        username: 'fallback',
        fullName: 'Fallback User',
        roleId: 3,
        roleName: 'ผู้ใช้งาน',
        hospitalCode: null,
        hospitalName: null
      }
    };
  }
};