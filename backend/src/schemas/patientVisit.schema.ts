// backend/src/schemas/patientVisit.schema.ts

import { z } from 'zod';
import { 
  NamePrefixEnum, 
  GenderEnum, 
  MaritalStatusEnum, 
  OccupationEnum, 
  TreatmentAreaEnum, 
  PatientTypeEnum, 
  PatientConditionEnum 
} from '@prisma/client';

// ============================================
// PATIENT VISIT REQUEST SCHEMAS
// ============================================

// Create Patient Visit Schema
export const createPatientVisitSchema = z.object({
  // Patient Personal Information
  idCardCode: z
    .string()
    .length(13, 'เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก')
    .regex(/^\d{13}$/, 'เลขบัตรประจำตัวประชาชนต้องเป็นตัวเลขเท่านั้น')
    .refine(
      (idCard) => {
        // Thai ID card checksum validation
        const digits = idCard.split('').map(Number);
        const sum = digits
          .slice(0, 12)
          .reduce((acc, digit, index) => acc + digit * (13 - index), 0);
        const checkDigit = (11 - (sum % 11)) % 10;
        return checkDigit === digits[12];
      },
      'เลขบัตรประจำตัวประชาชนไม่ถูกต้อง'
    ),
  namePrefix: z.nativeEnum(NamePrefixEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกคำนำหน้าชื่อ' }),
  }),
  fname: z
    .string()
    .min(1, 'กรุณากรอกชื่อ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร')
    .transform((val) => val.trim()),
  lname: z
    .string()
    .min(1, 'กรุณากรอกนามสกุล')
    .max(100, 'นามสกุลต้องไม่เกิน 100 ตัวอักษร')
    .transform((val) => val.trim()),
  gender: z.nativeEnum(GenderEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกเพศ' }),
  }),
  birthday: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันเกิดไม่ถูกต้อง')
    .transform((date) => new Date(date))
    .refine(
      (date) => {
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 0 && age <= 150;
      },
      'วันเกิดต้องอยู่ในช่วงที่สมเหตุสมผล (อายุ 0-150 ปี)'
    ),
  nationality: z
    .string()
    .max(50, 'สัญชาติต้องไม่เกิน 50 ตัวอักษร')
    .default('ไทย')
    .transform((val) => val.trim()),
  maritalStatus: z.nativeEnum(MaritalStatusEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกสถานภาพสมรส' }),
  }),
  occupation: z.nativeEnum(OccupationEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกอาชีพ' }),
  }),
  phoneNumber: z
    .string()
    .regex(/^0[0-9]{8,9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก)')
    .optional(),

  // Current Address
  currentHouseNumber: z.string().max(20, 'เลขที่บ้านต้องไม่เกิน 20 ตัวอักษร').optional(),
  currentVillageNumber: z.string().max(10, 'หมู่ที่ต้องไม่เกิน 10 ตัวอักษร').optional(),
  currentRoadName: z.string().max(100, 'ชื่อถนนต้องไม่เกิน 100 ตัวอักษร').optional(),
  currentProvince: z.string().max(50, 'จังหวัดต้องไม่เกิน 50 ตัวอักษร').optional(),
  currentDistrict: z.string().max(50, 'อำเภอต้องไม่เกิน 50 ตัวอักษร').optional(),
  currentSubDistrict: z.string().max(50, 'ตำบลต้องไม่เกิน 50 ตัวอักษร').optional(),

  // Address Where Got Sick
  addressSickHouseNumber: z.string().max(20, 'เลขที่บ้านต้องไม่เกิน 20 ตัวอักษร').optional(),
  addressSickVillageNumber: z.string().max(10, 'หมู่ที่ต้องไม่เกิน 10 ตัวอักษร').optional(),
  addressSickRoadName: z.string().max(100, 'ชื่อถนนต้องไม่เกิน 100 ตัวอักษร').optional(),
  addressSickProvince: z
    .string()
    .max(50, 'จังหวัดต้องไม่เกิน 50 ตัวอักษร')
    .default('เพชรบูรณ์')
    .transform((val) => val.trim()),
  addressSickDistrict: z.string().max(50, 'อำเภอต้องไม่เกิน 50 ตัวอักษร').optional(),
  addressSickSubDistrict: z.string().max(50, 'ตำบลต้องไม่เกิน 50 ตัวอักษร').optional(),

  // Disease Information
  diseaseId: z
    .string()
    .uuid('รหัสโรคไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
  symptomsOfDisease: z
    .string()
    .max(500, 'อาการของโรคต้องไม่เกิน 500 ตัวอักษร')
    .optional(),

  // Treatment Information
  treatmentArea: z.nativeEnum(TreatmentAreaEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกพื้นที่การรักษา' }),
  }),
  treatmentHospital: z
    .string()
    .max(200, 'ชื่อโรงพยาบาลที่รักษาต้องไม่เกิน 200 ตัวอักษร')
    .optional(),
  
  // Important Dates
  illnessDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันที่เริ่มป่วยไม่ถูกต้อง')
    .transform((date) => new Date(date)),
  treatmentDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันที่เริ่มรักษาไม่ถูกต้อง')
    .transform((date) => new Date(date)),
  diagnosisDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันที่วินิจฉัยไม่ถูกต้อง')
    .transform((date) => new Date(date)),

  // Diagnosis
  diagnosis1: z
    .string()
    .max(200, 'การวินิจฉัยหลักต้องไม่เกิน 200 ตัวอักษร')
    .optional(),
  diagnosis2: z
    .string()
    .max(200, 'การวินิจฉัยรองต้องไม่เกิน 200 ตัวอักษร')
    .optional(),

  // Patient Type & Condition
  patientType: z.nativeEnum(PatientTypeEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกประเภทผู้ป่วย' }),
  }),
  patientCondition: z.nativeEnum(PatientConditionEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกสภาพผู้ป่วย' }),
  }),
  deathDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'วันที่เสียชีวิตไม่ถูกต้อง')
    .transform((date) => date ? new Date(date) : null),
  causeOfDeath: z
    .string()
    .max(200, 'สาเหตุการเสียชีวิตต้องไม่เกิน 200 ตัวอักษร')
    .optional(),

  // Hospital & Reporting
  receivingProvince: z
    .string()
    .max(50, 'จังหวัดที่รับการรายงานต้องไม่เกิน 50 ตัวอักษร')
    .default('เพชรบูรณ์')
    .transform((val) => val.trim()),
  hospitalCode9eDigit: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, 'รหัสโรงพยาบาลต้องเป็นรูปแบบ XX0000000 (ตัวอักษร 2 ตัว + ตัวเลข 7 ตัว)')
    .length(9, 'รหัสโรงพยาบาลต้องมี 9 หลักพอดี'),
  reportName: z
    .string()
    .max(100, 'ชื่อผู้รายงานต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  remarks: z
    .string()
    .max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
}).refine(
  (data) => {
    // If patient died, death date is required
    if (data.patientCondition === 'DIED') {
      return !!data.deathDate;
    }
    return true;
  },
  {
    message: 'หากผู้ป่วยเสียชีวิต กรุณาระบุวันที่เสียชีวิต',
    path: ['deathDate'],
  }
).refine(
  (data) => {
    // Treatment date should not be before illness date
    return data.treatmentDate.getTime() >= data.illnessDate.getTime();
  },
  {
    message: 'วันที่เริ่มรักษาต้องไม่เป็นวันก่อนวันที่เริ่มป่วย',
    path: ['treatmentDate'],
  }
).refine(
  (data) => {
    // Death date should not be before illness date
    if (data.deathDate) {
      return data.deathDate.getTime() >= data.illnessDate.getTime();
    }
    return true;
  },
  {
    message: 'วันที่เสียชีวิตต้องไม่เป็นวันก่อนวันที่เริ่มป่วย',
    path: ['deathDate'],
  }
);

// Update Patient Visit Schema
export const updatePatientVisitSchema = z.object({
  // Patient Personal Information
  idCardCode: z
    .string()
    .length(13, 'เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก')
    .regex(/^\d{13}$/, 'เลขบัตรประจำตัวประชาชนต้องเป็นตัวเลขเท่านั้น')
    .refine(
      (idCard) => {
        // Thai ID card checksum validation
        const digits = idCard.split('').map(Number);
        const sum = digits
          .slice(0, 12)
          .reduce((acc, digit, index) => acc + digit * (13 - index), 0);
        const checkDigit = (11 - (sum % 11)) % 10;
        return checkDigit === digits[12];
      },
      'เลขบัตรประจำตัวประชาชนไม่ถูกต้อง'
    )
    .optional(),
  namePrefix: z.nativeEnum(NamePrefixEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกคำนำหน้าชื่อ' }),
  }).optional(),
  fname: z
    .string()
    .min(1, 'กรุณากรอกชื่อ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร')
    .transform((val) => val.trim())
    .optional(),
  lname: z
    .string()
    .min(1, 'กรุณากรอกนามสกุล')
    .max(100, 'นามสกุลต้องไม่เกิน 100 ตัวอักษร')
    .transform((val) => val.trim())
    .optional(),
  gender: z.nativeEnum(GenderEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกเพศ' }),
  }).optional(),
  birthday: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันเกิดไม่ถูกต้อง')
    .transform((date) => new Date(date))
    .refine(
      (date) => {
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 0 && age <= 150;
      },
      'วันเกิดต้องอยู่ในช่วงที่สมเหตุสมผล (อายุ 0-150 ปี)'
    )
    .optional(),
  nationality: z
    .string()
    .max(50, 'สัญชาติต้องไม่เกิน 50 ตัวอักษร')
    .transform((val) => val.trim())
    .optional(),
  maritalStatus: z.nativeEnum(MaritalStatusEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกสถานภาพสมรส' }),
  }).optional(),
  occupation: z.nativeEnum(OccupationEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกอาชีพ' }),
  }).optional(),
  phoneNumber: z
    .string()
    .regex(/^0[0-9]{8,9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก)')
    .optional(),

  // Current Address
  currentHouseNumber: z.string().max(20, 'เลขที่บ้านต้องไม่เกิน 20 ตัวอักษร').optional(),
  currentVillageNumber: z.string().max(10, 'หมู่ที่ต้องไม่เกิน 10 ตัวอักษร').optional(),
  currentRoadName: z.string().max(100, 'ชื่อถนนต้องไม่เกิน 100 ตัวอักษร').optional(),
  currentProvince: z.string().max(50, 'จังหวัดต้องไม่เกิน 50 ตัวอักษร').optional(),
  currentDistrict: z.string().max(50, 'อำเภอต้องไม่เกิน 50 ตัวอักษร').optional(),
  currentSubDistrict: z.string().max(50, 'ตำบลต้องไม่เกิน 50 ตัวอักษร').optional(),

  // Address Where Got Sick
  addressSickHouseNumber: z.string().max(20, 'เลขที่บ้านต้องไม่เกิน 20 ตัวอักษร').optional(),
  addressSickVillageNumber: z.string().max(10, 'หมู่ที่ต้องไม่เกิน 10 ตัวอักษร').optional(),
  addressSickRoadName: z.string().max(100, 'ชื่อถนนต้องไม่เกิน 100 ตัวอักษร').optional(),
  addressSickProvince: z
    .string()
    .max(50, 'จังหวัดต้องไม่เกิน 50 ตัวอักษร')
    .transform((val) => val.trim())
    .optional(),
  addressSickDistrict: z.string().max(50, 'อำเภอต้องไม่เกิน 50 ตัวอักษร').optional(),
  addressSickSubDistrict: z.string().max(50, 'ตำบลต้องไม่เกิน 50 ตัวอักษร').optional(),

  // Disease Information
  diseaseId: z
    .string()
    .uuid('รหัสโรคไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง')
    .optional(),
  symptomsOfDisease: z
    .string()
    .max(500, 'อาการของโรคต้องไม่เกิน 500 ตัวอักษร')
    .optional(),

  // Treatment Information
  treatmentArea: z.nativeEnum(TreatmentAreaEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกพื้นที่การรักษา' }),
  }).optional(),
  treatmentHospital: z
    .string()
    .max(200, 'ชื่อโรงพยาบาลที่รักษาต้องไม่เกิน 200 ตัวอักษร')
    .optional(),
  
  // Important Dates
  illnessDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันที่เริ่มป่วยไม่ถูกต้อง')
    .transform((date) => new Date(date))
    .optional(),
  treatmentDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันที่เริ่มรักษาไม่ถูกต้อง')
    .transform((date) => new Date(date))
    .optional(),
  diagnosisDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันที่วินิจฉัยไม่ถูกต้อง')
    .transform((date) => new Date(date))
    .optional(),

  // Diagnosis
  diagnosis1: z
    .string()
    .max(200, 'การวินิจฉัยหลักต้องไม่เกิน 200 ตัวอักษร')
    .optional(),
  diagnosis2: z
    .string()
    .max(200, 'การวินิจฉัยรองต้องไม่เกิน 200 ตัวอักษร')
    .optional(),

  // Patient Type & Condition
  patientType: z.nativeEnum(PatientTypeEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกประเภทผู้ป่วย' }),
  }).optional(),
  patientCondition: z.nativeEnum(PatientConditionEnum, {
    errorMap: () => ({ message: 'กรุณาเลือกสภาพผู้ป่วย' }),
  }).optional(),
  deathDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'วันที่เสียชีวิตไม่ถูกต้อง')
    .transform((date) => new Date(date))
    .optional(),
  causeOfDeath: z
    .string()
    .max(200, 'สาเหตุการเสียชีวิตต้องไม่เกิน 200 ตัวอักษร')
    .optional(),

  // Hospital & Reporting
  receivingProvince: z
    .string()
    .max(50, 'จังหวัดที่รับการรายงานต้องไม่เกิน 50 ตัวอักษร')
    .transform((val) => val.trim())
    .optional(),
  hospitalCode9eDigit: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, 'รหัสโรงพยาบาลต้องเป็นรูปแบบ XX0000000 (ตัวอักษร 2 ตัว + ตัวเลข 7 ตัว)')
    .length(9, 'รหัสโรงพยาบาลต้องมี 9 หลักพอดี')
    .optional(),
  reportName: z
    .string()
    .max(100, 'ชื่อผู้รายงานต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  remarks: z
    .string()
    .max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'กรุณาระบุข้อมูลที่ต้องการแก้ไขอย่างน้อย 1 รายการ' }
);

// Patient Visit Query Parameters Schema
export const patientVisitQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, 'หน้าต้องมากกว่าหรือเท่ากับ 1')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().min(1, 'จำนวนรายการต่อหน้าต้องมากกว่าหรือเท่ากับ 1').max(100, 'จำนวนรายการต่อหน้าต้องไม่เกิน 100')),
  search: z.string().optional(),
  diseaseId: z
    .string()
    .uuid('รหัสโรคไม่ถูกต้อง')
    .optional(),
  hospitalCode9eDigit: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, 'รหัสโรงพยาบาลไม่ถูกต้อง')
    .optional(),
  gender: z.nativeEnum(GenderEnum).optional(),
  patientType: z.nativeEnum(PatientTypeEnum).optional(),
  patientCondition: z.nativeEnum(PatientConditionEnum).optional(),
  startDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'วันที่เริ่มต้นไม่ถูกต้อง')
    .transform((date) => (date ? new Date(date) : undefined)),
  endDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'วันที่สิ้นสุดไม่ถูกต้อง')
    .transform((date) => (date ? new Date(date) : undefined)),
  ageMin: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(0).max(150).optional()),
  ageMax: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(0).max(150).optional()),
  sortBy: z
    .enum(['illnessDate', 'diagnosisDate', 'fname', 'lname', 'createdAt', 'updatedAt'])
    .optional()
    .default('illnessDate'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
    .pipe(z.boolean().optional()),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด', path: ['endDate'] }
).refine(
  (data) => {
    if (data.ageMin && data.ageMax) {
      return data.ageMin <= data.ageMax;
    }
    return true;
  },
  { message: 'อายุต่ำสุดต้องไม่มากกว่าอายุสูงสุด', path: ['ageMax'] }
);

// Patient Visit ID Parameter Schema
export const patientVisitParamSchema = z.object({
  id: z.string().uuid('รหัสข้อมูลผู้ป่วยไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
});

// ============================================
// PATIENT VISIT RESPONSE SCHEMAS
// ============================================

// Patient Visit Info Schema (for responses)
export const patientVisitInfoSchema = z.object({
  id: z.string().uuid(),
  idCardCode: z.string(),
  namePrefix: z.nativeEnum(NamePrefixEnum),
  fname: z.string(),
  lname: z.string(),
  gender: z.nativeEnum(GenderEnum),
  birthday: z.date(),
  ageAtIllness: z.number().int(),
  nationality: z.string(),
  maritalStatus: z.nativeEnum(MaritalStatusEnum),
  occupation: z.nativeEnum(OccupationEnum),
  phoneNumber: z.string().nullable(),
  currentHouseNumber: z.string().nullable(),
  currentVillageNumber: z.string().nullable(),
  currentRoadName: z.string().nullable(),
  currentProvince: z.string().nullable(),
  currentDistrict: z.string().nullable(),
  currentSubDistrict: z.string().nullable(),
  addressSickHouseNumber: z.string().nullable(),
  addressSickVillageNumber: z.string().nullable(),
  addressSickRoadName: z.string().nullable(),
  addressSickProvince: z.string(),
  addressSickDistrict: z.string().nullable(),
  addressSickSubDistrict: z.string().nullable(),
  diseaseId: z.string().uuid(),
  symptomsOfDisease: z.string().nullable(),
  treatmentArea: z.nativeEnum(TreatmentAreaEnum),
  treatmentHospital: z.string().nullable(),
  illnessDate: z.date(),
  treatmentDate: z.date(),
  diagnosisDate: z.date(),
  diagnosis1: z.string().nullable(),
  diagnosis2: z.string().nullable(),
  patientType: z.nativeEnum(PatientTypeEnum),
  patientCondition: z.nativeEnum(PatientConditionEnum),
  deathDate: z.date().nullable(),
  causeOfDeath: z.string().nullable(),
  receivingProvince: z.string(),
  hospitalCode9eDigit: z.string(),
  reportName: z.string().nullable(),
  remarks: z.string().nullable(),
  createdBy: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  disease: z.object({
    id: z.string().uuid(),
    engName: z.string(),
    thaiName: z.string(),
    shortName: z.string(),
  }).optional(),
  hospital: z.object({
    id: z.string().uuid(),
    hospitalName: z.string(),
    hospitalCode9eDigit: z.string(),
    organizationType: z.string().nullable(),
    healthServiceType: z.string().nullable(),
  }).optional(),
});

// ============================================
// LIST & DETAIL RESPONSE SCHEMAS
// ============================================

// Patient Visit List Response Schema
export const patientVisitListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    patientVisits: z.array(patientVisitInfoSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
});

// Patient Visit Detail Response Schema
export const patientVisitDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    patientVisit: patientVisitInfoSchema,
  }),
});

// Patient Visit Create/Update Response Schema
export const patientVisitCreateUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    patientVisit: patientVisitInfoSchema,
  }),
});

// Patient Visit Delete Response Schema
export const patientVisitDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    deletedAt: z.date(),
  }),
});

// ============================================
// ERROR RESPONSE SCHEMAS
// ============================================

// Patient Visit Error Response Schema
export const patientVisitErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.string().optional(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
});

// ============================================
// TYPE EXPORTS (for TypeScript inference)
// ============================================

// Request Types
export type CreatePatientVisitRequest = z.infer<typeof createPatientVisitSchema>;
export type UpdatePatientVisitRequest = z.infer<typeof updatePatientVisitSchema>;
export type PatientVisitQueryParams = z.infer<typeof patientVisitQuerySchema>;
export type PatientVisitParam = z.infer<typeof patientVisitParamSchema>;

// Response Types
export type PatientVisitInfo = z.infer<typeof patientVisitInfoSchema>;
export type PatientVisitListResponse = z.infer<typeof patientVisitListResponseSchema>;
export type PatientVisitDetailResponse = z.infer<typeof patientVisitDetailResponseSchema>;
export type PatientVisitCreateUpdateResponse = z.infer<typeof patientVisitCreateUpdateResponseSchema>;
export type PatientVisitDeleteResponse = z.infer<typeof patientVisitDeleteResponseSchema>;
export type PatientVisitErrorResponse = z.infer<typeof patientVisitErrorResponseSchema>;

// Combined Patient Visit Types for easier imports
export type PatientVisitRequestTypes = {
  create: CreatePatientVisitRequest;
  update: UpdatePatientVisitRequest;
  query: PatientVisitQueryParams;
  param: PatientVisitParam;
};

export type PatientVisitResponseTypes = {
  list: PatientVisitListResponse;
  detail: PatientVisitDetailResponse;
  create: PatientVisitCreateUpdateResponse;
  update: PatientVisitCreateUpdateResponse;
  delete: PatientVisitDeleteResponse;
  error: PatientVisitErrorResponse;
};