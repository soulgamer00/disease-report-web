// src/routes/patients/+page.server.ts
// Server-side data loading for patients page

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Cookies } from '@sveltejs/kit';
import type { PatientVisitQueryParams, PatientVisitsListResponse, GenderEnum, PatientTypeEnum, PatientConditionEnum } from '$lib/types/backend';
import { buildApiUrl, API_ENDPOINTS } from '$lib/config';

// ============================================
// HELPER FUNCTION - FETCH PATIENT VISITS
// ============================================

/**
 * Fetch patient visits from backend API with server-side rendering
 */
async function fetchPatientVisits(
  cookies: Cookies,
  queryParams: PatientVisitQueryParams
): Promise<PatientVisitsListResponse> {
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
    const endpoint = `${API_ENDPOINTS.PATIENT_VISITS.LIST}${query ? `?${query}` : ''}`;
    
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
      
      // Handle other errors
      const errorData = await response.json().catch(() => ({}));
      throw error(response.status, errorData.message || `HTTP ${response.status}`);
    }
    
    const data: PatientVisitsListResponse = await response.json();
    
    if (!data.success) {
      throw error(500, data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย');
    }
    
    return data;
    
  } catch (err) {
    // Re-throw SvelteKit errors
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // Handle network and other errors
    console.error('Patient visits fetch error:', err);
    throw error(500, 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
}

// ============================================
// HELPER FUNCTION - PARSE QUERY PARAMETERS
// ============================================

/**
 * Parse and validate query parameters from URL search params
 */
function parseQueryParams(searchParams: URLSearchParams): PatientVisitQueryParams {
  const params: PatientVisitQueryParams = {};
  
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
  
  const diseaseId = searchParams.get('diseaseId');
  if (diseaseId && diseaseId.trim()) {
    params.diseaseId = diseaseId.trim();
  }
  
  const hospitalCode = searchParams.get('hospitalCode');
  if (hospitalCode && hospitalCode.trim()) {
    params.hospitalCode9eDigit = hospitalCode.trim();
  }
  
  const gender = searchParams.get('gender');
  if (gender && (gender === 'MALE' || gender === 'FEMALE')) {
    params.gender = gender as GenderEnum;
  }
  
  const patientType = searchParams.get('patientType');
  if (patientType && ['IPD', 'OPD', 'ACF'].includes(patientType)) {
    params.patientType = patientType as PatientTypeEnum;
  }
  
  const patientCondition = searchParams.get('patientCondition');
  if (patientCondition && ['UNKNOWN', 'RECOVERED', 'DIED', 'UNDER_TREATMENT'].includes(patientCondition)) {
    params.patientCondition = patientCondition as PatientConditionEnum;
  }
  
  // Date filters
  const startDate = searchParams.get('startDate');
  if (startDate && !isNaN(Date.parse(startDate))) {
    params.startDate = startDate;
  }
  
  const endDate = searchParams.get('endDate');
  if (endDate && !isNaN(Date.parse(endDate))) {
    params.endDate = endDate;
  }
  
  // Age filters
  const ageMin = searchParams.get('ageMin');
  if (ageMin && !isNaN(Number(ageMin))) {
    params.ageMin = Math.max(0, Number(ageMin));
  }
  
  const ageMax = searchParams.get('ageMax');
  if (ageMax && !isNaN(Number(ageMax))) {
    params.ageMax = Math.min(150, Number(ageMax));
  }
  
  // Sorting
  const sortBy = searchParams.get('sortBy');
  if (sortBy && ['illnessDate', 'diagnosisDate', 'fname', 'lname', 'createdAt', 'updatedAt'].includes(sortBy)) {
    params.sortBy = sortBy as 'illnessDate' | 'diagnosisDate' | 'fname' | 'lname' | 'createdAt' | 'updatedAt';
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
 * Server-side load function for patients page
 * Fetches patient visits data with filtering and pagination
 */
export const load: PageServerLoad = async ({ url, cookies, locals }) => {
  try {
    // Check if user is authenticated (should be handled by hooks.server.ts)
    if (!locals.isAuthenticated || !locals.user) {
      throw error(401, 'กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้');
    }
    
    // Parse query parameters from URL
    const queryParams = parseQueryParams(url.searchParams);
    
    // Set default values
    const finalParams: PatientVisitQueryParams = {
      page: 1,
      limit: 20,
      sortBy: 'illnessDate',
      sortOrder: 'desc',
      isActive: true,
      ...queryParams
    };
    
    // Fetch patient visits data
    const patientVisitsData = await fetchPatientVisits(cookies, finalParams);
    
    return {
      // Patient visits data
      patientVisits: patientVisitsData.data.patientVisits,
      pagination: patientVisitsData.data.pagination,
      
      // Current query parameters for form population
      currentQuery: finalParams,
      
      // User info for permission checks
      user: locals.user,
      
      // Success indicator
      success: true,
      message: patientVisitsData.message
    };
    
  } catch (err) {
    // Re-throw SvelteKit errors (authentication, not found, etc.)
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    // Handle unexpected errors
    console.error('Patients page load error:', err);
    throw error(500, 'เกิดข้อผิดพลาดในการโหลดหน้า');
  }
};