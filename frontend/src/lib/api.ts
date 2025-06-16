// src/lib/api.ts

import { APP_CONFIG, API_ENDPOINTS, buildApiUrl } from './config';
import type {
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthProfileResponse,
  AuthVerifyResponse,
  AuthChangePasswordResponse,
  PatientVisitsListResponse,
  PatientVisitDetailResponse,
  PatientVisitStatisticsResponse,
  DiseasesListResponse,
  DiseaseDetailResponse,
  ReportPatientVisitDataResponse,
  ReportIncidenceDataResponse,
  ReportGenderDataResponse,
  LoginRequest,
  ChangePasswordRequest,
  PatientVisitQueryParams,
  QueryParams,
  ReportQueryParams,
  IncidenceDataQuery,
  GenderDataQuery,
} from './types/backend';

// ============================================
// GENERIC API FETCH WRAPPER WITH COOKIES
// ============================================

/**
 * Generic API fetch wrapper that uses httpOnly cookies for authentication
 * NO localStorage or manual token management needed
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    // CRITICAL: Include cookies with every request
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
     if (typeof window !== 'undefined') {
  window.location.href = '/login';
}
      throw new Error('Authentication required');
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: 'Network error occurred' 
      }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============================================
// AUTH API METHODS
// ============================================

export const authAPI = {
  /**
   * User login - sets httpOnly cookies
   */
  async login(credentials: LoginRequest): Promise<AuthLoginResponse> {
    return apiFetch<AuthLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * User logout - clears httpOnly cookies
   */
  async logout(): Promise<AuthLogoutResponse> {
    return apiFetch<AuthLogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthProfileResponse> {
    return apiFetch<AuthProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
  },

  /**
   * Verify authentication status
   */
  async verify(): Promise<AuthVerifyResponse> {
    return apiFetch<AuthVerifyResponse>(API_ENDPOINTS.AUTH.VERIFY);
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<AuthChangePasswordResponse> {
    return apiFetch<AuthChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// PATIENT VISITS API METHODS
// ============================================

export const patientVisitsAPI = {
  /**
   * Get patient visits list with pagination
   */
  async getList(params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.PATIENT_VISITS.LIST}${query ? `?${query}` : ''}`;

    return apiFetch<PatientVisitsListResponse>(endpoint);
  },

  /**
   * Get patient visit by ID
   */
  async getById(id: string): Promise<PatientVisitDetailResponse> {
    return apiFetch<PatientVisitDetailResponse>(API_ENDPOINTS.PATIENT_VISITS.BY_ID(id));
  },

  /**
   * Get patient visits statistics
   */
  async getStatistics(): Promise<PatientVisitStatisticsResponse> {
    return apiFetch<PatientVisitStatisticsResponse>(API_ENDPOINTS.PATIENT_VISITS.STATISTICS);
  },

  /**
   * Export patient visits to Excel
   */
  async exportExcel(params: {
    diseaseId?: string;
    hospitalCode9eDigit?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.PATIENT_VISITS.EXPORT_EXCEL}${query ? `?${query}` : ''}`;

    // For file downloads, we need to handle the response differently
    const response = await fetch(buildApiUrl(endpoint), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

// ============================================
// DISEASES API METHODS
// ============================================

export const diseasesAPI = {
  /**
   * Get diseases list
   */
  async getList(params: QueryParams = {}): Promise<DiseasesListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.DISEASES.LIST}${query ? `?${query}` : ''}`;

    return apiFetch<DiseasesListResponse>(endpoint);
  },

  /**
   * Get disease by ID
   */
  async getById(id: string): Promise<DiseaseDetailResponse> {
    return apiFetch<DiseaseDetailResponse>(API_ENDPOINTS.DISEASES.BY_ID(id));
  },
};

// ============================================
// REPORTS API METHODS
// ============================================

export const reportsAPI = {
  /**
   * Get patient visit data for reports
   */
  async getPatientVisitData(params: ReportQueryParams = {}): Promise<ReportPatientVisitDataResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.REPORTS.PATIENT_VISIT_DATA}${query ? `?${query}` : ''}`;

    return apiFetch<ReportPatientVisitDataResponse>(endpoint);
  },

  /**
   * Get incidence data for charts
   */
  async getIncidenceData(params: IncidenceDataQuery = {}): Promise<ReportIncidenceDataResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.REPORTS.INCIDENCE_DATA}${query ? `?${query}` : ''}`;

    return apiFetch<ReportIncidenceDataResponse>(endpoint);
  },

  /**
   * Get gender data for charts
   */
  async getGenderData(params: GenderDataQuery = {}): Promise<ReportGenderDataResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.REPORTS.GENDER_DATA}${query ? `?${query}` : ''}`;

    return apiFetch<ReportGenderDataResponse>(endpoint);
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user is authenticated by calling verify endpoint
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const result = await authAPI.verify();
    return result.success && result.data.authenticated;
  } catch {
    return false;
  }
}

/**
 * Download file from blob (for Excel exports)
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}