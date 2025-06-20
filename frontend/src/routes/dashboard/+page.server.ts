// frontend/src/routes/dashboard/+page.server.ts
// ✅ SIMPLE Dashboard Server - เรียบง่าย เรียก API แค่พื้นฐาน

import type { PageServerLoad } from './$types';
import { apiClient } from '$lib/api/client';
import type { UserInfo } from '$lib/types/auth.types';

// ============================================
// API RESPONSE TYPES
// ============================================

interface PublicStatsResponse {
  totalDiseases?: number;
  totalPatients?: number;
  currentMonthPatients?: number;
  lastMonthPatients?: number;
  monthlyGrowth?: number;
}

interface HospitalItem {
  id: string;
  hospitalName: string;
  hospitalCode9eDigit: string;
}

// ============================================
// SIMPLE TYPES
// ============================================

interface SimpleStats {
  totalPatients: number;
  totalHospitals: number;
  totalDiseases: number;
  recentPatients: number;
}

interface SimpleDashboard {
  stats: SimpleStats;
}

// ============================================
// SIMPLE LOAD FUNCTION
// ============================================

export const load: PageServerLoad = async ({ cookies }) => {
  console.log('🔄 Loading dashboard with backend data...');
  
  // Auth check is handled by +layout.server.ts
  const accessToken = cookies.get('accessToken');
  const refreshToken = cookies.get('refreshToken');
  
  console.log('📋 Auth status:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken
  });
  
  try {
    // Initialize default stats
    let stats: SimpleStats = {
      totalPatients: 0,
      totalHospitals: 0,
      totalDiseases: 0,
      recentPatients: 0
    };
    
    let backendConnected = false;
    
    // Try to get stats from backend
    try {
      console.log('🌐 Attempting to fetch from /reports/public-stats...');
      const response = await apiClient.get<PublicStatsResponse>('/reports/public-stats');
      
      if (response.success && response.data) {
        backendConnected = true;
        stats = {
          totalPatients: response.data.totalPatients || 0,
          totalHospitals: 0, // Will update below
          totalDiseases: response.data.totalDiseases || 0,
          recentPatients: response.data.currentMonthPatients || 0
        };
        console.log('✅ Public stats fetched:', stats);
      } else {
        console.log('⚠️ Public stats response unsuccessful:', response);
      }
    } catch (error) {
      console.log('⚠️ Public stats fetch failed:', error instanceof Error ? error.message : error);
    }
    
    // Try to get hospitals count
    try {
      console.log('🌐 Attempting to fetch from /reports/hospitals...');
      const hospitalsResponse = await apiClient.get<HospitalItem[]>('/reports/hospitals');
      if (hospitalsResponse.success && hospitalsResponse.data) {
        stats.totalHospitals = hospitalsResponse.data.length || 0;
        console.log('✅ Hospitals count fetched:', stats.totalHospitals);
        backendConnected = true;
      } else {
        console.log('⚠️ Hospitals response unsuccessful:', hospitalsResponse);
      }
    } catch (error) {
      console.log('⚠️ Hospitals fetch failed:', error instanceof Error ? error.message : error);
    }
    
    // If no backend connection, use fallback data
    if (!backendConnected) {
      console.log('📦 Using fallback data - backend not available');
      stats = {
        totalPatients: 156,
        totalHospitals: 8,
        totalDiseases: 23,
        recentPatients: 12
      };
    }
    
    // Create user object (simplified - in real app would come from JWT or session)
    const user: UserInfo = {
      id: 'current-user',
      username: 'user',
      email: 'user@example.com',
      fname: 'ผู้ใช้',
      lname: 'ระบบ',
      userRoleId: 3, // Default to USER
      userRole: 'USER',
      hospitalCode9eDigit: null,
      hospital: {
        id: 'hospital-1',
        hospitalName: 'โรงพยาบาลหลัก',
        hospitalCode9eDigit: '123456789'
      },
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const dashboard: SimpleDashboard = { stats };
    
    console.log('✅ Dashboard loaded with stats:', stats);
    console.log('🔗 Backend connected:', backendConnected);
    
    return {
      dashboard,
      user,
      backendConnected,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Dashboard load error:', error);
    
    // Return minimal fallback
    return {
      dashboard: {
        stats: {
          totalPatients: 0,
          totalHospitals: 0,
          totalDiseases: 0,
          recentPatients: 0
        }
      },
      user: {
        id: 'fallback',
        username: 'fallback',
        email: null,
        fname: 'ผู้ใช้',
        lname: 'ระบบ',
        userRoleId: 3,
        userRole: 'USER',
        hospitalCode9eDigit: null,
        hospital: null,
        lastLoginAt: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      backendConnected: false,
      timestamp: new Date().toISOString()
    };
  }
};