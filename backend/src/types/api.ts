// backend/src/types/api.ts

// ============================================
// RE-EXPORT TYPES FROM EXISTING SCHEMAS
// ============================================

// Auth Types (from auth.schema.ts)
export type {
  LoginRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  UserInfo,
  LoginResponse,
  ChangePasswordResponse,
  RefreshTokenResponse,
  JwtPayload,
  AuthErrorResponse,
  AuthRequestTypes,
  AuthResponseTypes,
} from '../schemas/auth.schema';

// Patient Visit Types (from patientVisit.schema.ts)
export type {
  CreatePatientVisitRequest,
  UpdatePatientVisitRequest,
  PatientVisitQueryParams,
  PatientVisitParam,
  PatientVisitInfo,
  PatientVisitListResponse,
  PatientVisitDetailResponse,
  PatientVisitCreateUpdateResponse,
  PatientVisitDeleteResponse,
  PatientVisitErrorResponse,
  PatientVisitRequestTypes,
  PatientVisitResponseTypes,
} from '../schemas/patientVisit.schema';

// Disease Types (from disease.schema.ts) - import with alias to avoid conflict
export type {
  CreateDiseaseRequest,
  UpdateDiseaseRequest,
  DiseaseQueryParams,
  DiseaseParam,
  DiseaseListResponse,
  DiseaseDetailResponse,
  DiseaseCreateUpdateResponse,
  DiseaseDeleteResponse,
  DiseaseErrorResponse,
  DiseaseRequestTypes,
  DiseaseResponseTypes,
} from '../schemas/disease.schema';

// Import DiseaseInfo with alias to avoid conflict with report schema
export type { DiseaseInfo as DiseaseEntityInfo } from '../schemas/disease.schema';

// Symptom Types (from symptom.schema.ts)
export type {
  CreateSymptomRequest,
  UpdateSymptomRequest,
  SymptomQueryParams,
  SymptomParam,
  SymptomInfo,
  SymptomListResponse,
  SymptomDetailResponse,
  SymptomCreateUpdateResponse,
  SymptomDeleteResponse,
  DiseaseSymptomListResponse,
  SymptomErrorResponse,
  SymptomRequestTypes,
  SymptomResponseTypes,
} from '../schemas/symptom.schema';

// Import DiseaseParam with alias to avoid conflict
export type { DiseaseParam as SymptomDiseaseParam } from '../schemas/symptom.schema';

// Hospital Types (from hospital.schema.ts)
export type {
  CreateHospitalRequest,
  UpdateHospitalRequest,
  HospitalQueryParams,
  HospitalParam,
  HospitalCodeParam,
  HospitalInfo,
  HospitalListResponse,
  HospitalDetailResponse,
  HospitalCreateUpdateResponse,
  HospitalDeleteResponse,
  HospitalStatisticsResponse,
  HospitalErrorResponse,
  HospitalRequestTypes,
  HospitalResponseTypes,
} from '../schemas/hospital.schema';

// Population Types (from population.schema.ts)
export type {
  CreatePopulationRequest,
  UpdatePopulationRequest,
  PopulationQueryParams,
  PopulationParam,
  YearParam,
  PopulationInfo,
  PopulationListResponse,
  PopulationDetailResponse,
  PopulationCreateUpdateResponse,
  PopulationDeleteResponse,
  PopulationStatisticsResponse,
  PopulationErrorResponse,
  PopulationRequestTypes,
  PopulationResponseTypes,
} from '../schemas/population.schema';

// Import HospitalCodeParam with alias to avoid conflict
export type { HospitalCodeParam as PopulationHospitalCodeParam } from '../schemas/population.schema';

// User Types (from user.schema.ts)
export type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateProfileRequest,
  AdminChangePasswordRequest,
  UserQueryParams,
  UserParam,
  UserListResponse,
  UserDetailResponse,
  UserCreateUpdateResponse,
  UserDeleteResponse,
  PasswordChangeResponse,
  UserErrorResponse,
  UserRequestTypes,
  UserResponseTypes,
} from '../schemas/user.schema';

// Import UserInfo with alias to avoid conflict with auth UserInfo
export type { UserInfo as UserDetails } from '../schemas/user.schema';
// Import ChangePasswordRequest with alias to avoid conflict
export type { ChangePasswordRequest as UserChangePasswordRequest } from '../schemas/user.schema';

// Report Types (from report.schema.ts) - ใช้เฉพาะ types ที่มีอยู่จริง
export type {
  ReportFilters,
  AgeGroupsReportRequest,
  GenderRatioReportRequest,
  IncidenceRatesReportRequest,
  OccupationReportRequest,
  DiseaseInfo, // This is the report-specific DiseaseInfo
  AgeGroupData,
  GenderRatioData,
  HospitalStats,
  OccupationData,
  DiseaseItem,
  HospitalItem,
  AgeGroupsReportResponse,
  GenderRatioResponse,
  IncidenceRatesResponse,
  OccupationReportResponse,
  DiseasesListResponse,
  HospitalsListResponse,
  PublicStatsResponse,
  ReportErrorResponse,
  ReportRequestTypes,
  ReportResponseTypes,
} from '../schemas/report.schema';

// ============================================
// ADDITIONAL COMMON TYPES (only ones not already defined)
// ============================================

// Simple Pagination (if not already defined in schemas)
export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Basic Filter Types (for internal use)
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchFilter {
  search?: string;
}

// Basic Params (for internal use)
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// UTILITY TYPES FOR SERVICES (ใช้เฉพาะในกรณีจำเป็น)
// ============================================

// For service layer use
export interface PatientVisitFilters extends DateRangeFilter, SearchFilter {
  diseaseId?: string;
  hospitalCode9eDigit?: string;
  gender?: 'MALE' | 'FEMALE';
  patientType?: 'IPD' | 'OPD' | 'ACF';
  patientCondition?: 'UNKNOWN' | 'RECOVERED' | 'DIED' | 'UNDER_TREATMENT';
  ageMin?: number;
  ageMax?: number;
  isActive?: boolean;
}

// Service response wrapper - use specific type instead of any
export interface PatientVisitListResult<T = PatientVisitDataItem> {
  data: T[];
  pagination: PaginationMeta;
}

// Generic API response wrapper
export interface ApiResponseWrapper<T> {
  data: T;
  pagination?: PaginationMeta;
  meta?: Record<string, unknown>;
}

// ============================================
// DEFINE MISSING TYPES (ที่ api.ts ต้องการแต่ไม่มีใน schemas)
// ============================================

// Base Report Query (ให้ตรงกับที่ frontend ต้องการ)
export interface BaseReportQuery {
  diseaseId?: string;
  year?: string;
  hospitalCode?: string;
  gender?: 'MALE' | 'FEMALE' | 'all';
  ageGroup?: string;
  occupation?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Incidence Data Query (extends BaseReportQuery)
export interface IncidenceDataQuery extends BaseReportQuery {
  groupBy?: 'disease' | 'hospital' | 'month';
}

// Gender Data Query (extends BaseReportQuery) 
export interface GenderDataQuery extends BaseReportQuery {
  ageGroup?: 'all' | 'children' | 'adults' | 'elderly';
}

// Trend Data Query (extends BaseReportQuery)
export interface TrendDataQuery extends BaseReportQuery {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Population Data Query (extends BaseReportQuery)
export interface PopulationDataQuery extends BaseReportQuery {
  includePopulation?: boolean;
}

// Patient Visit Data Item
export interface PatientVisitDataItem {
  id: string;
  hn: string;
  visitDate: Date;
  diseaseId: string;
  diseaseName: string;
  hospitalCode: string;
  hospitalName: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  patientType: 'IPD' | 'OPD' | 'ACF';
  patientCondition: 'UNKNOWN' | 'RECOVERED' | 'DIED' | 'UNDER_TREATMENT';
}

// Population Data Item
export interface PopulationDataItem {
  hospitalCode: string;
  hospitalName: string;
  year: number;
  population: number;
  ageGroup?: string;
  gender?: 'MALE' | 'FEMALE' | 'ALL';
}

// Aggregated Count Data
export interface AggregatedCountData {
  group: string;
  count: number;
  rate?: number;
  percentage?: number;
}

// Patient Visit Data Response
export interface PatientVisitDataResponse {
  success: boolean;
  message: string;
  data: {
    visits: PatientVisitDataItem[];
    pagination: PaginationMeta;
    summary?: {
      totalPatients: number;
      totalVisits: number;
    };
  };
}

// Population Data Response
export interface PopulationDataResponse {
  success: boolean;
  message: string;
  data: {
    populations: PopulationDataItem[];
    summary: {
      totalPopulation: number;
      yearsCovered: number[];
      hospitalsWithData: number;
    };
  };
}