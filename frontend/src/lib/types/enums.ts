// frontend/src/lib/types/enums.ts

// ============================================
// ENUM TYPE DEFINITIONS (Frontend)
// ============================================

// Define enum types manually (same as Prisma but without dependency)
export type NamePrefixEnum = 'MR' | 'MS' | 'MRS' | 'BOY' | 'GIRL' | 'OTHER';
export type GenderEnum = 'MALE' | 'FEMALE';
export type MaritalStatusEnum = 'SINGLE' | 'UNKNOWN' | 'MONK' | 'WIDOWED' | 'DIVORCED' | 'MARRIED' | 'SEPARATED';
export type OccupationEnum = 'STUDENT' | 'DEPENDENT' | 'GOVERNMENT_OFFICIAL' | 'STATE_ENTERPRISE' | 'GENERAL_LABOR' | 'PRIVATE_BUSINESS' | 'FARMER' | 'GOV_EMPLOYEE' | 'PRIVATE_EMPLOYEE' | 'HOMEMAKER' | 'CLERGY' | 'TRADER' | 'UNEMPLOYED' | 'OTHER';
export type TreatmentAreaEnum = 'MUNICIPALITY' | 'SAO' | 'UNKNOWN';
export type PatientTypeEnum = 'IPD' | 'OPD' | 'ACF';
export type PatientConditionEnum = 'UNKNOWN' | 'RECOVERED' | 'DIED' | 'UNDER_TREATMENT';
export type UserRoleEnum = 'SUPERADMIN' | 'ADMIN' | 'USER';

// Generic type for enum mappings
type EnumMapping<T extends string> = Record<T, string>;

// ============================================
// ENUM MAPPINGS (Thai translations)
// ============================================

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

// Type definitions for frontend
export type EnumMappingType = typeof enumMappings;
export type ThaiEnumValues = {
  [K in keyof EnumMappingType]: EnumMappingType[K][keyof EnumMappingType[K]];
};

// ============================================
// DROPDOWN OPTIONS GENERATORS
// ============================================

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

// ============================================
// VALIDATION HELPERS
// ============================================

// Check if value is valid enum
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