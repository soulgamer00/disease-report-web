// frontend/src/lib/types/api.types.ts
// API client and HTTP request/response types
// ✅ Type-safe API communication

import type { 
  HttpMethod, 
  BaseResponse, 
  ErrorResponse, 
  PaginatedResponse,
  QueryParams 
} from './common.types';
import type { AuthError } from './auth.types';

// ============================================
// API CLIENT CONFIGURATION
// ============================================

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
}

/**
 * Request configuration
 */
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  withCredentials?: boolean;
  signal?: AbortSignal;
}

/**
 * Response configuration
 */
export interface ResponseConfig<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

// ============================================
// API ERROR TYPES
// ============================================

/**
 * API error categories
 */
export type ApiErrorType = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * API error class
 */
export interface ApiError {
  name: string;
  message: string;
  type: ApiErrorType;
  status: number;
  statusText: string;
  data?: ErrorResponse | AuthError | Record<string, unknown>;
  timestamp: Date;
  url?: string;
  method?: HttpMethod;
  retryCount?: number;
  isRetryable: boolean;
}

/**
 * Network error (connection issues)
 */
export interface NetworkError extends Omit<ApiError, 'type'> {
  type: 'NETWORK_ERROR';
  originalError?: Error;
}

/**
 * Timeout error
 */
export interface TimeoutError extends Omit<ApiError, 'type'> {
  type: 'TIMEOUT_ERROR';
  timeoutDuration: number;
}

/**
 * Validation error (400 Bad Request)
 */
export interface ValidationError extends Omit<ApiError, 'type'> {
  type: 'VALIDATION_ERROR';
  validationErrors: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}

// ============================================
// API REQUEST TYPES
// ============================================

/**
 * GET request parameters
 */
export interface GetRequestParams extends QueryParams {
  [key: string]: unknown;
}

/**
 * POST request body
 */
export interface PostRequestBody {
  [key: string]: unknown;
}

/**
 * PUT request body
 */
export interface PutRequestBody {
  [key: string]: unknown;
}

/**
 * PATCH request body
 */
export interface PatchRequestBody {
  [key: string]: unknown;
}

/**
 * DELETE request parameters
 */
export interface DeleteRequestParams {
  [key: string]: unknown;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Generic API response
 */
export type ApiResponse<T = unknown> = BaseResponse<T>;

/**
 * Success API response
 */
export interface ApiSuccessResponse<T = unknown> extends BaseResponse<T> {
  success: true;
  data: T;
}

/**
 * Error API response
 */
export interface ApiErrorResponse extends ErrorResponse {
  success: false;
}

/**
 * Paginated API response
 */
export interface ApiPaginatedResponse<T> extends BaseResponse<PaginatedResponse<T>> {
  success: true;
  data: PaginatedResponse<T>;
}

// ============================================
// HTTP CLIENT INTERFACE
// ============================================

/**
 * HTTP client interface
 */
export interface HttpClient {
  // Configuration
  config: ApiClientConfig;
  
  // Request methods
  get<T = unknown>(url: string, params?: GetRequestParams, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>;
  post<T = unknown>(url: string, data?: PostRequestBody, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>;
  put<T = unknown>(url: string, data?: PutRequestBody, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>;
  patch<T = unknown>(url: string, data?: PatchRequestBody, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>;
  delete<T = unknown>(url: string, params?: DeleteRequestParams, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>;
  
  // Utility methods
  request<T = unknown>(config: RequestConfig): Promise<ApiResponse<T>>;
  setBaseUrl(baseUrl: string): void;
  setDefaultHeaders(headers: Record<string, string>): void;
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
}

// ============================================
// INTERCEPTOR TYPES
// ============================================

/**
 * Request interceptor function
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function
 */
export type ResponseInterceptor = (response: ResponseConfig) => ResponseConfig | Promise<ResponseConfig>;

/**
 * Error interceptor function
 */
export type ErrorInterceptor = (error: ApiError) => Promise<never> | Promise<ResponseConfig>;

/**
 * Interceptor configuration
 */
export interface InterceptorConfig {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
  error?: ErrorInterceptor[];
}

// ============================================
// API ENDPOINT TYPES
// ============================================

/**
 * API endpoint definition
 */
export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  requiresAuth: boolean;
  timeout?: number;
  retries?: number;
}

/**
 * API endpoint group
 */
export interface ApiEndpointGroup {
  baseUrl: string;
  endpoints: Record<string, ApiEndpoint>;
  defaultHeaders?: Record<string, string>;
}

/**
 * Complete API definition
 */
export interface ApiDefinition {
  baseUrl: string;
  version: string;
  groups: Record<string, ApiEndpointGroup>;
}

// ============================================
// LOADING & CACHE TYPES
// ============================================

/**
 * API loading state
 */
export interface ApiLoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number; // 0-100
}

/**
 * API cache entry
 */
export interface ApiCacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
  tags: string[];
}

/**
 * API cache configuration
 */
export interface ApiCacheConfig {
  enabled: boolean;
  defaultTtl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  storageType: 'memory' | 'localStorage' | 'sessionStorage';
}

/**
 * Cache manager interface
 */
export interface CacheManager {
  get<T>(key: string): ApiCacheEntry<T> | null;
  set<T>(key: string, data: T, ttl?: number, tags?: string[]): void;
  delete(key: string): void;
  clear(): void;
  invalidateByTag(tag: string): void;
  size(): number;
  cleanup(): void; // Remove expired entries
}

// ============================================
// RETRY & CIRCUIT BREAKER TYPES
// ============================================

/**
 * Retry configuration
 */
export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryDelayMultiplier: number;
  maxRetryDelay: number;
  retryCondition: (error: ApiError) => boolean;
}

/**
 * Circuit breaker state
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

/**
 * Circuit breaker status
 */
export interface CircuitBreakerStatus {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

// ============================================
// UPLOAD & DOWNLOAD TYPES
// ============================================

/**
 * File upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  rate: number; // Bytes per second
  estimated: number; // Estimated time remaining in seconds
}

/**
 * Upload configuration
 */
export interface UploadConfig extends Partial<RequestConfig> {
  onProgress?: (progress: UploadProgress) => void;
  chunkSize?: number;
  allowedTypes?: string[];
  maxFileSize?: number;
}

/**
 * Download configuration
 */
export interface DownloadConfig extends Partial<RequestConfig> {
  filename?: string;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Upload response
 */
export interface UploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// WEBSOCKET & REALTIME TYPES
// ============================================

/**
 * WebSocket connection state
 */
export type WebSocketState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

/**
 * WebSocket message
 */
export interface WebSocketMessage<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: number;
}

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect: boolean;
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Extract response data type from API response
 */
export type ApiResponseData<T> = T extends BaseResponse<infer U> ? U : never;

/**
 * Extract success response type
 */
export type ApiSuccessResponseType<T> = T extends ApiResponse<infer U> ? ApiSuccessResponse<U> : never;

/**
 * Extract error response type
 */
export type ApiErrorResponseType = ApiErrorResponse | AuthError;

/**
 * API method return type
 */
export type ApiMethodResult<T> = Promise<ApiResponse<T>>;

/**
 * API client method signature
 */
export type ApiClientMethod<TParams = unknown, TResponse = unknown> = (
  params: TParams,
  config?: Partial<RequestConfig>
) => ApiMethodResult<TResponse>;

// ============================================
// MOCK & TESTING TYPES
// ============================================

/**
 * API mock response
 */
export interface MockResponse<T = unknown> {
  data: T;
  status: number;
  delay?: number;
  headers?: Record<string, string>;
}

/**
 * API mock configuration
 */
export interface MockConfig {
  enabled: boolean;
  baseDelay: number;
  randomDelay: boolean;
  errorRate: number; // 0-1, probability of returning an error
}

/**
 * Mock API client
 */
export interface MockApiClient extends HttpClient {
  addMockResponse(url: string, method: HttpMethod, response: MockResponse): void;
  removeMockResponse(url: string, method: HttpMethod): void;
  clearMockResponses(): void;
  setErrorRate(rate: number): void;
}