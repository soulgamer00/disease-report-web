// src/lib/api/hospital.api.ts
// ✅ Hospital API client with type-safe fetch calls
// Pure client-side API integration (no server-side code)

import { apiClient } from './client';
import type {
  HospitalInfo,
  CreateHospitalRequest,
  UpdateHospitalRequest,
  HospitalQueryParams,
  HospitalListResponse,
  HospitalDetailResponse,
  HospitalCreateUpdateResponse,
  HospitalDeleteResponse,
  HospitalStatisticsResponse,
  HospitalCodeMapping
} from '$lib/types/hospital.types';
import type { ApiResponse } from '$lib/types/api.types';

// ============================================
// HOSPITAL API CLIENT
// ============================================

export const hospitalAPI = {
  
  /**
   * Get list of hospitals with pagination and filters
   * @param params Query parameters for filtering and pagination
   */
  async getList(params: HospitalQueryParams = {}): Promise<HospitalListResponse> {
    try {
      const queryString = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryString.set('page', params.page.toString());
      if (params.limit) queryString.set('limit', params.limit.toString());
      
      // Add filters
      if (params.search) queryString.set('search', params.search);
      if (params.organizationType) queryString.set('organizationType', params.organizationType);
      if (params.healthServiceType) queryString.set('healthServiceType', params.healthServiceType);
      if (params.affiliation) queryString.set('affiliation', params.affiliation);
      if (params.isActive !== undefined) queryString.set('isActive', params.isActive.toString());
      
      // Add sorting
      if (params.sortBy) queryString.set('sortBy', params.sortBy);
      if (params.sortOrder) queryString.set('sortOrder', params.sortOrder);
      
      const url = `/hospitals${queryString.toString() ? `?${queryString.toString()}` : ''}`;
      
      const response = await apiClient.get<HospitalListResponse['data']>(url);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospitals');
      }
      
      return {
        success: true,
        message: 'Hospitals fetched successfully',
        data: response.data!
      };
      
    } catch (error) {
      console.error('Hospital list API error:', error);
      throw error;
    }
  },
  
  /**
   * Get hospital by ID
   * @param id Hospital UUID
   */
  async getById(id: string): Promise<HospitalDetailResponse> {
    try {
      const response = await apiClient.get<HospitalDetailResponse['data']>(`/hospitals/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospital');
      }
      
      return {
        success: true,
        message: 'Hospital fetched successfully',
        data: response.data!
      };
      
    } catch (error) {
      console.error('Hospital detail API error:', error);
      throw error;
    }
  },
  
  /**
   * Get hospital by hospital code
   * @param code Hospital code (9 digits new format)
   */
  async getByCode(code: string): Promise<HospitalDetailResponse> {
    try {
      const response = await apiClient.get<HospitalDetailResponse['data']>(`/hospitals/code/${code}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospital');
      }
      
      return {
        success: true,
        message: 'Hospital fetched successfully',
        data: response.data!
      };
      
    } catch (error) {
      console.error('Hospital by code API error:', error);
      throw error;
    }
  },
  
  /**
   * Create new hospital (Superadmin only)
   * @param hospitalData Hospital creation data
   */
  async create(hospitalData: CreateHospitalRequest): Promise<HospitalCreateUpdateResponse> {
    try {
      const response = await apiClient.post<HospitalCreateUpdateResponse['data']>('/hospitals', hospitalData as Record<string, any>);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create hospital');
      }
      
      return {
        success: true,
        message: 'Hospital created successfully',
        data: response.data!
      };
      
    } catch (error) {
      console.error('Hospital create API error:', error);
      throw error;
    }
  },
  
  /**
   * Update hospital (Superadmin only)
   * @param id Hospital UUID
   * @param hospitalData Hospital update data
   */
  async update(id: string, hospitalData: UpdateHospitalRequest): Promise<HospitalCreateUpdateResponse> {
    try {
      const response = await apiClient.put<HospitalCreateUpdateResponse['data']>(`/hospitals/${id}`, hospitalData as Record<string, any>);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update hospital');
      }
      
      return {
        success: true,
        message: 'Hospital updated successfully',
        data: response.data!
      };
      
    } catch (error) {
      console.error('Hospital update API error:', error);
      throw error;
    }
  },
  
  /**
   * Delete hospital (Superadmin only)
   * @param id Hospital UUID
   */
  async delete(id: string): Promise<HospitalDeleteResponse> {
    try {
      const response = await apiClient.delete<HospitalDeleteResponse['data']>(`/hospitals/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete hospital');
      }
      
      return {
        success: true,
        message: 'Hospital deleted successfully',
        data: response.data!
      };
      
    } catch (error) {
      console.error('Hospital delete API error:', error);
      throw error;
    }
  },
  
  /**
   * Get hospital statistics summary
   */
  async getStatistics(): Promise<HospitalStatisticsResponse> {
    try {
      const response = await apiClient.get<HospitalStatisticsResponse['data']>('/hospitals/statistics/summary');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospital statistics');
      }
      
      return {
        success: true,
        message: 'Hospital statistics fetched successfully',
        data: response.data!
      };
      
    } catch (error) {
      console.error('Hospital statistics API error:', error);
      throw error;
    }
  },
  
  /**
   * Get hospital codes mapping (for dropdowns)
   */
  async getCodeMapping(): Promise<ApiResponse<HospitalCodeMapping[]>> {
    try {
      const response = await apiClient.get<HospitalCodeMapping[]>('/hospitals/codes/map');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospital codes');
      }
      
      return {
        success: true,
        message: 'Hospital codes fetched successfully',
        data: response.data!
      };
      
    } catch (error) {
      console.error('Hospital codes API error:', error);
      throw error;
    }
  },
  
  /**
   * Health check for hospital service
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await apiClient.get<{ status: string; timestamp: string }>('/hospitals/health');
      
      if (!response.success) {
        throw new Error('Hospital service is not healthy');
      }
      
      return response;
      
    } catch (error) {
      console.error('Hospital health check error:', error);
      throw error;
    }
  }
};

// ============================================
// HOSPITAL API UTILITIES
// ============================================

/**
 * Search hospitals with debouncing support
 * @param searchTerm Search term
 * @param filters Additional filters
 */
export async function searchHospitals(
  searchTerm: string, 
  filters: Partial<HospitalQueryParams> = {}
): Promise<HospitalInfo[]> {
  try {
    const response = await hospitalAPI.getList({
      search: searchTerm,
      ...filters,
      limit: 50 // Limit search results
    });
    
    return response.data.hospitals;
    
  } catch (error) {
    console.error('Hospital search error:', error);
    return [];
  }
}

/**
 * Get hospitals for dropdown selection
 */
export async function getHospitalDropdownOptions(): Promise<Array<{ value: string; label: string; code: string }>> {
  try {
    const response = await hospitalAPI.getCodeMapping();
    
    return response.data?.map(hospital => ({
      value: hospital.code,
      label: hospital.name,
      code: hospital.code
    })) || [];
    
  } catch (error) {
    console.error('Hospital dropdown options error:', error);
    return [];
  }
}

/**
 * Validate hospital code format
 * @param code Hospital code
 */
export function validateHospitalCode(code: string): boolean {
  // 9 digit new format validation
  return /^\d{9}$/.test(code);
}

/**
 * Format hospital display name
 * @param hospital Hospital info
 */
export function formatHospitalDisplayName(hospital: HospitalInfo): string {
  const parts = [hospital.hospitalName];
  
  if (hospital.province) {
    parts.push(`(${hospital.province})`);
  }
  
  return parts.join(' ');
}

/**
 * Get hospital location string
 * @param hospital Hospital info
 */
export function getHospitalLocation(hospital: HospitalInfo): string {
  const parts = [];
  
  if (hospital.subdistrict) parts.push(hospital.subdistrict);
  if (hospital.district) parts.push(hospital.district);
  if (hospital.province) parts.push(hospital.province);
  
  return parts.join(', ') || 'ไม่ระบุที่อยู่';
}

/**
 * Get hospital status display
 * @param isActive Hospital active status
 */
export function getHospitalStatusDisplay(isActive: boolean): { text: string; class: string } {
  return isActive 
    ? { text: 'เปิดใช้งาน', class: 'text-green-600 bg-green-100' }
    : { text: 'ปิดใช้งาน', class: 'text-red-600 bg-red-100' };
}