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

// Disease Types (from disease.schema.ts)
export type {
  CreateDiseaseRequest,
  UpdateDiseaseRequest,
  DiseaseQueryParams,
  DiseaseParam,
  DiseaseInfo,
  DiseaseListResponse,
  DiseaseDetailResponse,
  DiseaseCreateUpdateResponse,
  DiseaseDeleteResponse,
  DiseaseErrorResponse,
  DiseaseRequestTypes,
  DiseaseResponseTypes,
} from '../schemas/disease.schema';

// Symptom Types (from symptom.schema.ts) - แยก DiseaseParam ออกเพื่อไม่ให้ duplicate
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

// Report Types (from report.schema.ts)
export type {
  BaseReportQuery,
  IncidenceDataQuery,
  GenderDataQuery,
  TrendDataQuery,
  PopulationDataQuery,
  PatientVisitDataItem,
  PopulationDataItem,
  AggregatedCountData,
  PatientVisitDataResponse,
  PopulationDataResponse,
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

// Service response wrapper (ใช้ any หรือ generic แทน)
export interface PatientVisitListResult<T = any> {
  data: T[];
  pagination: PaginationMeta;
}