// frontend/src/lib/api.ts
// Complete API client for Disease Report System Frontend

import { buildApiUrl, API_ENDPOINTS } from '$lib/config';
import type {
  // Base Types
  BaseResponse,
  ErrorResponse,
  PaginatedResponse,
  
  // Auth Types
  LoginRequest,
  ChangePasswordRequest,
  UserInfo,
  LoginResponse,
  ChangePasswordResponse,
  
  // Patient Visit Types
  PatientVisitSummary,
  PatientVisitInfo,
  PatientVisitQueryParams,
  PatientVisitStatistics,
  
  // Disease Types
  Disease,
  DiseaseWithSymptoms,
  
  // Hospital Types
  Hospital,
  
  // Report Types
  ReportQueryParams,
  IncidenceDataQuery,
  GenderDataQuery,
  IncidenceDataItem,
  GenderDataItem,
  TrendDataItem,
  ReportSummary,
  
  // Query Types
  QueryParams,
  
  // API Response Types
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
  ReportTrendDataResponse,
} from '$lib/types/backend';

// ============================================
// API ERROR HANDLING
// ============================================

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// ============================================
// GENERIC API FETCH WRAPPER
// ============================================

/**
 * Generic API fetch wrapper with proper error handling and authentication
 * Uses httpOnly cookies for authentication (no manual token management)
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
    // CRITICAL: Include cookies with every request for authentication
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
        // Clear any cached user data
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      }
      throw new ApiError('Authentication required', 401, response.statusText);
    }

    // Handle other HTTP errors
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status} ${response.statusText}` };
      }
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        response.statusText,
        errorData
      );
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    console.error(`API Error (${endpoint}):`, error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      'Network Error'
    );
  }
}

// ============================================
// AUTHENTICATION API
// ============================================

const authAPI = {
  /**
   * User login - sets httpOnly cookies automatically
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

  /**
   * Refresh access token
   */
  async refresh(): Promise<BaseResponse<{ accessToken: string; refreshToken: string; expiresIn: string }>> {
    return apiFetch<BaseResponse<{ accessToken: string; refreshToken: string; expiresIn: string }>>(
      API_ENDPOINTS.AUTH.REFRESH,
      {
        method: 'POST',
      }
    );
  },
};

// ============================================
// PATIENT VISITS API
// ============================================

const patientVisitsAPI = {
  /**
   * Get patient visits list with pagination and filtering
   */
  async getList(params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    const searchParams = new URLSearchParams();
    
    // Add all valid parameters to search params
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
   * Get patient visits by disease
   */
  async getByDisease(diseaseId: string, params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.PATIENT_VISITS.BY_DISEASE(diseaseId)}${query ? `?${query}` : ''}`;

    return apiFetch<PatientVisitsListResponse>(endpoint);
  },

  /**
   * Get patient visits by hospital
   */
  async getByHospital(hospitalCode: string, params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.PATIENT_VISITS.BY_HOSPITAL(hospitalCode)}${query ? `?${query}` : ''}`;

    return apiFetch<PatientVisitsListResponse>(endpoint);
  },

  /**
   * Get patient visit history by ID card
   */
  async getHistory(idCardCode: string): Promise<PatientVisitsListResponse> {
    const endpoint = `${API_ENDPOINTS.PATIENT_VISITS.HISTORY}?idCardCode=${idCardCode}`;
    return apiFetch<PatientVisitsListResponse>(endpoint);
  },

  /**
   * Get patient visits statistics
   */
  async getStatistics(): Promise<PatientVisitStatisticsResponse> {
    return apiFetch<PatientVisitStatisticsResponse>(API_ENDPOINTS.PATIENT_VISITS.STATISTICS);
  },

  /**
   * Create new patient visit (Admin+)
   */
  async create(data: Partial<PatientVisitInfo>): Promise<BaseResponse<{ patientVisit: PatientVisitInfo }>> {
    return apiFetch<BaseResponse<{ patientVisit: PatientVisitInfo }>>(
      API_ENDPOINTS.PATIENT_VISITS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update patient visit (Admin+)
   */
  async update(id: string, data: Partial<PatientVisitInfo>): Promise<BaseResponse<{ patientVisit: PatientVisitInfo }>> {
    return apiFetch<BaseResponse<{ patientVisit: PatientVisitInfo }>>(
      API_ENDPOINTS.PATIENT_VISITS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete patient visit (Admin+)
   */
  async delete(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
    return apiFetch<BaseResponse<{ deleted: boolean }>>(
      API_ENDPOINTS.PATIENT_VISITS.DELETE(id),
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Export patient visits to Excel
   */
  async exportExcel(params: PatientVisitQueryParams = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.PATIENT_VISITS.EXPORT_EXCEL}${query ? `?${query}` : ''}`;

    const response = await fetch(buildApiUrl(endpoint), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError('Export failed', response.status, response.statusText);
    }

    return response.blob();
  },
};

// ============================================
// DISEASES API
// ============================================

const diseasesAPI = {
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

  /**
   * Search diseases
   */
  async search(query: string): Promise<DiseasesListResponse> {
    const endpoint = `${API_ENDPOINTS.DISEASES.SEARCH}?q=${encodeURIComponent(query)}`;
    return apiFetch<DiseasesListResponse>(endpoint);
  },

  /**
   * Create new disease (Superadmin only)
   */
  async create(data: Partial<Disease>): Promise<BaseResponse<{ disease: Disease }>> {
    return apiFetch<BaseResponse<{ disease: Disease }>>(
      API_ENDPOINTS.DISEASES.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update disease (Superadmin only)
   */
  async update(id: string, data: Partial<Disease>): Promise<BaseResponse<{ disease: Disease }>> {
    return apiFetch<BaseResponse<{ disease: Disease }>>(
      API_ENDPOINTS.DISEASES.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete disease (Superadmin only)
   */
  async delete(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
    return apiFetch<BaseResponse<{ deleted: boolean }>>(
      API_ENDPOINTS.DISEASES.DELETE(id),
      {
        method: 'DELETE',
      }
    );
  },
};

// ============================================
// HOSPITALS API
// ============================================

const hospitalsAPI = {
  /**
   * Get hospitals list
   */
  async getList(params: QueryParams = {}): Promise<BaseResponse<{ hospitals: Hospital[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.HOSPITALS.LIST}${query ? `?${query}` : ''}`;

    return apiFetch<BaseResponse<{ hospitals: Hospital[]; pagination: any }>>(endpoint);
  },

  /**
   * Get hospital by ID
   */
  async getById(id: string): Promise<BaseResponse<{ hospital: Hospital }>> {
    return apiFetch<BaseResponse<{ hospital: Hospital }>>(API_ENDPOINTS.HOSPITALS.BY_ID(id));
  },

  /**
   * Get hospital by code
   */
  async getByCode(code: string): Promise<BaseResponse<{ hospital: Hospital }>> {
    return apiFetch<BaseResponse<{ hospital: Hospital }>>(API_ENDPOINTS.HOSPITALS.BY_CODE(code));
  },

  /**
   * Search hospitals
   */
  async search(query: string): Promise<BaseResponse<{ hospitals: Hospital[] }>> {
    const endpoint = `${API_ENDPOINTS.HOSPITALS.SEARCH}?q=${encodeURIComponent(query)}`;
    return apiFetch<BaseResponse<{ hospitals: Hospital[] }>>(endpoint);
  },

  /**
   * Get current user's hospital
   */
  async getMyHospital(): Promise<BaseResponse<{ hospital: Hospital }>> {
    return apiFetch<BaseResponse<{ hospital: Hospital }>>(API_ENDPOINTS.HOSPITALS.MY_HOSPITAL);
  },
};

// ============================================
// USERS API
// ============================================

const usersAPI = {
  /**
   * Get users list (Admin+)
   */
  async getList(params: QueryParams = {}): Promise<BaseResponse<{ users: UserInfo[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.USERS.LIST}${query ? `?${query}` : ''}`;

    return apiFetch<BaseResponse<{ users: UserInfo[]; pagination: any }>>(endpoint);
  },

  /**
   * Get user by ID (Admin+)
   */
  async getById(id: string): Promise<BaseResponse<{ user: UserInfo }>> {
    return apiFetch<BaseResponse<{ user: UserInfo }>>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  /**
   * Create new user (Admin+)
   */
  async create(data: Partial<UserInfo>): Promise<BaseResponse<{ user: UserInfo }>> {
    return apiFetch<BaseResponse<{ user: UserInfo }>>(
      API_ENDPOINTS.USERS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update user (Admin+)
   */
  async update(id: string, data: Partial<UserInfo>): Promise<BaseResponse<{ user: UserInfo }>> {
    return apiFetch<BaseResponse<{ user: UserInfo }>>(
      API_ENDPOINTS.USERS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete user (Admin+)
   */
  async delete(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
    return apiFetch<BaseResponse<{ deleted: boolean }>>(
      API_ENDPOINTS.USERS.DELETE(id),
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Change user password (Admin+)
   */
  async changePassword(id: string, data: { newPassword: string; confirmPassword: string }): Promise<BaseResponse<any>> {
    return apiFetch<BaseResponse<any>>(
      API_ENDPOINTS.USERS.CHANGE_PASSWORD(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================
// REPORTS API
// ============================================

const reportsAPI = {
  /**
   * Get patient visit report data
   */
  async getPatientVisitData(params: ReportQueryParams = {}): Promise<ReportPatientVisitDataResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.REPORTS.PATIENT_VISITS}${query ? `?${query}` : ''}`;

    return apiFetch<ReportPatientVisitDataResponse>(endpoint);
  },

  /**
   * Get incidence data for reports
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
   * Get gender distribution data for reports
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

  /**
   * Get trend data for reports
   */
  async getTrendData(params: ReportQueryParams = {}): Promise<ReportTrendDataResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.REPORTS.TREND_DATA}${query ? `?${query}` : ''}`;

    return apiFetch<ReportTrendDataResponse>(endpoint);
  },

  /**
   * Export report to PDF
   */
  async exportPdf(params: ReportQueryParams = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.REPORTS.EXPORT_PDF}${query ? `?${query}` : ''}`;

    const response = await fetch(buildApiUrl(endpoint), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError('PDF export failed', response.status, response.statusText);
    }

    return response.blob();
  },

  /**
   * Export report to Excel
   */
  async exportExcel(params: ReportQueryParams = {}): Promise<Blob> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.REPORTS.EXPORT_EXCEL}${query ? `?${query}` : ''}`;

    const response = await fetch(buildApiUrl(endpoint), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError('Excel export failed', response.status, response.statusText);
    }

    return response.blob();
  },
};

// ============================================
// HEALTH CHECK API
// ============================================

const healthAPI = {
  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<BaseResponse<any>> {
    return apiFetch<BaseResponse<any>>(API_ENDPOINTS.HEALTH);
  },

  /**
   * Get auth service health
   */
  async getAuthHealth(): Promise<BaseResponse<any>> {
    return apiFetch<BaseResponse<any>>(API_ENDPOINTS.AUTH.HEALTH);
  },

  /**
   * Get patient visits service health
   */
  async getPatientVisitsHealth(): Promise<BaseResponse<any>> {
    return apiFetch<BaseResponse<any>>(API_ENDPOINTS.PATIENT_VISITS.HEALTH);
  },

  /**
   * Get diseases service health
   */
  async getDiseasesHealth(): Promise<BaseResponse<any>> {
    return apiFetch<BaseResponse<any>>(API_ENDPOINTS.DISEASES.HEALTH);
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: any): boolean {
  return error instanceof ApiError && error.status === 401;
}

/**
 * Check if error is permission error
 */
export function isPermissionError(error: any): boolean {
  return error instanceof ApiError && error.status === 403;
}

// Export all APIs as default object
export default {
  auth: authAPI,
  patientVisits: patientVisitsAPI,
  diseases: diseasesAPI,
  hospitals: hospitalsAPI,
  users: usersAPI,
  reports: reportsAPI,
  health: healthAPI,
};

// Export individual APIs for named imports
export {
  authAPI,
  patientVisitsAPI,
  diseasesAPI,
  hospitalsAPI,
  usersAPI,
  reportsAPI,
  healthAPI,
};