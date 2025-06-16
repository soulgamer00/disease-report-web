// src/routes/admin/hospitals/+page.server.ts
// Server-side data loading for hospitals management page

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Cookies } from '@sveltejs/kit';
import { buildApiUrl, API_ENDPOINTS } from '$lib/config';

// ============================================
// TYPES
// ============================================

interface HospitalQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationType?: string;
  healthServiceType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

// ✅ แก้ไข Hospital interface ให้ตรงกับ backend
interface Hospital {
  id: string;
  hospitalName: string;
  hospitalCode9eDigit: string;
  hospitalCode9Digit: string | null;    // ✅ แก้ไข: เอา ? ออก
  hospitalCode5Digit: string | null;    // ✅ แก้ไข: เอา ? ออก
  organizationType: string | null;      // ✅ แก้ไข: เอา ? ออก
  healthServiceType: string | null;     // ✅ แก้ไข: เอา ? ออก
  affiliation: string | null;           // ✅ แก้ไข: เอา ? ออก
  departmentDivision: string | null;    // ✅ แก้ไข: เอา ? ออก
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    patientVisits: number;
    populations: number;
    users: number;
  };
}

interface HospitalsListResponse {
  success: boolean;
  message: string;
  data: {
    hospitals: Hospital[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// ============================================
// HELPER FUNCTION - FETCH HOSPITALS
// ============================================

/**
 * Fetch hospitals from backend API with server-side rendering
 */
async function fetchHospitals(
  cookies: Cookies,
  queryParams: HospitalQueryParams
): Promise<HospitalsListResponse> {
  try {
    // Get authentication cookies
    const accessToken = cookies.get('accessToken');
    const refreshToken = cookies.get('refreshToken');
    
    // Build query string from parameters
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.HOSPITALS.LIST}${query ? `?${query}` : ''}`;
    
    // Make request to backend with cookies for authentication
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${accessToken || ''}; refreshToken=${refreshToken || ''}`
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        throw error(401, 'กรุณาเข้าสู่ระบบใหม่');
      }
      
      // Handle forbidden errors
      if (response.status === 403) {
        throw error(403, 'ไม่มีสิทธิ์เข้าถึงข้อมูลโรงพยาบาล');
      }
      
      // Handle other errors
      const errorData = await response.json().catch(() => ({}));
      throw error(response.status, errorData.message || `HTTP ${response.status}`);
    }
    
    const data: HospitalsListResponse = await response.json();
    
    if (!data.success) {
      throw error(500, data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล');
    }
    
    return data;
    
  } catch (err) {
    // Re-throw SvelteKit errors
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // Handle network and other errors
    console.error('Hospitals fetch error:', err);
    throw error(500, 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
}

// ============================================
// HELPER FUNCTION - PARSE QUERY PARAMETERS
// ============================================

/**
 * Parse and validate query parameters from URL search params
 */
function parseQueryParams(searchParams: URLSearchParams): HospitalQueryParams {
  const params: HospitalQueryParams = {};
  
  // Pagination
  const page = searchParams.get('page');
  if (page && !isNaN(Number(page))) {
    params.page = Math.max(1, Number(page));
  }
  
  const limit = searchParams.get('limit');
  if (limit && !isNaN(Number(limit))) {
    params.limit = Math.min(100, Math.max(1, Number(limit))); // Cap at 100
  }
  
  // Search and filters
  const search = searchParams.get('search');
  if (search && search.trim()) {
    params.search = search.trim();
  }
  
  const organizationType = searchParams.get('organizationType');
  if (organizationType && organizationType.trim()) {
    params.organizationType = organizationType.trim();
  }
  
  const healthServiceType = searchParams.get('healthServiceType');
  if (healthServiceType && healthServiceType.trim()) {
    params.healthServiceType = healthServiceType.trim();
  }
  
  // Sorting
  const sortBy = searchParams.get('sortBy');
  if (sortBy && ['hospitalName', 'hospitalCode9eDigit', 'organizationType', 'createdAt', 'updatedAt'].includes(sortBy)) {
    params.sortBy = sortBy;
  }
  
  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    params.sortOrder = sortOrder as 'asc' | 'desc';
  }
  
  // Active filter
  const isActive = searchParams.get('isActive');
  if (isActive === 'true' || isActive === 'false') {
    params.isActive = isActive === 'true';
  }
  
  return params;
}

// ============================================
// PAGE SERVER LOAD FUNCTION
// ============================================

/**
 * Server-side load function for hospitals management page
 * Fetches hospitals data with filtering and pagination
 */
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
  try {
    // Check if user is authenticated and has admin privileges
    if (!locals.isAuthenticated || !locals.user) {
      throw error(401, 'กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้');
    }
    
    // Check if user has admin role (Admin or SuperAdmin)
    if (locals.user.userRoleId > 2) {
      throw error(403, 'ไม่มีสิทธิ์เข้าถึงการจัดการโรงพยาบาล');
    }
    
    // Parse query parameters from URL
    const queryParams = parseQueryParams(url.searchParams);
    
    // Set default values
    const finalParams: HospitalQueryParams = {
      page: 1,
      limit: 20,
      sortBy: 'hospitalName',
      sortOrder: 'asc',
      isActive: true,
      ...queryParams
    };
    
    // Fetch hospitals data
    const hospitalsData = await fetchHospitals(cookies, finalParams);
    
    return {
      // Hospitals data
      hospitals: hospitalsData.data.hospitals,
      pagination: hospitalsData.data.pagination,
      
      // Current query parameters for form population
      currentQuery: finalParams,
      
      // User info for permission checks
      user: locals.user,
      
      // Success indicator
      success: true,
      message: hospitalsData.message
    };
    
  } catch (err) {
    // Re-throw SvelteKit errors (authentication, not found, etc.)
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // Handle unexpected errors
    console.error('Hospitals page load error:', err);
    throw error(500, 'เกิดข้อผิดพลาดในการโหลดหน้า');
  }
};