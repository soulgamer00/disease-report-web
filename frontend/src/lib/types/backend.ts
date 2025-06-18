// frontend/src/lib/types/backend.ts
// Type definitions extracted from backend Zod schemas and Prisma enums
// ✅ Single source of truth for frontend types
// ✅ 100% match with backend schemas

// ============================================
// BASE TYPES
// ============================================

export interface BaseResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================
// ENUMS (matching Backend Prisma Schema exactly)
// ============================================

export enum UserRoleEnum {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum NamePrefixEnum {
  MR = 'MR',
  MS = 'MS',
  MRS = 'MRS',
  BOY = 'BOY',
  GIRL = 'GIRL',
  OTHER = 'OTHER'
}

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum MaritalStatusEnum {
  SINGLE = 'SINGLE',
  UNKNOWN = 'UNKNOWN',
  MONK = 'MONK',
  WIDOWED = 'WIDOWED',
  DIVORCED = 'DIVORCED',
  MARRIED = 'MARRIED',
  SEPARATED = 'SEPARATED'
}

export enum OccupationEnum {
  STUDENT = 'STUDENT',
  DEPENDENT = 'DEPENDENT',
  GOVERNMENT_OFFICIAL = 'GOVERNMENT_OFFICIAL',
  STATE_ENTERPRISE = 'STATE_ENTERPRISE',
  GENERAL_LABOR = 'GENERAL_LABOR',
  PRIVATE_BUSINESS = 'PRIVATE_BUSINESS',
  FARMER = 'FARMER',
  GOV_EMPLOYEE = 'GOV_EMPLOYEE',
  PRIVATE_EMPLOYEE = 'PRIVATE_EMPLOYEE',
  HOMEMAKER = 'HOMEMAKER',
  CLERGY = 'CLERGY',
  TRADER = 'TRADER',
  UNEMPLOYED = 'UNEMPLOYED',
  OTHER = 'OTHER'
}

export enum TreatmentAreaEnum {
  MUNICIPALITY = 'MUNICIPALITY',
  SAO = 'SAO',
  UNKNOWN = 'UNKNOWN'
}

export enum PatientTypeEnum {
  IPD = 'IPD',
  OPD = 'OPD',
  ACF = 'ACF'
}

export enum PatientConditionEnum {
  UNKNOWN = 'UNKNOWN',
  RECOVERED = 'RECOVERED',
  DIED = 'DIED',
  UNDER_TREATMENT = 'UNDER_TREATMENT'
}

// ============================================
// THAI ENUM MAPPINGS
// ============================================

// Generic type for enum mappings
type EnumMapping<T extends string> = Record<T, string>;

// Name Prefix Mapping
export const namePrefixMapping: EnumMapping<NamePrefixEnum> = {
  MR: 'นาย',
  MS: 'นางสาว',
  MRS: 'นาง',
  BOY: 'เด็กชาย',
  GIRL: 'เด็กหญิง',
  OTHER: 'อื่นๆ',
} as const;

// Gender Mapping
export const genderMapping: EnumMapping<GenderEnum> = {
  MALE: 'ชาย',
  FEMALE: 'หญิง',
} as const;

// Marital Status Mapping
export const maritalStatusMapping: EnumMapping<MaritalStatusEnum> = {
  SINGLE: 'โสด',
  UNKNOWN: 'ไม่ทราบ',
  MONK: 'บรรพชิต',
  WIDOWED: 'หม้าย',
  DIVORCED: 'หย่า',
  MARRIED: 'แต่งงาน',
  SEPARATED: 'แยกกันอยู่',
} as const;

// Occupation Mapping
export const occupationMapping: EnumMapping<OccupationEnum> = {
  STUDENT: 'นักเรียน/นักศึกษา',
  DEPENDENT: 'ผู้อยู่ในอุปการะ',
  GOVERNMENT_OFFICIAL: 'ข้าราชการ',
  STATE_ENTERPRISE: 'รัฐวิสาหกิจ',
  GENERAL_LABOR: 'กรรมกรทั่วไป',
  PRIVATE_BUSINESS: 'ธุรกิจส่วนตัว',
  FARMER: 'เกษตรกร',
  GOV_EMPLOYEE: 'พนักงานรัฐบาล',
  PRIVATE_EMPLOYEE: 'พนักงานเอกชน',
  HOMEMAKER: 'แม่บ้าน',
  CLERGY: 'นักบวช',
  TRADER: 'ค้าขาย',
  UNEMPLOYED: 'ว่างงาน',
  OTHER: 'อื่นๆ',
} as const;

// Treatment Area Mapping
export const treatmentAreaMapping: EnumMapping<TreatmentAreaEnum> = {
  MUNICIPALITY: 'เทศบาล',
  SAO: 'องค์การบริหารส่วนตำบล',
  UNKNOWN: 'ไม่ทราบ',
} as const;

// Patient Type Mapping
export const patientTypeMapping: EnumMapping<PatientTypeEnum> = {
  IPD: 'ผู้ป่วยใน (IPD)',
  OPD: 'ผู้ป่วยนอก (OPD)',
  ACF: 'การค้นหาเชิงรุก (ACF)',
} as const;

// Patient Condition Mapping
export const patientConditionMapping: EnumMapping<PatientConditionEnum> = {
  UNKNOWN: 'ไม่ทราบ',
  RECOVERED: 'หายแล้ว',
  DIED: 'เสียชีวิต',
  UNDER_TREATMENT: 'กำลังรักษา',
} as const;

// User Role Mapping
export const userRoleMapping: EnumMapping<UserRoleEnum> = {
  SUPERADMIN: 'ผู้ดูแลระบบหลัก',
  ADMIN: 'ผู้ดูแลระบบ',
  USER: 'ผู้ใช้งาน',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper functions for enum conversions
export const getThaiNamePrefix = (prefix: NamePrefixEnum): string => namePrefixMapping[prefix];
export const getThaiGender = (gender: GenderEnum): string => genderMapping[gender];
export const getThaiMaritalStatus = (status: MaritalStatusEnum): string => maritalStatusMapping[status];
export const getThaiOccupation = (occupation: OccupationEnum): string => occupationMapping[occupation];
export const getThaiTreatmentArea = (area: TreatmentAreaEnum): string => treatmentAreaMapping[area];
export const getThaiPatientType = (type: PatientTypeEnum): string => patientTypeMapping[type];
export const getThaiPatientCondition = (condition: PatientConditionEnum): string => patientConditionMapping[condition];
export const getThaiUserRole = (role: UserRoleEnum): string => userRoleMapping[role];

// Generate dropdown options from enums
export const generateDropdownOptions = <T extends string>(
  enumMapping: EnumMapping<T>
): Array<{ value: T; label: string }> => {
  return Object.entries(enumMapping).map(([value, label]) => ({
    value: value as T,
    label: label as string,
  }));
};

// Pre-generated dropdown options for common use
export const dropdownOptions = {
  namePrefix: generateDropdownOptions(namePrefixMapping),
  gender: generateDropdownOptions(genderMapping),
  maritalStatus: generateDropdownOptions(maritalStatusMapping),
  occupation: generateDropdownOptions(occupationMapping),
  treatmentArea: generateDropdownOptions(treatmentAreaMapping),
  patientType: generateDropdownOptions(patientTypeMapping),
  patientCondition: generateDropdownOptions(patientConditionMapping),
  userRole: generateDropdownOptions(userRoleMapping),
} as const;

// Export all mappings as a single object for easier access
export const enumMappings = {
  namePrefix: namePrefixMapping,
  gender: genderMapping,
  maritalStatus: maritalStatusMapping,
  occupation: occupationMapping,
  treatmentArea: treatmentAreaMapping,
  patientType: patientTypeMapping,
  patientCondition: patientConditionMapping,
  userRole: userRoleMapping,
} as const;

// ============================================
// AUTH TYPES (100% match with backend schemas)
// ============================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  userRole: UserRoleEnum;
  userRoleId: number;
  hospitalCode9eDigit: string | null;
  hospital: {
    id: string;
    hospitalName: string;
    hospitalCode9eDigit: string;
  } | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional field for user management endpoints
  isActive?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserInfo;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data: {
    updatedAt: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

// ============================================
// PATIENT VISIT TYPES
// ============================================

export interface Disease {
  id: string;
  engName: string;
  thaiName: string;
  shortName: string;
  details?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiseaseWithSymptoms extends Disease {
  symptoms?: string[] | null;
}

export interface Hospital {
  id: string;
  hospitalName: string;
  hospitalCode9eDigit: string;
  organizationType?: string | null;
  healthServiceType?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientVisitSummary {
  id: string;
  idCardCode: string;
  namePrefix: NamePrefixEnum;
  fname: string;
  lname: string;
  gender: GenderEnum;
  birthday: string;
  ageAtIllness: number;
  nationality: string;
  diseaseId: string;
  illnessDate: string;
  treatmentDate: string;
  diagnosisDate: string;
  patientType: PatientTypeEnum;
  patientCondition: PatientConditionEnum;
  hospitalCode9eDigit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  disease?: {
    id: string;
    engName: string;
    thaiName: string;
    shortName: string;
  };
  hospital?: {
    id: string;
    hospitalName: string;
    hospitalCode9eDigit: string;
  };
}

export interface PatientVisitInfo extends PatientVisitSummary {
  maritalStatus: MaritalStatusEnum;
  occupation: OccupationEnum;
  phoneNumber?: string | null;
  currentHouseNumber?: string | null;
  currentVillageNumber?: string | null;
  currentRoadName?: string | null;
  currentProvince?: string | null;
  currentDistrict?: string | null;
  currentSubDistrict?: string | null;
  addressSickHouseNumber?: string | null;
  addressSickVillageNumber?: string | null;
  addressSickRoadName?: string | null;
  addressSickProvince: string;
  addressSickDistrict?: string | null;
  addressSickSubDistrict?: string | null;
  symptomsOfDisease?: string | null;
  treatmentArea: TreatmentAreaEnum;
  treatmentHospital?: string | null;
  diagnosis1?: string | null;
  diagnosis2?: string | null;
  deathDate?: string | null;
  causeOfDeath?: string | null;
  receivingProvince: string;
  reportName?: string | null;
  remarks?: string | null;
  createdBy: string;
}

// ============================================
// QUERY PARAMETERS
// ============================================

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface PatientVisitQueryParams extends QueryParams {
  diseaseId?: string;
  hospitalCode9eDigit?: string;
  startDate?: string;
  endDate?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: GenderEnum;
  patientType?: PatientTypeEnum;
  patientCondition?: PatientConditionEnum;
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface PatientVisitStatistics {
  total: number;
  byGender: Record<GenderEnum, number>;
  byPatientType: Record<PatientTypeEnum, number>;
  byPatientCondition: Record<PatientConditionEnum, number>;
  byDisease: Array<{
    diseaseId: string;
    thaiName: string;
    count: number;
  }>;
  byHospital: Array<{
    hospitalCode9eDigit: string;
    hospitalName: string;
    count: number;
  }>;
  byMonth: Array<{
    month: string;
    count: number;
  }>;
}

// ============================================
// REPORT TYPES
// ============================================

export interface ReportQueryParams extends QueryParams {
  diseaseId?: string;
  hospitalCode9eDigit?: string;
  startDate?: string;
  endDate?: string;
  reportType?: 'incidence' | 'gender' | 'trend';
}

export interface IncidenceDataQuery extends ReportQueryParams {
  groupBy?: 'disease' | 'hospital' | 'month';
}

export interface GenderDataQuery extends ReportQueryParams {
  ageGroup?: 'all' | 'children' | 'adults' | 'elderly';
}

export interface IncidenceDataItem {
  group: string;
  count: number;
  rate?: number;
  diseaseCode?: string;
  diseaseName?: string;
}

export interface GenderDataItem {
  group: string;
  maleCount: number;
  femaleCount: number;
  totalCount: number;
  malePercentage?: number;
  femalePercentage?: number;
}

export interface TrendDataItem {
  date: string;
  period: string;
  patientCount: number;
  incidenceRate?: number;
  genderRatio?: number;
}

export interface ReportSummary {
  totalCount: number;
  genderDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  hospitalDistribution?: Record<string, number>;
  diseaseDistribution?: Record<string, number>;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export type AuthLoginResponse = BaseResponse<LoginResponse>;
export type AuthProfileResponse = BaseResponse<{ user: UserInfo }>;
export type AuthVerifyResponse = BaseResponse<{ user: UserInfo; authenticated: boolean }>;
export type AuthChangePasswordResponse = BaseResponse<ChangePasswordResponse>;
export type AuthRefreshResponse = BaseResponse<RefreshTokenResponse>;
export type AuthLogoutResponse = BaseResponse<{ loggedOut: boolean }>;

export type PatientVisitsListResponse = BaseResponse<{
  patientVisits: PatientVisitSummary[];
  pagination: PaginationMeta;
}>;

export type PatientVisitDetailResponse = BaseResponse<{
  patientVisit: PatientVisitInfo;
}>;

export type PatientVisitCreateResponse = BaseResponse<{
  patientVisit: PatientVisitInfo;
}>;

export type PatientVisitUpdateResponse = BaseResponse<{
  patientVisit: PatientVisitInfo;
}>;

export type PatientVisitDeleteResponse = BaseResponse<{
  deleted: boolean;
}>;

export type PatientVisitStatisticsResponse = BaseResponse<PatientVisitStatistics>;

export type DiseasesListResponse = BaseResponse<{
  diseases: Disease[];
  pagination: PaginationMeta;
}>;

export type DiseaseDetailResponse = BaseResponse<{
  disease: DiseaseWithSymptoms;
}>;

export type ReportPatientVisitDataResponse = BaseResponse<{
  patientVisits: PatientVisitSummary[];
  summary: ReportSummary;
  pagination: PaginationMeta;
}>;

export type ReportIncidenceDataResponse = BaseResponse<{
  incidenceData: IncidenceDataItem[];
  summary: ReportSummary;
}>;

export type ReportGenderDataResponse = BaseResponse<{
  genderData: GenderDataItem[];
  summary: ReportSummary;
}>;

export type ReportTrendDataResponse = BaseResponse<{
  trendData: TrendDataItem[];
  summary: ReportSummary;
}>;

// ============================================
// UTILITY TYPES
// ============================================

export type ApiResponse<T> = BaseResponse<T> | ErrorResponse;

// Type unions for convenience
export type AllEnums = 
  | UserRoleEnum 
  | NamePrefixEnum 
  | GenderEnum 
  | MaritalStatusEnum 
  | OccupationEnum 
  | TreatmentAreaEnum 
  | PatientTypeEnum 
  | PatientConditionEnum;

// Validation helpers
export const isValidEnum = <T extends string>(
  value: unknown,
  enumMapping: EnumMapping<T>
): value is T => {
  return typeof value === 'string' && value in enumMapping;
};

// Enum validators
export const isValidGender = (value: unknown): value is GenderEnum => 
  isValidEnum(value, genderMapping);

export const isValidPatientType = (value: unknown): value is PatientTypeEnum => 
  isValidEnum(value, patientTypeMapping);

export const isValidPatientCondition = (value: unknown): value is PatientConditionEnum => 
  isValidEnum(value, patientConditionMapping);

export const isValidUserRole = (value: unknown): value is UserRoleEnum => 
  isValidEnum(value, userRoleMapping);