// frontend/src/lib/api.ts
// Complete API client for Disease Report System Frontend v2
// Type-safe, error-handled, feature-complete API wrapper
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

  get isAuthError(): boolean {
    return this.status === 401;
  }

  get isPermissionError(): boolean {
    return this.status === 403;
  }

  get isValidationError(): boolean {
    return this.status === 400 && Boolean(this.data && 'details' in this.data);
  }

  get isNetworkError(): boolean {
    return this.status === 0 || this.status >= 500;
  }

  get validationErrors(): Array<{ field: string; message: string }> {
    if (this.isValidationError && this.data && 'details' in this.data) {
      return (this.data.details as Array<{ field: string; message: string }>) || [];
    }
    return [];
  }
}

// ============================================
// RETRY CONFIGURATION
// ============================================

interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: APP_CONFIG.PERFORMANCE.RETRY_ATTEMPTS,
  delay: APP_CONFIG.PERFORMANCE.RETRY_DELAY,
  backoff: true,
};

// ============================================
// REQUEST INTERCEPTORS
// ============================================

interface RequestInterceptor {
  (config: RequestInit): RequestInit | Promise<RequestInit>;
}

interface ResponseInterceptor {
  onFulfilled?: (response: Response) => Response | Promise<Response>;
  onRejected?: (error: ApiError) => Promise<never> | ApiError;
}

class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
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
      if (interceptor.onFulfilled) {
        finalResponse = await interceptor.onFulfilled(finalResponse);
      }
    }
    
    return finalResponse;
  }

  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let finalError = error;
    
    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onRejected) {
        try {
          await interceptor.onRejected(finalError);
        } catch (interceptedError) {
          finalError = interceptedError instanceof ApiError ? interceptedError : finalError;
        }
      }
    }
    
    return finalError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<T> {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    let lastError: ApiError | undefined;

    for (let attempt = 1; attempt <= config.attempts; attempt++) {
      try {
        const result = await this.singleFetch<T>(endpoint, options);
        return result;
      } catch (error) {
        lastError = error instanceof ApiError ? error : new ApiError(
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

  private handleAuthError(): void {
    if (browser) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      
      goto(redirectUrl);
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// ============================================
// SETUP DEFAULT INTERCEPTORS
// ============================================

apiClient.addRequestInterceptor((config) => {
  return config;
});

apiClient.addResponseInterceptor({
  onRejected: async (error: ApiError) => {
    if (!APP_CONFIG.ENVIRONMENT || APP_CONFIG.ENVIRONMENT === 'development') {
      console.error('API Error:', {
        message: error.message,
        status: error.status,
        endpoint: error.data,
        timestamp: error.timestamp,
      });
    }
    
    throw error;
  }
});

// ============================================
// CONVENIENCE FUNCTIONS
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

async function get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
  const query = params ? buildQueryString(params) : '';
  const url = query ? `${endpoint}?${query}` : endpoint;
  return apiClient.fetch<T>(url, { method: 'GET' });
}

async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient.fetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient.fetch<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiClient.fetch<T>(endpoint, {
    method: 'PATCH',
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

  async getProfile(): Promise<AuthProfileResponse> {
    return get<AuthProfileResponse>(API_ENDPOINTS.AUTH.PROFILE);
  },

  async verify(): Promise<AuthVerifyResponse> {
    return get<AuthVerifyResponse>(API_ENDPOINTS.AUTH.VERIFY);
  },

  async changePassword(data: ChangePasswordRequest): Promise<AuthChangePasswordResponse> {
    return post<AuthChangePasswordResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  async refresh(): Promise<BaseResponse<RefreshTokenResponse>> {
    return post<BaseResponse<RefreshTokenResponse>>(API_ENDPOINTS.AUTH.REFRESH);
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
  async getList(params: Record<string, unknown> = {}): Promise<BaseResponse<{ symptoms: unknown[] }>> {
    return get<BaseResponse<{ symptoms: unknown[] }>>(API_ENDPOINTS.SYMPTOMS.LIST, params);
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
  async getList(params: Record<string, unknown> = {}): Promise<BaseResponse<{ hospitals: Hospital[] }>> {
    return get<BaseResponse<{ hospitals: Hospital[] }>>(API_ENDPOINTS.HOSPITALS.LIST, params);
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
  async getList(params: Record<string, unknown> = {}): Promise<BaseResponse<{ populations: unknown[] }>> {
    return get<BaseResponse<{ populations: unknown[] }>>(API_ENDPOINTS.POPULATIONS.LIST, params);
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

  async getTrends(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.POPULATIONS.TRENDS);
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
// USERS API (Admin+ only)
// ============================================

const usersAPI = {
  async getList(params: Record<string, unknown> = {}): Promise<BaseResponse<{ users: UserInfo[]; pagination: any }>> {
    return get<BaseResponse<{ users: UserInfo[]; pagination: any }>>(API_ENDPOINTS.USERS.LIST, params);
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
// REPORTS API
// ============================================

const reportsAPI = {
  async getAgeGroups(params: Record<string, unknown>): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.AGE_GROUPS, params);
  },

  async getGenderRatio(params: Record<string, unknown>): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.GENDER_RATIO, params);
  },

  async getOccupation(params: Record<string, unknown>): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.OCCUPATION, params);
  },

  async getIncidenceRates(params: Record<string, unknown>): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.INCIDENCE_RATES, params);
  },

  async getDiseases(): Promise<DiseasesListResponse> {
    return get<DiseasesListResponse>(API_ENDPOINTS.REPORTS.DISEASES);
  },

  async getHospitals(): Promise<BaseResponse<{ hospitals: Hospital[] }>> {
    return get<BaseResponse<{ hospitals: Hospital[] }>>(API_ENDPOINTS.REPORTS.HOSPITALS);
  },

  async getPublicStats(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.PUBLIC_STATS);
  },

  async getPatientVisitData(params: Record<string, unknown> = {}): Promise<ReportPatientVisitDataResponse> {
    return get<ReportPatientVisitDataResponse>(API_ENDPOINTS.REPORTS.PATIENT_VISIT_DATA, params);
  },

  async getIncidenceData(params: Record<string, unknown> = {}): Promise<ReportIncidenceDataResponse> {
    return get<ReportIncidenceDataResponse>(API_ENDPOINTS.REPORTS.INCIDENCE_DATA, params);
  },

  async getGenderData(params: Record<string, unknown> = {}): Promise<ReportGenderDataResponse> {
    return get<ReportGenderDataResponse>(API_ENDPOINTS.REPORTS.GENDER_DATA, params);
  },

  async getTrendData(params: Record<string, unknown> = {}): Promise<ReportTrendDataResponse> {
    return get<ReportTrendDataResponse>(API_ENDPOINTS.REPORTS.TREND_DATA, params);
  },

  async getPopulationData(params: Record<string, unknown> = {}): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.POPULATION_DATA, params);
  },

  async getFilterOptions(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.REPORTS.FILTER_OPTIONS);
  },

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
}

const healthAPI = {
  async getSystemHealth(): Promise<BaseResponse<HealthCheckResponse>> {
    return get<BaseResponse<HealthCheckResponse>>(API_ENDPOINTS.HEALTH);
  },

  async getApiInfo(): Promise<BaseResponse<Record<string, unknown>>> {
    return get<BaseResponse<Record<string, unknown>>>(API_ENDPOINTS.ROOT);
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function downloadBlob(blob: Blob, filename: string): void {
  if (!browser) return;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.isAuthError;
}

export function isPermissionError(error: unknown): boolean {
  return error instanceof ApiError && error.isPermissionError;
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.isValidationError;
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.isNetworkError;
}

export function getValidationErrors(error: unknown): Array<{ field: string; message: string }> {
  if (error instanceof ApiError && error.isValidationError) {
    return error.validationErrors;
  }
  return [];
}

export function formatApiError(error: unknown): {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  details?: Array<{ field: string; message: string }>;
} {
  if (error instanceof ApiError) {
    if (error.isAuthError) {
      return {
        title: 'Authentication Required',
        message: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน',
        type: 'warning'
      };
    }

    if (error.isPermissionError) {
      return {
        title: 'Access Denied',
        message: 'ไม่มีสิทธิ์ในการดำเนินการนี้',
        type: 'warning'
      };
    }

    if (error.isValidationError) {
      return {
        title: 'Validation Error',
        message: 'ข้อมูลที่กรอกไม่ถูกต้อง',
        type: 'error',
        details: error.validationErrors
      };
    }

    if (error.isNetworkError) {
      return {
        title: 'Network Error',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        type: 'error'
      };
    }

    return {
      title: 'API Error',
      message: error.message,
      type: 'error'
    };
  }

  return {
    title: 'Unknown Error',
    message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    type: 'error'
  };
}

export function createAbortController(timeoutMs: number = APP_CONFIG.PERFORMANCE.REQUEST_TIMEOUT): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

export async function exportToExcel(
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
};

export type { RequestInterceptor, ResponseInterceptor, RetryConfig };