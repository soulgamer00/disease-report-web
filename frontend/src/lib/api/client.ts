// frontend/src/lib/api/client.ts
// HTTP API Client with type safety and error handling
// ✅ Production-ready API client using our type system

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
import type { AuthError } from '$lib/types/auth.types';

// ============================================
// API ERROR CLASS
// ============================================

export class ApiClientError extends Error implements ApiError {
  public name = 'ApiClientError';
  public type: ApiErrorType;
  public status: number;
  public statusText: string;
  public data?: any;
  public timestamp: Date;
  public url?: string;
  public method?: any;
  public retryCount?: number;
  public isRetryable: boolean;

  constructor(
    message: string,
    type: ApiErrorType,
    status: number,
    statusText: string,
    data?: any,
    url?: string,
    method?: any
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
  // HTTP METHODS
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
  // CORE REQUEST METHOD
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
        delete (fetchOptions.headers as any)['Content-Type'];
      } else {
        fetchOptions.body = JSON.stringify(config.data);
      }
    }

    // Execute request with retries
    return this.executeWithRetries(fullUrl, fetchOptions, config);
  }

  // ============================================
  // RETRY LOGIC
  // ============================================

  private async executeWithRetries<T>(
    url: string,
    fetchOptions: RequestInit,
    config: RequestConfig,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      // Set timeout
      const timeoutId = setTimeout(() => {
        if (config.signal && !config.signal.aborted) {
          (config.signal as any).abort();
        }
      }, config.timeout || this.config.timeout);

      // Make request
      const response = await fetch(url, fetchOptions);
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
        
        return this.executeWithRetries(url, fetchOptions, config, retryCount + 1);
      }

      // No more retries, throw error
      apiError.retryCount = retryCount;
      throw apiError;
    }
  }

  // ============================================
  // RESPONSE PARSING
  // ============================================

  private async parseResponse<T>(
    response: Response,
    url: string,
    method: string
  ): Promise<ApiResponse<T>> {
    let data: any;
    
    try {
      // Try to parse as JSON
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      // If JSON parsing fails, treat as error
      throw new ApiClientError(
        'Failed to parse response as JSON',
        'SERVER_ERROR',
        response.status,
        response.statusText,
        null,
        url,
        method
      );
    }

    // Check if response indicates success
    if (!response.ok) {
      throw new ApiClientError(
        data?.message || `HTTP ${response.status}: ${response.statusText}`,
        this.getErrorTypeFromStatus(response.status),
        response.status,
        response.statusText,
        data,
        url,
        method
      );
    }

    // Handle backend error responses (success: false)
    if (data && typeof data === 'object' && data.success === false) {
      throw new ApiClientError(
        data.message || 'Request failed',
        this.getErrorTypeFromData(data),
        response.status,
        response.statusText,
        data,
        url,
        method
      );
    }

    return data as ApiResponse<T>;
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private createApiError(error: unknown, url: string, method: string): ApiClientError {
    if (error instanceof ApiClientError) {
      return error;
    }

    if (error instanceof Error) {
      // Network or timeout error
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return new ApiClientError(
          'Request timeout',
          'TIMEOUT_ERROR',
          0,
          'Timeout',
          null,
          url,
          method
        );
      }

      return new ApiClientError(
        error.message || 'Network error',
        'NETWORK_ERROR',
        0,
        'Network Error',
        null,
        url,
        method
      );
    }

    return new ApiClientError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      0,
      'Unknown Error',
      null,
      url,
      method
    );
  }

  private getErrorTypeFromStatus(status: number): ApiErrorType {
    if (status === 400) return 'VALIDATION_ERROR';
    if (status === 401) return 'AUTHENTICATION_ERROR';
    if (status === 403) return 'AUTHORIZATION_ERROR';
    if (status === 404) return 'NOT_FOUND_ERROR';
    if (status >= 500) return 'SERVER_ERROR';
    return 'UNKNOWN_ERROR';
  }

  private getErrorTypeFromData(data: any): ApiErrorType {
    if (data?.error === 'Authentication required') return 'AUTHENTICATION_ERROR';
    if (data?.error === 'Access denied') return 'AUTHORIZATION_ERROR';
    if (data?.error === 'Validation failed') return 'VALIDATION_ERROR';
    return 'SERVER_ERROR';
  }

  // ============================================
  // INTERCEPTORS
  // ============================================

  private addDefaultInterceptors(): void {
    // Default request interceptor (add auth headers, etc.)
    this.addRequestInterceptor(async (config) => {
      // Add any default headers or auth tokens here
      return config;
    });

    // Default response interceptor (handle auth errors)
    this.addResponseInterceptor(async (response) => {
      return response;
    });
  }

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
    let result: any = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  // ============================================
  // UTILITY METHODS
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
// SINGLETON INSTANCE
// ============================================

// Create singleton API client instance
export const apiClient = new ApiClient();

// ============================================
// CONVENIENCE FUNCTIONS
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
// AUTH INTERCEPTORS SETUP
// ============================================

/**
 * Setup authentication interceptors
 * This handles automatic logout on 401 responses
 */
export function setupAuthInterceptors(): void {
  // Response interceptor to handle auth errors
  addGlobalResponseInterceptor(async (response: any) => {
    // Handle authentication errors
    if (response && response.success === false) {
      const authError = response as AuthError;
      
      if (authError.code === 'TOKEN_EXPIRED' || authError.code === 'TOKEN_INVALID') {
        // Try to refresh token first
        // If refresh fails, redirect to login
        if (browser) {
          goto('/login');
        }
      }
    }
    
    return response;
  });
}

// ============================================
// ERROR HANDLER SETUP
// ============================================

/**
 * Setup global error handling
 */
export function setupErrorHandling(): void {
  if (browser) {
    // Handle uncaught API errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason instanceof ApiClientError) {
        console.error('Unhandled API Error:', event.reason);
        
        // Handle critical errors
        if (event.reason.type === 'AUTHENTICATION_ERROR') {
          goto('/login');
        }
      }
    });
  }
}

// Initialize default setup
if (browser) {
  setupAuthInterceptors();
  setupErrorHandling();
}