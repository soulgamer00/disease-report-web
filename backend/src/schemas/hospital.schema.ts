// backend/src/schemas/hospital.schema.ts

import { z } from 'zod';

// ============================================
// HOSPITAL REQUEST SCHEMAS
// ============================================

// Create Hospital Schema
export const createHospitalSchema = z.object({
  hospitalName: z
    .string()
    .min(1, 'กรุณากรอกชื่อโรงพยาบาล')
    .max(200, 'ชื่อโรงพยาบาลต้องไม่เกิน 200 ตัวอักษร')
    .trim(),
  hospitalCode9eDigit: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, 'รหัส 9 หลักใหม่ต้องเป็นรูปแบบ XX0000000 (ตัวอักษร 2 ตัว + ตัวเลข 7 ตัว)')
    .length(9, 'รหัส 9 หลักใหม่ต้องมี 9 หลักพอดี'),
  hospitalCode9Digit: z
    .string()
    .regex(/^\d{9}$/, 'รหัส 9 หลักเก่าต้องเป็นตัวเลข 9 หลัก')
    .length(9, 'รหัส 9 หลักเก่าต้องมี 9 หลักพอดี')
    .optional(),
  hospitalCode5Digit: z
    .string()
    .regex(/^\d{5}$/, 'รหัส 5 หลักต้องเป็นตัวเลข 5 หลัก')
    .length(5, 'รหัส 5 หลักต้องมี 5 หลักพอดี')
    .optional(),
  organizationType: z
    .string()
    .min(1, 'กรุณาระบุประเภทองค์กร')
    .max(100, 'ประเภทองค์กรต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
  healthServiceType: z
    .string()
    .min(1, 'กรุณาระบุประเภทหน่วยบริการสุขภาพ')
    .max(100, 'ประเภทหน่วยบริการสุขภาพต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
  affiliation: z
    .string()
    .max(100, 'สังกัดต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
  departmentDivision: z
    .string()
    .max(100, 'แผนก/กรมต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
});

// Update Hospital Schema
export const updateHospitalSchema = z.object({
  hospitalName: z
    .string()
    .min(1, 'กรุณากรอกชื่อโรงพยาบาล')
    .max(200, 'ชื่อโรงพยาบาลต้องไม่เกิน 200 ตัวอักษร')
    .trim()
    .optional(),
  hospitalCode9eDigit: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, 'รหัส 9 หลักใหม่ต้องเป็นรูปแบบ XX0000000 (ตัวอักษร 2 ตัว + ตัวเลข 7 ตัว)')
    .length(9, 'รหัส 9 หลักใหม่ต้องมี 9 หลักพอดี')
    .optional(),
  hospitalCode9Digit: z
    .string()
    .regex(/^\d{9}$/, 'รหัส 9 หลักเก่าต้องเป็นตัวเลข 9 หลัก')
    .length(9, 'รหัส 9 หลักเก่าต้องมี 9 หลักพอดี')
    .optional(),
  hospitalCode5Digit: z
    .string()
    .regex(/^\d{5}$/, 'รหัส 5 หลักต้องเป็นตัวเลข 5 หลัก')
    .length(5, 'รหัส 5 หลักต้องมี 5 หลักพอดี')
    .optional(),
  organizationType: z
    .string()
    .min(1, 'กรุณาระบุประเภทองค์กร')
    .max(100, 'ประเภทองค์กรต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
  healthServiceType: z
    .string()
    .min(1, 'กรุณาระบุประเภทหน่วยบริการสุขภาพ')
    .max(100, 'ประเภทหน่วยบริการสุขภาพต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
  affiliation: z
    .string()
    .max(100, 'สังกัดต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
  departmentDivision: z
    .string()
    .max(100, 'แผนก/กรมต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'กรุณาระบุข้อมูลที่ต้องการแก้ไขอย่างน้อย 1 รายการ' }
);

// Hospital Query Parameters Schema
export const hospitalQuerySchema = z.object({
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
  organizationType: z.string().optional(),
  healthServiceType: z.string().optional(),
  affiliation: z.string().optional(),
  sortBy: z
    .enum(['hospitalName', 'hospitalCode9eDigit', 'organizationType', 'createdAt', 'updatedAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
    .pipe(z.boolean().optional()),
});

// Hospital ID Parameter Schema
export const hospitalParamSchema = z.object({
  id: z.string().uuid('รหัสโรงพยาบาลไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
});

// Hospital Code Parameter Schema (for code-based lookup)
export const hospitalCodeParamSchema = z.object({
  code: z.string().regex(/^[A-Z]{2}\d{7}$/, 'รหัสโรงพยาบาลไม่ถูกต้อง'),
});

// ============================================
// HOSPITAL RESPONSE SCHEMAS
// ============================================

// Hospital Info Schema (for responses)
export const hospitalInfoSchema = z.object({
  id: z.string().uuid(),
  hospitalName: z.string(),
  hospitalCode9eDigit: z.string(),
  hospitalCode9Digit: z.string().nullable(),
  hospitalCode5Digit: z.string().nullable(),
  organizationType: z.string().nullable(),
  healthServiceType: z.string().nullable(),
  affiliation: z.string().nullable(),
  departmentDivision: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    patientVisits: z.number(),
    populations: z.number(),
    users: z.number(),
  }).optional(),
  populations: z.array(z.object({
    id: z.string().uuid(),
    year: z.number(),
    count: z.number(),
  })).optional(),
});

// Hospital List Response Schema
export const hospitalListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    hospitals: z.array(hospitalInfoSchema),
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

// Hospital Detail Response Schema
export const hospitalDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    hospital: hospitalInfoSchema,
  }),
});

// Hospital Create/Update Response Schema
export const hospitalCreateUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    hospital: hospitalInfoSchema,
  }),
});

// Hospital Delete Response Schema
export const hospitalDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    deletedAt: z.date(),
  }),
});

// Hospital Statistics Response Schema
export const hospitalStatisticsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    statistics: z.object({
      totalHospitals: z.number(),
      byOrganizationType: z.array(z.object({
        organizationType: z.string(),
        count: z.number(),
      })),
      byHealthServiceType: z.array(z.object({
        healthServiceType: z.string(),
        count: z.number(),
      })),
      byAffiliation: z.array(z.object({
        affiliation: z.string(),
        count: z.number(),
      })),
      timestamp: z.string(),
    }),
  }),
});

// ============================================
// ERROR RESPONSE SCHEMAS
// ============================================

// Hospital Error Response Schema
export const hospitalErrorResponseSchema = z.object({
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
export type CreateHospitalRequest = z.infer<typeof createHospitalSchema>;
export type UpdateHospitalRequest = z.infer<typeof updateHospitalSchema>;
export type HospitalQueryParams = z.infer<typeof hospitalQuerySchema>;
export type HospitalParam = z.infer<typeof hospitalParamSchema>;
export type HospitalCodeParam = z.infer<typeof hospitalCodeParamSchema>;

// Response Types
export type HospitalInfo = z.infer<typeof hospitalInfoSchema>;
export type HospitalListResponse = z.infer<typeof hospitalListResponseSchema>;
export type HospitalDetailResponse = z.infer<typeof hospitalDetailResponseSchema>;
export type HospitalCreateUpdateResponse = z.infer<typeof hospitalCreateUpdateResponseSchema>;
export type HospitalDeleteResponse = z.infer<typeof hospitalDeleteResponseSchema>;
export type HospitalStatisticsResponse = z.infer<typeof hospitalStatisticsResponseSchema>;
export type HospitalErrorResponse = z.infer<typeof hospitalErrorResponseSchema>;

// Combined Hospital Types for easier imports
export type HospitalRequestTypes = {
  create: CreateHospitalRequest;
  update: UpdateHospitalRequest;
  query: HospitalQueryParams;
  param: HospitalParam;
  codeParam: HospitalCodeParam;
};

export type HospitalResponseTypes = {
  list: HospitalListResponse;
  detail: HospitalDetailResponse;
  create: HospitalCreateUpdateResponse;
  update: HospitalCreateUpdateResponse;
  delete: HospitalDeleteResponse;
  statistics: HospitalStatisticsResponse;
  error: HospitalErrorResponse;
};