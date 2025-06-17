// frontend/src/lib/api.ts
// Complete API client for Disease Report System Frontend v2
// Type-safe, error-handled, feature-complete API wrapper
// ✅ Fixed REPORTS API to match backend routes exactly
// ✅ Uses exact types from frontend/src/lib/types/backend.ts

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { buildApiUrl, API_ENDPOINTS, APP_CONFIG } from '$lib/config';
import type {
  // Base Types
  BaseResponse,
  ErrorResponse,
  
  // Auth Types
  LoginRequest,
  ChangePasswordRequest,
  UserInfo,
  LoginResponse,
  ChangePasswordResponse,
  RefreshTokenResponse,
  
  // Patient Visit Types
  PatientVisitQueryParams,
  PatientVisitSummary,
  PatientVisitInfo,
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
  
  // API Response Types (from frontend types)
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthProfileResponse,
  AuthVerifyResponse,
  AuthChangePasswordResponse,
  PatientVisitsListResponse,
  PatientVisitDetailResponse,
  PatientVisitCreateResponse,
  PatientVisitUpdateResponse,
  PatientVisitDeleteResponse,
  PatientVisitStatisticsResponse,
  DiseasesListResponse,
  DiseaseDetailResponse,
  
} from '$lib/types/backend';

// ============================================
// API ERROR HANDLING
// ============================================

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: ErrorResponse | Record<string, unknown>;
  public timestamp: Date;

  constructor(message: string, status: number, statusText: string, data?: ErrorResponse | Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.timestamp = new Date();
  }
}

// ============================================
// RETRY CONFIGURATION
// ============================================

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: boolean;
  retryOn: number[];
}

const defaultRetryConfig: RetryConfig = {
  attempts: APP_CONFIG.ERROR_HANDLING.RETRY_ATTEMPTS,
  delay: APP_CONFIG.ERROR_HANDLING.RETRY_DELAY,
  backoff: true,
  retryOn: [408, 429, 500, 502, 503, 504],
};

// ============================================
// INTERCEPTORS
// ============================================

export type RequestInterceptor = (config: RequestInit) => Promise<RequestInit> | RequestInit;
export type ResponseInterceptor = (response: Response) => Promise<Response> | Response;

class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(config: RequestInit): Promise<RequestInit> {
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }
    return finalConfig;
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let finalResponse = response;
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse);
    }
    return finalResponse;
  }

  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    // Custom error handling based on status
    if (error.status === 401) {
      this.handleAuthError();
    }
    return error;
  }

  private handleAuthError(): void {
    if (browser) {
      localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
      goto('/login');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<T> {
    const config = { ...defaultRetryConfig, ...retryConfig };
    let lastError: ApiError | null = null;

    for (let attempt = 1; attempt <= config.attempts; attempt++) {
      try {
        const result = await this.singleFetch<T>(endpoint, options);
        return result;
      } catch (error) {
        lastError = error instanceof ApiError 
          ? error 
          : new ApiError(
              error instanceof Error ? error.message : 'Unknown error',
              0,
              'Network Error'
            );

        if (lastError.status >= 400 && lastError.status < 500 && lastError.status !== 429) {
          break;
        }

        if (attempt === config.attempts) {
          break;
        }

        const delay = config.backoff 
          ? config.delay * Math.pow(2, attempt - 1) 
          : config.delay;

        console.warn(`API request failed (attempt ${attempt}/${config.attempts}), retrying in ${delay}ms:`, {
          endpoint,
          error: lastError.message,
          status: lastError.status,
        });

        await this.sleep(delay);
      }
    }

    if (!lastError) {
      lastError = new ApiError('Unknown error occurred', 0, 'Unknown Error');
    }

    const finalError = await this.applyErrorInterceptors(lastError);
    throw finalError;
  }

  private async singleFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = buildApiUrl(endpoint);

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let config: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    config = await this.applyRequestInterceptors(config);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.PERFORMANCE.REQUEST_TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const finalResponse = await this.applyResponseInterceptors(response);

      if (finalResponse.status === 401) {
        this.handleAuthError();
        throw new ApiError('Authentication required', 401, finalResponse.statusText);
      }

      if (!finalResponse.ok) {
        let errorData: ErrorResponse | Record<string, unknown>;
        try {
          errorData = await finalResponse.json();
        } catch {
          errorData = { message: `HTTP ${finalResponse.status} ${finalResponse.statusText}` };
        }
        
        throw new ApiError(
          (errorData as ErrorResponse).message || `HTTP ${finalResponse.status}`,
          finalResponse.status,
          finalResponse.statusText,
          errorData
        );
      }

      if (finalResponse.status === 204 || finalResponse.headers.get('content-length') === '0') {
        return {} as T;
      }

      return await finalResponse.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'Request Timeout');
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error(`API Error (${endpoint}):`, error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        'Network Error'
      );
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// ============================================
// HTTP METHOD HELPERS
// ============================================

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value.toString());
    }
  });
  return searchParams.toString();
}

async function get<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T> {
  const query = buildQueryString(params);
  const fullEndpoint = `${endpoint}${query ? `?${query}` : ''}`;
  return apiClient.fetch<T>(fullEndpoint, { method: 'GET' });
}

async function post<T>(endpoint: string, data?: Record<string, unknown> | LoginRequest | ChangePasswordRequest): Promise<T> {
  return apiClient.fetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

async function put<T>(endpoint: string, data?: Record<string, unknown> | ChangePasswordRequest): Promise<T> {
  return apiClient.fetch<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

async function del<T>(endpoint: string): Promise<T> {
  return apiClient.fetch<T>(endpoint, { method: 'DELETE' });
}

// ============================================
// AUTHENTICATION API
// ============================================

const authAPI = {
  async login(credentials: LoginRequest): Promise<AuthLoginResponse> {
    return post<AuthLoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  async logout(): Promise<AuthLogoutResponse> {
    return post<AuthLogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    return post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH);
  },

  async getProfile(): Promise<AuthProfileResponse> {
    return get<AuthProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
  },

  async verify(): Promise<AuthVerifyResponse> {
    return get<AuthVerifyResponse>(API_ENDPOINTS.AUTH.VERIFY);
  },

  async changePassword(data: ChangePasswordRequest): Promise<AuthChangePasswordResponse> {
    return post<AuthChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  async getHealth(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return get<BaseResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.AUTH.HEALTH);
  },
};

// ============================================
// PATIENT VISITS API
// ============================================

const patientVisitsAPI = {
  async getList(params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    return get<PatientVisitsListResponse>(API_ENDPOINTS.PATIENT_VISITS.LIST, params as Record<string, unknown>);
  },

  async getById(id: string): Promise<PatientVisitDetailResponse> {
    return get<PatientVisitDetailResponse>(API_ENDPOINTS.PATIENT_VISITS.BY_ID(id));
  },

  async getByDisease(diseaseId: string, params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    return get<PatientVisitsListResponse>(API_ENDPOINTS.PATIENT_VISITS.BY_DISEASE(diseaseId), params as Record<string, unknown>);
  },

  async getByHospital(hospitalCode: string, params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    return get<PatientVisitsListResponse>(API_ENDPOINTS.PATIENT_VISITS.BY_HOSPITAL(hospitalCode), params as Record<string, unknown>);
  },

  async getHistory(params: { idCardCode: string }): Promise<PatientVisitsListResponse> {
    return get<PatientVisitsListResponse>(API_ENDPOINTS.PATIENT_VISITS.HISTORY, params);
  },

  async getStatistics(params: PatientVisitQueryParams = {}): Promise<PatientVisitStatisticsResponse> {
    return get<PatientVisitStatisticsResponse>(API_ENDPOINTS.PATIENT_VISITS.STATISTICS, params as Record<string, unknown>);
  },

  async create(data: Record<string, unknown>): Promise<PatientVisitCreateResponse> {
    return post<PatientVisitCreateResponse>(API_ENDPOINTS.PATIENT_VISITS.CREATE, data);
  },

  async update(id: string, data: Record<string, unknown>): Promise<PatientVisitUpdateResponse> {
    return put<PatientVisitUpdateResponse>(API_ENDPOINTS.PATIENT_VISITS.UPDATE(id), data);
  },

  async delete(id: string): Promise<PatientVisitDeleteResponse> {
    return del<PatientVisitDeleteResponse>(API_ENDPOINTS.PATIENT_VISITS.DELETE(id));
  },

  async exportExcel(params: PatientVisitQueryParams = {}): Promise<Blob> {
    const query = buildQueryString(params as Record<string, unknown>);
    const endpoint = `${API_ENDPOINTS.PATIENT_VISITS.EXPORT_EXCEL}${query ? `?${query}` : ''}`;

    const response = await fetch(buildApiUrl(endpoint), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError('Excel export failed', response.status, response.statusText);
    }

    return response.blob();
  },

  async searchAdvanced(params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    return get<PatientVisitsListResponse>(API_ENDPOINTS.PATIENT_VISITS.SEARCH_ADVANCED, params as Record<string, unknown>);
  },

  async getFilterOptions(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.PATIENT_VISITS.FILTERS_OPTIONS);
  },

  async getMyHospital(params: PatientVisitQueryParams = {}): Promise<PatientVisitsListResponse> {
    return get<PatientVisitsListResponse>(API_ENDPOINTS.PATIENT_VISITS.MY_HOSPITAL, params as Record<string, unknown>);
  },

  async getMyHospitalStatistics(params: PatientVisitQueryParams = {}): Promise<PatientVisitStatisticsResponse> {
    return get<PatientVisitStatisticsResponse>(API_ENDPOINTS.PATIENT_VISITS.MY_HOSPITAL_STATISTICS, params as Record<string, unknown>);
  },

  async getMyHospitalHistory(params: { idCardCode: string }): Promise<PatientVisitsListResponse> {
    return get<PatientVisitsListResponse>(API_ENDPOINTS.PATIENT_VISITS.MY_HOSPITAL_HISTORY, params);
  },

  async bulkImport(data: FormData): Promise<BaseResponse<{ imported: number; errors: unknown[] }>> {
    return apiClient.fetch<BaseResponse<{ imported: number; errors: unknown[] }>>(
      API_ENDPOINTS.PATIENT_VISITS.BULK_IMPORT,
      {
        method: 'POST',
        body: data,
        headers: {},
      }
    );
  },

  async bulkUpdate(data: { ids: string[]; updates: Record<string, unknown> }): Promise<BaseResponse<{ updated: number }>> {
    return put<BaseResponse<{ updated: number }>>(API_ENDPOINTS.PATIENT_VISITS.BULK_UPDATE, data);
  },

  async getHealth(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return get<BaseResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.PATIENT_VISITS.HEALTH);
  },
};

// ============================================
// DISEASES API
// ============================================

const diseasesAPI = {
  async getList(params: Record<string, unknown> = {}): Promise<DiseasesListResponse> {
    return get<DiseasesListResponse>(API_ENDPOINTS.DISEASES.LIST, params);
  },

  async getById(id: string): Promise<DiseaseDetailResponse> {
    return get<DiseaseDetailResponse>(API_ENDPOINTS.DISEASES.BY_ID(id));
  },

  async getSymptoms(id: string): Promise<BaseResponse<{ symptoms: unknown[] }>> {
    return get<BaseResponse<{ symptoms: unknown[] }>>(API_ENDPOINTS.DISEASES.SYMPTOMS(id));
  },

  async getStatistics(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.DISEASES.STATISTICS);
  },

  async create(data: Record<string, unknown>): Promise<BaseResponse<{ disease: Disease }>> {
    return post<BaseResponse<{ disease: Disease }>>(API_ENDPOINTS.DISEASES.CREATE, data);
  },

  async update(id: string, data: Record<string, unknown>): Promise<BaseResponse<{ disease: Disease }>> {
    return put<BaseResponse<{ disease: Disease }>>(API_ENDPOINTS.DISEASES.UPDATE(id), data);
  },

  async delete(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
    return del<BaseResponse<{ deleted: boolean }>>(API_ENDPOINTS.DISEASES.DELETE(id));
  },

  async getHealth(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return get<BaseResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.DISEASES.HEALTH);
  },
};

// ============================================
// SYMPTOMS API
// ============================================

const symptomsAPI = {
  async getList(params: Record<string, unknown> = {}): Promise<BaseResponse<{ symptoms: unknown[]; pagination: unknown }>> {
    return get<BaseResponse<{ symptoms: unknown[]; pagination: unknown }>>(API_ENDPOINTS.SYMPTOMS.LIST, params);
  },

  async getById(id: string): Promise<BaseResponse<{ symptom: unknown }>> {
    return get<BaseResponse<{ symptom: unknown }>>(API_ENDPOINTS.SYMPTOMS.BY_ID(id));
  },

  async getByDisease(diseaseId: string): Promise<BaseResponse<{ symptoms: unknown[] }>> {
    return get<BaseResponse<{ symptoms: unknown[] }>>(API_ENDPOINTS.SYMPTOMS.BY_DISEASE(diseaseId));
  },

  async getStatistics(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.SYMPTOMS.STATISTICS);
  },

  async create(data: Record<string, unknown>): Promise<BaseResponse<{ symptom: unknown }>> {
    return post<BaseResponse<{ symptom: unknown }>>(API_ENDPOINTS.SYMPTOMS.CREATE, data);
  },

  async update(id: string, data: Record<string, unknown>): Promise<BaseResponse<{ symptom: unknown }>> {
    return put<BaseResponse<{ symptom: unknown }>>(API_ENDPOINTS.SYMPTOMS.UPDATE(id), data);
  },

  async delete(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
    return del<BaseResponse<{ deleted: boolean }>>(API_ENDPOINTS.SYMPTOMS.DELETE(id));
  },

  async getHealth(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return get<BaseResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.SYMPTOMS.HEALTH);
  },
};

// ============================================
// HOSPITALS API
// ============================================

const hospitalsAPI = {
  async getList(params: Record<string, unknown> = {}): Promise<BaseResponse<{ hospitals: Hospital[]; pagination: unknown }>> {
    return get<BaseResponse<{ hospitals: Hospital[]; pagination: unknown }>>(API_ENDPOINTS.HOSPITALS.LIST, params);
  },

  async getById(id: string): Promise<BaseResponse<{ hospital: Hospital }>> {
    return get<BaseResponse<{ hospital: Hospital }>>(API_ENDPOINTS.HOSPITALS.BY_ID(id));
  },

  async getByCode(code: string): Promise<BaseResponse<{ hospital: Hospital }>> {
    return get<BaseResponse<{ hospital: Hospital }>>(API_ENDPOINTS.HOSPITALS.BY_CODE(code));
  },

  async getCodesMap(): Promise<BaseResponse<Record<string, string>>> {
    return get<BaseResponse<Record<string, string>>>(API_ENDPOINTS.HOSPITALS.CODES_MAP);
  },

  async getStatistics(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.HOSPITALS.STATISTICS);
  },

  async create(data: Record<string, unknown>): Promise<BaseResponse<{ hospital: Hospital }>> {
    return post<BaseResponse<{ hospital: Hospital }>>(API_ENDPOINTS.HOSPITALS.CREATE, data);
  },

  async update(id: string, data: Record<string, unknown>): Promise<BaseResponse<{ hospital: Hospital }>> {
    return put<BaseResponse<{ hospital: Hospital }>>(API_ENDPOINTS.HOSPITALS.UPDATE(id), data);
  },

  async delete(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
    return del<BaseResponse<{ deleted: boolean }>>(API_ENDPOINTS.HOSPITALS.DELETE(id));
  },

  async getHealth(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return get<BaseResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.HOSPITALS.HEALTH);
  },
};

// ============================================
// POPULATIONS API
// ============================================

const populationsAPI = {
  async getList(params: Record<string, unknown> = {}): Promise<BaseResponse<{ populations: unknown[]; pagination: unknown }>> {
    return get<BaseResponse<{ populations: unknown[]; pagination: unknown }>>(API_ENDPOINTS.POPULATIONS.LIST, params);
  },

  async getById(id: string): Promise<BaseResponse<{ population: unknown }>> {
    return get<BaseResponse<{ population: unknown }>>(API_ENDPOINTS.POPULATIONS.BY_ID(id));
  },

  async getByHospital(hospitalCode: string): Promise<BaseResponse<{ populations: unknown[] }>> {
    return get<BaseResponse<{ populations: unknown[] }>>(API_ENDPOINTS.POPULATIONS.BY_HOSPITAL(hospitalCode));
  },

  async getByYear(year: number): Promise<BaseResponse<{ populations: unknown[] }>> {
    return get<BaseResponse<{ populations: unknown[] }>>(API_ENDPOINTS.POPULATIONS.BY_YEAR(year));
  },

  async getStatistics(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.POPULATIONS.STATISTICS);
  },

  async getTrends(): Promise<BaseResponse<{ trends: unknown[] }>> {
    return get<BaseResponse<{ trends: unknown[] }>>(API_ENDPOINTS.POPULATIONS.TRENDS);
  },

  async getMyHospital(): Promise<BaseResponse<{ populations: unknown[] }>> {
    return get<BaseResponse<{ populations: unknown[] }>>(API_ENDPOINTS.POPULATIONS.MY_HOSPITAL);
  },

  async create(data: Record<string, unknown>): Promise<BaseResponse<{ population: unknown }>> {
    return post<BaseResponse<{ population: unknown }>>(API_ENDPOINTS.POPULATIONS.CREATE, data);
  },

  async update(id: string, data: Record<string, unknown>): Promise<BaseResponse<{ population: unknown }>> {
    return put<BaseResponse<{ population: unknown }>>(API_ENDPOINTS.POPULATIONS.UPDATE(id), data);
  },

  async delete(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
    return del<BaseResponse<{ deleted: boolean }>>(API_ENDPOINTS.POPULATIONS.DELETE(id));
  },

  async getHealth(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return get<BaseResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.POPULATIONS.HEALTH);
  },
};

// ============================================
// USERS API
// ============================================

const usersAPI = {
  async getList(params: Record<string, unknown> = {}): Promise<BaseResponse<{ users: UserInfo[]; pagination: unknown }>> {
    return get<BaseResponse<{ users: UserInfo[]; pagination: unknown }>>(API_ENDPOINTS.USERS.LIST, params);
  },

  async getById(id: string): Promise<BaseResponse<{ user: UserInfo }>> {
    return get<BaseResponse<{ user: UserInfo }>>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  async create(data: Record<string, unknown>): Promise<BaseResponse<{ user: UserInfo }>> {
    return post<BaseResponse<{ user: UserInfo }>>(API_ENDPOINTS.USERS.CREATE, data);
  },

  async update(id: string, data: Record<string, unknown>): Promise<BaseResponse<{ user: UserInfo }>> {
    return put<BaseResponse<{ user: UserInfo }>>(API_ENDPOINTS.USERS.UPDATE(id), data);
  },

  async delete(id: string): Promise<BaseResponse<{ deleted: boolean }>> {
    return del<BaseResponse<{ deleted: boolean }>>(API_ENDPOINTS.USERS.DELETE(id));
  },

  async adminChangePassword(id: string, data: { newPassword: string; confirmPassword: string }): Promise<BaseResponse<{ message: string }>> {
    return put<BaseResponse<{ message: string }>>(API_ENDPOINTS.USERS.ADMIN_CHANGE_PASSWORD(id), data);
  },

  async getProfile(): Promise<BaseResponse<{ user: UserInfo }>> {
    return get<BaseResponse<{ user: UserInfo }>>(API_ENDPOINTS.USERS.PROFILE);
  },

  async updateProfile(data: Record<string, unknown>): Promise<BaseResponse<{ user: UserInfo }>> {
    return put<BaseResponse<{ user: UserInfo }>>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<BaseResponse<{ message: string }>> {
    return put<BaseResponse<{ message: string }>>(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
  },

  async getDebugPermissions(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.USERS.DEBUG_PERMISSIONS);
  },

  async getDocs(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.USERS.DOCS);
  },

  async getHealth(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return get<BaseResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.USERS.HEALTH);
  },
};

// ============================================
// REPORTS API (✅ FIXED - ตรงกับ backend routes)
// ============================================

const reportsAPI = {
  // Age & Demographics Reports
  async getAgeGroups(params: Record<string, unknown> = {}): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.AGE_GROUPS, params);
  },

  async getGenderRatio(params: Record<string, unknown> = {}): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.GENDER_RATIO, params);
  },

  async getOccupation(params: Record<string, unknown> = {}): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.OCCUPATION, params);
  },

  // Incidence & Statistics
  async getIncidenceRates(params: Record<string, unknown> = {}): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.INCIDENCE_RATES, params);
  },

  // Support Data for Dropdowns
  async getDiseases(): Promise<BaseResponse<{ diseases: Disease[] }>> {
    return get<BaseResponse<{ diseases: Disease[] }>>(API_ENDPOINTS.REPORTS.DISEASES);
  },

  async getHospitals(): Promise<BaseResponse<{ hospitals: Hospital[] }>> {
    return get<BaseResponse<{ hospitals: Hospital[] }>>(API_ENDPOINTS.REPORTS.HOSPITALS);
  },

  async getPublicStats(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.PUBLIC_STATS);
  },

  // Documentation & Health
  async getDocs(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.DOCS);
  },

  async getHealth(): Promise<BaseResponse<{ status: string; timestamp: string }>> {
    return get<BaseResponse<{ status: string; timestamp: string }>>(API_ENDPOINTS.REPORTS.HEALTH);
  },
};

// ============================================
// HEALTH CHECK API
// ============================================

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  version?: string;
  environment?: string;
  services?: Record<string, string>;
}

const healthAPI = {
  async getSystemHealth(): Promise<BaseResponse<HealthCheckResponse>> {
    return get<BaseResponse<HealthCheckResponse>>(API_ENDPOINTS.HEALTH);
  },

  async getApiRoot(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.ROOT);
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function downloadBlob(blob: Blob, filename: string): void {
  if (!browser) return;
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function handleApiError(error: unknown): { message: string; type: 'error' } {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return {
      message: error.message,
      type: 'error'
    };
  }
  
  return {
    message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    type: 'error'
  };
}

function createAbortController(timeoutMs: number = APP_CONFIG.PERFORMANCE.REQUEST_TIMEOUT): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

async function exportToExcel(
  apiCall: () => Promise<Blob>,
  filename: string = `export_${new Date().getTime()}.xlsx`
): Promise<void> {
  try {
    const blob = await apiCall();
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Excel export failed:', error);
    throw new ApiError(
      'ไม่สามารถส่งออกไฟล์ Excel ได้',
      500,
      'Export Failed'
    );
  }
}

// ============================================
// EXPORTS
// ============================================

// Named exports
export {
  authAPI,
  patientVisitsAPI,
  diseasesAPI,
  symptomsAPI,
  hospitalsAPI,
  populationsAPI,
  usersAPI,
  reportsAPI,
  healthAPI,
  apiClient,
  downloadBlob,
  handleApiError,
  createAbortController,
  exportToExcel,
};

// Default export
export default {
  auth: authAPI,
  patientVisits: patientVisitsAPI,
  diseases: diseasesAPI,
  symptoms: symptomsAPI,
  hospitals: hospitalsAPI,
  populations: populationsAPI,
  users: usersAPI,
  reports: reportsAPI,
  health: healthAPI,
};