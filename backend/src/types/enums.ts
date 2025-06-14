// backend/src/types/enums.ts

import { 
  NamePrefixEnum, 
  GenderEnum, 
  MaritalStatusEnum, 
  OccupationEnum, 
  TreatmentAreaEnum, 
  PatientTypeEnum, 
  PatientConditionEnum,
  UserRoleEnum 
} from '@prisma/client';

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

// Type definitions for frontend (to be inferred)
export type EnumMappingType = typeof enumMappings;
export type ThaiEnumValues = {
  [K in keyof EnumMappingType]: EnumMappingType[K][keyof EnumMappingType[K]];
};