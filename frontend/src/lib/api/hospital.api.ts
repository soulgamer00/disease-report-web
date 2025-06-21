// frontend/src/lib/api/hospital.api.ts
// ✅ Hospital API Client - Type-safe API calls to backend
// Used in Dashboard > การจัดการระบบ > จัดการโรงพยาบาล

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
  HospitalCodeMapping,
  HospitalDropdownItem,
} from '$lib/types/hospital.types';
import type { BaseResponse } from '$lib/types/common.types';

// ============================================
// HOSPITAL API CLIENT CLASS
// ============================================

export class HospitalAPI {
  
  // ============================================
  // PUBLIC ENDPOINTS (No authentication required)
  // ============================================

  /**
   * Get list of hospitals with pagination and filters
   * 🌐 Public endpoint - used for reports and dropdowns
   */
  static async getList(params?: HospitalQueryParams): Promise<HospitalListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.organizationType) queryParams.append('organizationType', params.organizationType);
      if (params?.healthServiceType) queryParams.append('healthServiceType', params.healthServiceType);
      if (params?.affiliation) queryParams.append('affiliation', params.affiliation);
      if (params?.province) queryParams.append('province', params.province);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const url = `/hospitals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<HospitalListResponse['data']>(url);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospitals');
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital list fetch error:', error);
      throw error;
    }
  }

  /**
   * Get hospital by ID
   * 🌐 Public endpoint
   */
  static async getById(id: string, includePopulations?: boolean): Promise<HospitalDetailResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (includePopulations) queryParams.append('includePopulations', 'true');
      
      const url = `/hospitals/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<HospitalDetailResponse['data']>(url);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospital details');
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital detail fetch error:', error);
      throw error;
    }
  }

  /**
   * Get hospital by hospital code
   * 🌐 Public endpoint
   */
  static async getByCode(code: string): Promise<HospitalDetailResponse> {
    try {
      const response = await apiClient.get<HospitalDetailResponse['data']>(`/hospitals/code/${code}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospital by code');
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital by code fetch error:', error);
      throw error;
    }
  }

  /**
   * Get hospital statistics summary
   * 🌐 Public endpoint
   */
  static async getStatistics(): Promise<HospitalStatisticsResponse> {
    try {
      const response = await apiClient.get<HospitalStatisticsResponse['data']>('/hospitals/statistics/summary');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospital statistics');
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital statistics fetch error:', error);
      throw error;
    }
  }

  /**
   * Get hospital codes mapping for dropdowns
   * 🌐 Public endpoint
   */
  static async getCodesMapping(): Promise<BaseResponse<{ hospitalCodes: HospitalCodeMapping; total: number; }>> {
    try {
      const response = await apiClient.get<{ hospitalCodes: HospitalCodeMapping; total: number; }>('/hospitals/codes/map');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch hospital codes');
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital codes fetch error:', error);
      throw error;
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS (Authentication required)
  // ============================================

  /**
   * Create new hospital
   * 🔐 Superadmin only
   */
  static async create(data: CreateHospitalRequest): Promise<HospitalCreateUpdateResponse> {
    try {
      const response = await apiClient.post<HospitalCreateUpdateResponse['data']>('/hospitals', data);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create hospital');
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital create error:', error);
      throw error;
    }
  }

  /**
   * Update existing hospital
   * 🔐 Superadmin only
   */
  static async update(id: string, data: UpdateHospitalRequest): Promise<HospitalCreateUpdateResponse> {
    try {
      const response = await apiClient.put<HospitalCreateUpdateResponse['data']>(`/hospitals/${id}`, data);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update hospital');
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital update error:', error);
      throw error;
    }
  }

  /**
   * Delete hospital (soft delete)
   * 🔐 Superadmin only
   */
  static async delete(id: string): Promise<HospitalDeleteResponse> {
    try {
      const response = await apiClient.delete<HospitalDeleteResponse['data']>(`/hospitals/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete hospital');
      }

      return {
        success: true,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital delete error:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITY METHODS (Frontend helpers)
  // ============================================

  /**
   * Get hospitals for dropdown options
   * Simplified data for form dropdowns
   */
  static async getDropdownOptions(activeOnly: boolean = true): Promise<HospitalDropdownItem[]> {
    try {
      const response = await this.getList({
        limit: 1000, // Get all hospitals
        isActive: activeOnly,
        sortBy: 'hospitalName',
        sortOrder: 'asc',
      });

      return response.data.hospitals.map(hospital => ({
        id: hospital.id,
        hospitalName: hospital.hospitalName,
        hospitalCode9eDigit: hospital.hospitalCode9eDigit,
        province: hospital.province || undefined,
        isActive: hospital.isActive,
      }));
    } catch (error) {
      console.error('Hospital dropdown options fetch error:', error);
      return [];
    }
  }

  /**
   * Search hospitals by name or code
   * Quick search functionality
   */
  static async search(query: string, limit: number = 10): Promise<HospitalInfo[]> {
    try {
      const response = await this.getList({
        search: query.trim(),
        limit,
        isActive: true,
        sortBy: 'hospitalName',
        sortOrder: 'asc',
      });

      return response.data.hospitals;
    } catch (error) {
      console.error('Hospital search error:', error);
      return [];
    }
  }

  /**
   * Check if hospital code exists
   * For form validation
   */
  static async checkCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await this.getByCode(code);
      
      // If we get a response, code exists
      if (response.success && response.data.hospital) {
        // If we're updating and this is the same hospital, it's OK
        if (excludeId && response.data.hospital.id === excludeId) {
          return false;
        }
        return true;
      }
      
      return false;
    } catch (error) {
      // If error is 404, code doesn't exist (which is what we want)
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      
      console.error('Hospital code check error:', error);
      // On other errors, assume it exists to be safe
      return true;
    }
  }

  /**
   * Get hospital count by filters
   * For statistics and counters
   */
  static async getCount(filters?: Pick<HospitalQueryParams, 'organizationType' | 'healthServiceType' | 'affiliation' | 'province' | 'isActive'>): Promise<number> {
    try {
      const response = await this.getList({
        ...filters,
        page: 1,
        limit: 1, // We only need the count from pagination
      });

      return response.data.pagination.total;
    } catch (error) {
      console.error('Hospital count fetch error:', error);
      return 0;
    }
  }

  /**
   * Health check for hospital service
   * Service diagnostics
   */
  static async healthCheck(): Promise<BaseResponse<{ service: string; status: string; }>> {
    try {
      const response = await apiClient.get<{ service: string; status: string; }>('/hospitals/health');
      
      return {
        success: true,
        message: response.message || 'Hospital service is healthy',
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Hospital health check error:', error);
      return {
        success: false,
        message: 'Hospital service health check failed',
        data: { service: 'hospital-management', status: 'unhealthy' },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// ============================================
// EXPORT DEFAULT INSTANCE
// ============================================

/**
 * Default hospital API instance
 * Use this for all hospital-related API calls
 */
export const hospitalAPI = HospitalAPI;

// ============================================
// EXPORT CONVENIENCE FUNCTIONS
// ============================================

/**
 * Quick hospital search
 * For autocomplete components
 */
export async function searchHospitals(query: string, limit?: number): Promise<HospitalInfo[]> {
  return hospitalAPI.search(query, limit);
}

/**
 * Get hospitals for dropdown
 * For form selects
 */
export async function getHospitalOptions(activeOnly?: boolean): Promise<HospitalDropdownItem[]> {
  return hospitalAPI.getDropdownOptions(activeOnly);
}

/**
 * Validate hospital code uniqueness
 * For form validation
 */
export async function validateHospitalCode(code: string, excludeId?: string): Promise<{ isValid: boolean; message?: string; }> {
  try {
    const exists = await hospitalAPI.checkCodeExists(code, excludeId);
    
    return {
      isValid: !exists,
      message: exists ? 'รหัสโรงพยาบาลนี้มีอยู่ในระบบแล้ว' : undefined,
    };
  } catch (error) {
    console.error('Hospital code validation error:', error);
    return {
      isValid: false,
      message: 'ไม่สามารถตรวจสอบรหัสโรงพยาบาลได้',
    };
  }
}

// ============================================
// TYPE EXPORTS FOR CONVENIENCE
// ============================================

export type {
  HospitalInfo,
  CreateHospitalRequest,
  UpdateHospitalRequest,
  HospitalQueryParams,
  HospitalListResponse,
  HospitalDetailResponse,
  HospitalCreateUpdateResponse,
  HospitalDeleteResponse,
  HospitalStatisticsResponse,
  HospitalDropdownItem,
} from '$lib/types/hospital.types';