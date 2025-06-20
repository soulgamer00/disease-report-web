// src/lib/types/hospital.types.ts
// ✅ Hospital TypeScript types extracted from backend Zod schemas
// These types MUST match exactly with backend definitions

// ============================================
// CORE HOSPITAL TYPES (from backend schemas)
// ============================================

export interface HospitalInfo {
  id: string;
  hospitalName: string;
  hospitalCode9eDigit: string;
  hospitalCode9Digit?: string | null;
  hospitalCode5Digit?: string | null;
  organizationType?: string | null;
  healthServiceType?: string | null;
  affiliation?: string | null;
  departmentDivision?: string | null;
  subDepartment?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  address?: string | null;
  postalCode?: string | null;
  phoneNumber?: string | null;
  faxNumber?: string | null;
  email?: string | null;
  website?: string | null;
  directorName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateHospitalRequest {
  hospitalName: string;
  hospitalCode9eDigit: string;
  hospitalCode9Digit?: string;
  hospitalCode5Digit?: string;
  organizationType?: string;
  healthServiceType?: string;
  affiliation?: string;
  departmentDivision?: string;
  subDepartment?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  address?: string;
  postalCode?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  directorName?: string;
  isActive?: boolean;
}

export interface UpdateHospitalRequest {
  hospitalName?: string;
  hospitalCode9eDigit?: string;
  hospitalCode9Digit?: string;
  hospitalCode5Digit?: string;
  organizationType?: string;
  healthServiceType?: string;
  affiliation?: string;
  departmentDivision?: string;
  subDepartment?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  address?: string;
  postalCode?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  directorName?: string;
  isActive?: boolean;
}

export interface HospitalQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationType?: string;
  healthServiceType?: string;
  affiliation?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface HospitalListResponse {
  success: boolean;
  message: string;
  data: {
    hospitals: HospitalInfo[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      pageSize: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface HospitalDetailResponse {
  success: boolean;
  message: string;
  data: {
    hospital: HospitalInfo;
    includePopulations?: boolean;
  };
}

export interface HospitalCreateUpdateResponse {
  success: boolean;
  message: string;
  data: {
    hospital: HospitalInfo;
  };
}

export interface HospitalDeleteResponse {
  success: boolean;
  message: string;
  data: {
    deletedId: string;
    deletedAt: string;
  };
}

export interface HospitalStatisticsResponse {
  success: boolean;
  message: string;
  data: {
    totalHospitals: number;
    activeHospitals: number;
    inactiveHospitals: number;
    byOrganizationType: Record<string, number>;
    byHealthServiceType: Record<string, number>;
    byAffiliation: Record<string, number>;
    byProvince: Record<string, number>;
  };
}

export interface HospitalErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: unknown;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface HospitalCodeMapping {
  code: string;
  name: string;
  province?: string;
}

export interface HospitalFormData extends CreateHospitalRequest {
  // Additional form-specific fields can go here
}

export interface HospitalTableRow extends HospitalInfo {
  // Additional display fields
  displayCode: string;
  displayStatus: string;
  displayLocation: string;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface HospitalFilters {
  search: string;
  organizationType: string;
  healthServiceType: string;
  affiliation: string;
  province: string;
  isActive: boolean | null;
}

export interface HospitalSortOptions {
  field: keyof HospitalInfo;
  direction: 'asc' | 'desc';
}

// ============================================
// API STATE TYPES
// ============================================

export interface HospitalListState {
  hospitals: HospitalInfo[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  loading: boolean;
  error: string | null;
  filters: HospitalFilters;
  sort: HospitalSortOptions;
}

export interface HospitalDetailState {
  hospital: HospitalInfo | null;
  loading: boolean;
  error: string | null;
}

export interface HospitalFormState {
  data: HospitalFormData;
  loading: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}

// ============================================
// DROPDOWN OPTIONS
// ============================================

export interface HospitalDropdownOptions {
  organizationTypes: Array<{ value: string; label: string }>;
  healthServiceTypes: Array<{ value: string; label: string }>;
  affiliations: Array<{ value: string; label: string }>;
  provinces: Array<{ value: string; label: string }>;
}