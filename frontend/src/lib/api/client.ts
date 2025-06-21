// frontend/src/lib/api/client.ts
// ✅ MINIMAL FIX: Add only auth token refresh functionality 
// Keep existing structure, fix only the critical auth issues

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { buildApiUrl } from '$lib/config';
import type {
  HttpClient,
  ApiClientConfig,
  RequestConfig,
  ApiResponse,
  ApiError,
  ApiErrorType,
  GetRequestParams,
  PostRequestBody,
  PutRequestBody,
  PatchRequestBody,
  DeleteRequestParams,
  RequestInterceptor,
  ResponseInterceptor
} from '$lib/types/api.types';
import type { HttpMethod, ErrorResponse } from '$lib/types/common.types';
import type { AuthError } from '$lib/types/auth.types';

// ============================================
// API ERROR CLASS
// ============================================

export class ApiClientError extends Error implements ApiError {
  public name = 'ApiClientError';
  public type: ApiErrorType;
  public status: number;
  public statusText: string;
  public data?: ErrorResponse | AuthError | Record<string, unknown>;
  public timestamp: Date;
  public url?: string;
  public method?: HttpMethod;
  public retryCount?: number;
  public isRetryable: boolean;

  constructor(
    message: string,
    type: ApiErrorType,
    status: number,
    statusText: string,
    data?: ErrorResponse | AuthError | Record<string, unknown>,
    url?: string,
    method?: HttpMethod
  ) {
    super(message);
    this.type = type;
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.timestamp = new Date();
    this.url = url;
    this.method = method;
    this.retryCount = 0;
    this.isRetryable = this.determineRetryability();
  }

  private determineRetryability(): boolean {
    // Network errors and server errors (5xx) are retryable
    if (this.type === 'NETWORK_ERROR' || this.type === 'TIMEOUT_ERROR') {
      return true;
    }
    if (this.status >= 500) {
      return true;
    }
    // Rate limiting (429) is retryable
    if (this.status === 429) {
      return true;
    }
    return false;
  }
}

// ============================================
// API CLIENT CLASS
// ============================================

export class ApiClient implements HttpClient {
  public config: ApiClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private refreshPromise: Promise<boolean> | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || buildApiUrl(''),
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };

    // Add default interceptors
    this.addDefaultInterceptors();
  }

  // ============================================
  // ENHANCED DEFAULT INTERCEPTORS
  // ============================================

  private addDefaultInterceptors(): void {
    // ✅ FIXED: Enhanced request interceptor with auth token
    this.addRequestInterceptor(async (config) => {
      // Add authentication token from cookies
      if (browser) {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [name, value] = cookie.trim().split('=');
          acc[name] = value;
          return acc;
        }, {} as Record<string, string>);

        const accessToken = cookies.accessToken;
        if (accessToken && !config.headers?.Authorization) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${accessToken}`
          };
        }
      }
      
      return config;
    });

    // ✅ FIXED: Enhanced response interceptor with token refresh
    this.addResponseInterceptor(async (response) => {
      // Handle authentication errors - properly type the response
      const apiResponse = response as unknown as ApiResponse<unknown> & { status?: number; error?: string };
      if (!apiResponse.success && apiResponse.status === 401) {
        // Check error code for token expiry
        const authErrorCode = apiResponse.error;
        
        if (authErrorCode === 'TOKEN_EXPIRED' && browser) {
          const refreshed = await this.tryRefreshToken();
          if (!refreshed) {
            this.handleAuthFailure();
          }
        } else if (authErrorCode === 'TOKEN_INVALID' && browser) {
          this.handleAuthFailure();
        }
      }
      
      return response;
    });
  }

  // ============================================
  // TOKEN REFRESH LOGIC (NEW)
  // ============================================

  private async tryRefreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      console.log('🔄 Attempting token refresh...');
      
      // Call refresh endpoint using the configured baseUrl
      const response = await fetch(`${this.config.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Token refreshed successfully');
          
          // Update user data if provided
          if (data.data.user && browser) {
            const userData = JSON.stringify(data.data.user);
            document.cookie = `userData=${encodeURIComponent(userData)}; path=/; secure; samesite=strict; max-age=604800`;
            localStorage.setItem('userInfo', userData);
            localStorage.setItem('lastActivity', Date.now().toString());
          }
          
          return true;
        }
      }
      
      console.warn('⚠️ Token refresh failed');
      return false;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return false;
    }
  }

  private handleAuthFailure(): void {
    if (!browser) return;
    
    console.log('🔐 Authentication failed, clearing data and redirecting...');
    
    // Clear all auth data
    this.clearAuthData();
    
    // Redirect to login
    const currentPath = window.location.pathname + window.location.search;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    goto(loginUrl);
  }

  private clearAuthData(): void {
    if (!browser) return;
    
    // Clear cookies
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('lastActivity');
  }

  // ============================================
  // HTTP METHODS (UNCHANGED - KEEP EXISTING)
  // ============================================

  async get<T = unknown>(
    url: string, 
    params?: GetRequestParams, 
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...config
    });
  }

  async post<T = unknown>(
    url: string, 
    data?: PostRequestBody, 
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config
    });
  }

  async put<T = unknown>(
    url: string, 
    data?: PutRequestBody, 
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config
    });
  }

  async patch<T = unknown>(
    url: string, 
    data?: PatchRequestBody, 
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config
    });
  }

  async delete<T = unknown>(
    url: string, 
    params?: DeleteRequestParams, 
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      params,
      ...config
    });
  }

  // ============================================
  // CORE REQUEST METHOD (ENHANCED WITH RETRY)
  // ============================================

  async request<T = unknown>(requestConfig: RequestConfig): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let config = await this.applyRequestInterceptors(requestConfig);
    
    // Build full URL
    const fullUrl = this.buildFullUrl(config.url, config.params);
    
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: config.method,
      headers: {
        ...this.config.headers,
        ...config.headers
      },
      credentials: 'include', // Always include cookies for auth
      signal: config.signal
    };

    // Add body for non-GET requests
    if (config.data && config.method !== 'GET') {
      if (config.data instanceof FormData) {
        fetchOptions.body = config.data;
        // Remove Content-Type to let browser set it for FormData
        const headers = fetchOptions.headers as Record<string, string>;
        delete headers['Content-Type'];
      } else {
        fetchOptions.body = JSON.stringify(config.data);
      }
    }

    // Execute request with retries
    return this.executeWithRetries(fullUrl, fetchOptions, config);
  }

  // ============================================
  // RETRY LOGIC (NEW - ENHANCED ERROR HANDLING)
  // ============================================

  private async executeWithRetries<T>(
    url: string,
    fetchOptions: RequestInit,
    config: RequestConfig,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, config.timeout || this.config.timeout);

      // Add abort signal to fetch options
      const finalFetchOptions = {
        ...fetchOptions,
        signal: controller.signal
      };

      // Make request
      const response = await fetch(url, finalFetchOptions);
      clearTimeout(timeoutId);

      // Parse response
      const result = await this.parseResponse<T>(response, url, config.method!);
      
      // Apply response interceptors
      return this.applyResponseInterceptors(result);

    } catch (error) {
      // Handle errors with retry logic
      const apiError = this.createApiError(error, url, config.method!);
      
      // Check if we should retry
      const shouldRetry = retryCount < (config.retries || this.config.retries) && apiError.isRetryable;
      
      if (shouldRetry) {
        // Wait before retry with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        await this.sleep(delay);
        
        console.log(`🔄 Retrying request (${retryCount + 1}/${config.retries || this.config.retries}):`, url);
        return this.executeWithRetries(url, fetchOptions, config, retryCount + 1);
      }

      // No more retries, throw error
      apiError.retryCount = retryCount;
      throw apiError;
    }
  }

  // ============================================
  // RESPONSE PARSING (ENHANCED)
  // ============================================

  private async parseResponse<T>(
    response: Response,
    url: string,
    method: string
  ): Promise<ApiResponse<T>> {
    let data: unknown;
    
    try {
      // Try to parse as JSON
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      // If JSON parsing fails, return the response as text
      data = await response.text();
    }

    // Create response object using existing structure
    const apiResponse: ApiResponse<T> = {
      success: response.ok && ((data as { success?: boolean })?.success !== false),
      data: (data as { data?: T })?.data || (data as T),
      message: (data as { message?: string })?.message || response.statusText,
      timestamp: (data as { timestamp?: string })?.timestamp || new Date().toISOString()
    };

    // Add status for error handling (temporary extension)
    (apiResponse as ApiResponse<T> & { status: number; error?: string }).status = response.status;
    (apiResponse as ApiResponse<T> & { status: number; error?: string }).error = (data as { error?: string })?.error;

    // If response is not ok, throw error
    if (!response.ok) {
      throw this.createApiError(
        new Error(apiResponse.message || 'Request failed'),
        url,
        method,
        response,
        data
      );
    }

    return apiResponse;
  }

  // ============================================
  // ERROR HANDLING (NEW)
  // ============================================

  private createApiError(
    error: unknown,
    url: string,
    method: string,
    response?: Response,
    data?: unknown
  ): ApiClientError {
    if (error instanceof ApiClientError) {
      return error;
    }

    let message: string;
    let type: ApiErrorType;
    let statusCode: number;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        message = 'Request timeout';
        type = 'TIMEOUT_ERROR';
        statusCode = 408;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message = 'Network connection failed';
        type = 'NETWORK_ERROR';
        statusCode = 0;
      } else {
        message = error.message;
        type = 'UNKNOWN_ERROR';
        statusCode = response?.status || 0;
      }
    } else {
      message = 'Unknown error occurred';
      type = 'UNKNOWN_ERROR';
      statusCode = response?.status || 0;
    }

    // Determine specific error type based on status code
    if (statusCode === 401) type = 'AUTHENTICATION_ERROR';
    else if (statusCode === 403) type = 'AUTHORIZATION_ERROR';
    else if (statusCode === 404) type = 'NOT_FOUND_ERROR';
    else if (statusCode === 400) type = 'VALIDATION_ERROR';
    else if (statusCode >= 500) type = 'SERVER_ERROR';

    // Add context to error message
    const contextMessage = `${method} ${url}: ${message}`;
    
    return new ApiClientError(
      contextMessage, 
      type, 
      statusCode, 
      response?.statusText || '', 
      data as ErrorResponse | AuthError | Record<string, unknown>, 
      url, 
      method as HttpMethod
    );
  }

  // ============================================
  // EXISTING METHODS (KEEP UNCHANGED)
  // ============================================

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      // Convert ApiResponse to ResponseConfig for interceptor
      const responseConfig = {
        data: result.data,
        status: (result as ApiResponse<T> & { status?: number }).status || 200,
        statusText: 'OK',
        headers: {},
        config: {
          method: 'GET' as HttpMethod,
          url: '',
        }
      };
      
      const processedConfig = await interceptor(responseConfig);
      
      // Convert back to ApiResponse
      result = {
        success: result.success,
        data: processedConfig.data as T,
        message: result.message,
        timestamp: result.timestamp
      };
    }
    return result;
  }

  // ============================================
  // UTILITY METHODS (UNCHANGED)
  // ============================================

  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
  }

  setDefaultHeaders(headers: Record<string, string>): void {
    this.config.headers = { ...this.config.headers, ...headers };
  }

  private buildFullUrl(url: string, params?: Record<string, unknown>): string {
    // Build base URL
    const baseUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    
    // Add query parameters
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }
    
    return baseUrl;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// SINGLETON INSTANCE (UNCHANGED)
// ============================================

// Create singleton API client instance
export const apiClient = new ApiClient();

// ============================================
// CONVENIENCE FUNCTIONS (UNCHANGED)
// ============================================

/**
 * Create a new API client with custom configuration
 */
export function createApiClient(config?: Partial<ApiClientConfig>): ApiClient {
  return new ApiClient(config);
}

/**
 * Configure global API client
 */
export function configureApiClient(config: Partial<ApiClientConfig>): void {
  apiClient.config = { ...apiClient.config, ...config };
}

/**
 * Add global request interceptor
 */
export function addGlobalRequestInterceptor(interceptor: RequestInterceptor): void {
  apiClient.addRequestInterceptor(interceptor);
}

/**
 * Add global response interceptor
 */
export function addGlobalResponseInterceptor(interceptor: ResponseInterceptor): void {
  apiClient.addResponseInterceptor(interceptor);
}

// ============================================
// ERROR HANDLER SETUP (NEW)
// ============================================

/**
 * Setup global error handling
 */
export function setupErrorHandling(): void {
  if (browser) {
    // Handle uncaught API errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason instanceof ApiClientError) {
        console.error('🚨 Unhandled API Error:', {
          type: event.reason.type,
          status: event.reason.status,
          message: event.reason.message,
          retryCount: event.reason.retryCount
        });
      }
    });
  }
}

// Initialize default setup
if (browser) {
  setupErrorHandling();
}