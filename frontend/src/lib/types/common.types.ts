// frontend/src/lib/types/common.types.ts
// Common base types used across the application
// ✅ Foundation types for all other modules

// ============================================
// BASE RESPONSE TYPES
// ============================================

/**
 * Standard API response wrapper
 * All backend responses follow this structure
 */
export interface BaseResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: string[];
  timestamp?: string;
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = unknown> extends BaseResponse<T> {
  success: true;
  data: T;
}

// ============================================
// PAGINATION TYPES
// ============================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ============================================
// SORTING & FILTERING TYPES
// ============================================

/**
 * Sort order options
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Base sort parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

/**
 * Search parameters
 */
export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

/**
 * Complete query parameters
 */
export interface QueryParams extends PaginationParams, SortParams, SearchParams {
  isActive?: boolean;
  [key: string]: unknown;
}

// ============================================
// ENTITY BASE TYPES
// ============================================

/**
 * Base entity fields (common to all database entities)
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Entity with soft delete
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt: string | null;
}

/**
 * Entity creation data (no id, timestamps)
 */
export type CreateEntityData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Entity update data (partial, no id, timestamps)
 */
export type UpdateEntityData<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// ============================================
// FORM & VALIDATION TYPES
// ============================================

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: FieldError[];
}

/**
 * Form state
 */
export interface FormState<T> {
  data: T;
  isSubmitting: boolean;
  isValid: boolean;
  errors: FieldError[];
  touched: Record<keyof T, boolean>;
}

// ============================================
// HTTP & API TYPES
// ============================================

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * HTTP status codes (common ones)
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// ============================================
// UI & COMPONENT TYPES
// ============================================

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color variants (semantic)
 */
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Button variants
 */
export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'ghost';

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * Alert/notification type
 */
export interface Alert {
  id: string;
  type: ColorVariant;
  title?: string;
  message: string;
  duration?: number;
  closeable?: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Deep partial (makes all nested properties optional)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Non-nullable type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * String literal union
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;

// ============================================
// FILE & UPLOAD TYPES
// ============================================

/**
 * File upload status
 */
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * File upload result
 */
export interface FileUploadResult {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  status: UploadStatus;
  error?: string;
}

/**
 * File validation rules
 */
export interface FileValidationRules {
  maxSize: number;
  allowedTypes: string[];
  allowedExtensions: string[];
  maxFiles: number;
}

// ============================================
// TIMESTAMP & DATE TYPES
// ============================================

/**
 * ISO date string
 */
export type ISODateString = string;

/**
 * Timestamp (Unix timestamp in milliseconds)
 */
export type Timestamp = number;

/**
 * Date input formats accepted by the system
 */
export type DateInput = Date | ISODateString | Timestamp;