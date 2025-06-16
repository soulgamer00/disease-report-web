// src/lib/types/backend.ts
// Type definitions extracted from backend Zod schemas and Prisma enums
// ✅ Corrected to match backend exactly

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
// ENUMS (matching Prisma Schema exactly)
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

export const namePrefixMapping = {
  MR: 'นาย',
  MS: 'นางสาว',
  MRS: 'นาง',
  BOY: 'เด็กชาย',
  GIRL: 'เด็กหญิง',
  OTHER: 'อื่นๆ',
} as const;

export const genderMapping = {
  MALE: 'ชาย',
  FEMALE: 'หญิง',
} as const;

export const maritalStatusMapping = {
  SINGLE: 'โสด',
  UNKNOWN: 'ไม่ทราบ',
  MONK: 'บรรพชิต',
  WIDOWED: 'หม้าย',
  DIVORCED: 'หย่า',
  MARRIED: 'แต่งงาน',
  SEPARATED: 'แยกกันอยู่',
} as const;

export const occupationMapping = {
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

export const treatmentAreaMapping = {
  MUNICIPALITY: 'เทศบาล',
  SAO: 'องค์การบริหารส่วนตำบล',
  UNKNOWN: 'ไม่ทราบ',
} as const;

export const patientTypeMapping = {
  IPD: 'ผู้ป่วยใน (IPD)',
  OPD: 'ผู้ป่วยนอก (OPD)',
  ACF: 'การค้นหาเชิงรุก (ACF)',
} as const;

export const patientConditionMapping = {
  UNKNOWN: 'ไม่ทราบ',
  RECOVERED: 'หายแล้ว',
  DIED: 'เสียชีวิต',
  UNDER_TREATMENT: 'กำลังรักษา',
} as const;

export const userRoleMapping = {
  SUPERADMIN: 'ผู้ดูแลระบบหลัก',
  ADMIN: 'ผู้ดูแลระบบ',
  USER: 'ผู้ใช้งาน',
} as const;

// Helper functions for enum conversions
export const getThaiNamePrefix = (prefix: NamePrefixEnum): string => namePrefixMapping[prefix];
export const getThaiGender = (gender: GenderEnum): string => genderMapping[gender];
export const getThaiMaritalStatus = (status: MaritalStatusEnum): string => maritalStatusMapping[status];
export const getThaiOccupation = (occupation: OccupationEnum): string => occupationMapping[occupation];
export const getThaiTreatmentArea = (area: TreatmentAreaEnum): string => treatmentAreaMapping[area];
export const getThaiPatientType = (type: PatientTypeEnum): string => patientTypeMapping[type];
export const getThaiPatientCondition = (condition: PatientConditionEnum): string => patientConditionMapping[condition];
export const getThaiUserRole = (role: UserRoleEnum): string => userRoleMapping[role];

// ============================================
// HOSPITAL TYPES
// ============================================

export interface Hospital {
  id: string;
  hospitalName: string;
  hospitalCode9eDigit: string;
  organizationType?: string | null;
  healthServiceType?: string | null;
}

// ============================================
// USER & AUTH TYPES
// ============================================

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  userRole: UserRoleEnum;
  userRoleId: number;
  hospitalCode9eDigit: string | null;
  hospital: Hospital | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: UserInfo;
  expiresIn: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  updatedAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  expiresIn: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  userRoleId: number;
  hospitalCode9eDigit: string | null;
  iat: number;
  exp: number;
}

// ============================================
// DISEASE & SYMPTOM TYPES
// ============================================

export interface Disease {
  id: string;
  engName: string;
  thaiName: string;
  shortName: string;
  details: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface DiseaseWithSymptoms extends Disease {
  symptoms: Symptom[];
}

export interface Symptom {
  id: string;
  name: string;
  diseaseId: string;
  disease?: Disease;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// ============================================
// PATIENT VISIT TYPES
// ============================================

export interface PatientVisitInfo {
  id: string;
  idCardCode: string;
  namePrefix: NamePrefixEnum;
  fname: string;
  lname: string;
  gender: GenderEnum;
  birthday: string;
  ageAtIllness: number;
  nationality: string;
  maritalStatus: MaritalStatusEnum;
  occupation: OccupationEnum;
  phoneNumber: string | null;
  
  // Current address
  currentHouseNumber: string | null;
  currentVillageNumber: string | null;
  currentRoadName: string | null;
  currentProvince: string | null;
  currentDistrict: string | null;
  currentSubDistrict: string | null;
  
  // Sick address
  addressSickHouseNumber: string | null;
  addressSickVillageNumber: string | null;
  addressSickRoadName: string | null;
  addressSickProvince: string;
  addressSickDistrict: string | null;
  addressSickSubDistrict: string | null;
  
  // Medical information
  diseaseId: string;
  symptomsOfDisease: string | null;
  treatmentArea: TreatmentAreaEnum;
  treatmentHospital: string | null;
  illnessDate: string;
  treatmentDate: string;
  diagnosisDate: string | null;
  diagnosis1: string | null;
  diagnosis2: string | null;
  patientType: PatientTypeEnum;
  patientCondition: PatientConditionEnum;
  deathDate: string | null;
  causeOfDeath: string | null;
  receivingProvince: string;
  
  // Hospital information
  hospitalCode9eDigit: string;
  reportName: string | null;
  remarks: string | null;
  
  // Audit fields
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  
  // Relations
  disease?: Disease;
  hospital?: Hospital;
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
  diseaseId: string;
  disease: {
    id: string;
    engName: string;
    thaiName: string;
    shortName: string;
  };
  illnessDate: string;
  treatmentDate: string;
  patientType: PatientTypeEnum;
  patientCondition: PatientConditionEnum;
  hospitalCode9eDigit: string;
  hospital: {
    id: string;
    hospitalName: string;
    hospitalCode9eDigit: string;
  };
}

export interface PatientVisitStatistics {
  totalPatientVisits: number;
  byGender: {
    male: number;
    female: number;
  };
  byPatientType: Record<string, number>;
  byPatientCondition: Record<string, number>;
  recentVisits: number;
}

export interface CreatePatientVisitRequest {
  idCardCode: string;
  namePrefix: NamePrefixEnum;
  fname: string;
  lname: string;
  gender: GenderEnum;
  birthday: string;
  nationality?: string;
  maritalStatus: MaritalStatusEnum;
  occupation: OccupationEnum;
  phoneNumber?: string;
  currentHouseNumber?: string;
  currentVillageNumber?: string;
  currentRoadName?: string;
  currentProvince?: string;
  currentDistrict?: string;
  currentSubDistrict?: string;
  addressSickHouseNumber?: string;
  addressSickVillageNumber?: string;
  addressSickRoadName?: string;
  addressSickProvince?: string;
  addressSickDistrict?: string;
  addressSickSubDistrict?: string;
  diseaseId: string;
  symptomsOfDisease?: string;
  treatmentArea: TreatmentAreaEnum;
  treatmentHospital?: string;
  illnessDate: string;
  treatmentDate: string;
  diagnosisDate?: string;
  diagnosis1?: string;
  diagnosis2?: string;
  patientType: PatientTypeEnum;
  patientCondition: PatientConditionEnum;
  deathDate?: string;
  causeOfDeath?: string;
  receivingProvince?: string;
  hospitalCode9eDigit?: string;
  reportName?: string;
  remarks?: string;
}

export interface UpdatePatientVisitRequest {
  namePrefix?: NamePrefixEnum;
  fname?: string;
  lname?: string;
  gender?: GenderEnum;
  birthday?: string;
  nationality?: string;
  maritalStatus?: MaritalStatusEnum;
  occupation?: OccupationEnum;
  phoneNumber?: string;
  currentHouseNumber?: string;
  currentVillageNumber?: string;
  currentRoadName?: string;
  currentProvince?: string;
  currentDistrict?: string;
  currentSubDistrict?: string;
  addressSickHouseNumber?: string;
  addressSickVillageNumber?: string;
  addressSickRoadName?: string;
  addressSickProvince?: string;
  addressSickDistrict?: string;
  addressSickSubDistrict?: string;
  diseaseId?: string;
  symptomsOfDisease?: string;
  treatmentArea?: TreatmentAreaEnum;
  treatmentHospital?: string;
  illnessDate?: string;
  treatmentDate?: string;
  diagnosisDate?: string;
  diagnosis1?: string;
  diagnosis2?: string;
  patientType?: PatientTypeEnum;
  patientCondition?: PatientConditionEnum;
  deathDate?: string;
  causeOfDeath?: string;
  receivingProvince?: string;
  hospitalCode9eDigit?: string;
  reportName?: string;
  remarks?: string;
}

// ============================================
// QUERY PARAMS
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
  gender?: GenderEnum;
  patientType?: PatientTypeEnum;
  patientCondition?: PatientConditionEnum;
  startDate?: string;
  endDate?: string;
  ageMin?: number;
  ageMax?: number;
}

// ============================================
// POPULATION TYPES
// ============================================

export interface Population {
  id: string;
  year: number;
  hospitalCode9eDigit: string;
  hospital: Hospital;
  totalPopulation: number;
  malePopulation: number;
  femalePopulation: number;
  ageGroup0to4: number;
  ageGroup5to9: number;
  ageGroup10to14: number;
  ageGroup15to19: number;
  ageGroup20to24: number;
  ageGroup25to29: number;
  ageGroup30to34: number;
  ageGroup35to39: number;
  ageGroup40to44: number;
  ageGroup45to49: number;
  ageGroup50to54: number;
  ageGroup55to59: number;
  ageGroup60to64: number;
  ageGroup65Plus: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
}

// ============================================
// REPORT TYPES
// ============================================

export interface ReportQueryParams {
  dateFrom?: string;
  dateTo?: string;
  hospitalCode?: string;
  hospitalId?: string;
  diseaseId?: string;
  gender?: GenderEnum;
  ageMin?: number;
  ageMax?: number;
  page?: number;
  limit?: number;
}

export interface IncidenceDataQuery extends ReportQueryParams {
  groupBy?: 'month' | 'quarter' | 'year' | 'hospital' | 'disease';
}

export interface GenderDataQuery extends ReportQueryParams {
  groupBy?: 'age_group' | 'hospital' | 'disease' | 'month';
}

export interface TrendDataQuery extends ReportQueryParams {
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  trendType?: 'patient_count' | 'incidence_rate' | 'gender_ratio';
}

export interface IncidenceDataItem {
  period: string;
  patientCount: number;
  hospitalCode?: string;
  hospitalName?: string;
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

// Type definitions for frontend (to be inferred)
export type EnumMappingType = typeof enumMappings;
export type ThaiEnumValues = {
  [K in keyof EnumMappingType]: EnumMappingType[K][keyof EnumMappingType[K]];
};