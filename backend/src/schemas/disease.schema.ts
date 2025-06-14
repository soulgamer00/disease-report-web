// backend/src/schemas/disease.schema.ts

import { z } from 'zod';

// ============================================
// DISEASE REQUEST SCHEMAS
// ============================================

// Create Disease Schema
export const createDiseaseSchema = z.object({
  engName: z
    .string()
    .min(1, 'กรุณากรอกชื่อโรคภาษาอังกฤษ')
    .max(100, 'ชื่อโรคภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .regex(/^[a-zA-Z0-9\s\-\.\_\(\)]+$/, 'ชื่อโรคภาษาอังกฤษต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมายพิเศษเท่านั้น'),
  thaiName: z
    .string()
    .min(1, 'กรุณากรอกชื่อโรคภาษาไทย')
    .max(100, 'ชื่อโรคภาษาไทยต้องไม่เกิน 100 ตัวอักษร'),
  shortName: z
    .string()
    .min(1, 'กรุณากรอกชื่อย่อโรค')
    .max(20, 'ชื่อย่อโรคต้องไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9\-\_]+$/, 'ชื่อย่อโรคต้องเป็นตัวอักษรพิมพ์ใหญ่ ตัวเลข หรือ - _ เท่านั้น'),
  details: z
    .string()
    .max(500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
});

// Update Disease Schema
export const updateDiseaseSchema = z.object({
  engName: z
    .string()
    .min(1, 'กรุณากรอกชื่อโรคภาษาอังกฤษ')
    .max(100, 'ชื่อโรคภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .regex(/^[a-zA-Z0-9\s\-\.\_\(\)]+$/, 'ชื่อโรคภาษาอังกฤษต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมายพิเศษเท่านั้น')
    .optional(),
  thaiName: z
    .string()
    .min(1, 'กรุณากรอกชื่อโรคภาษาไทย')
    .max(100, 'ชื่อโรคภาษาไทยต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  shortName: z
    .string()
    .min(1, 'กรุณากรอกชื่อย่อโรค')
    .max(20, 'ชื่อย่อโรคต้องไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9\-\_]+$/, 'ชื่อย่อโรคต้องเป็นตัวอักษรพิมพ์ใหญ่ ตัวเลข หรือ - _ เท่านั้น')
    .optional(),
  details: z
    .string()
    .max(500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'กรุณาระบุข้อมูลที่ต้องการแก้ไขอย่างน้อย 1 รายการ' }
);

// Disease Query Parameters Schema
export const diseaseQuerySchema = z.object({
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
  sortBy: z
    .enum(['engName', 'thaiName', 'shortName', 'createdAt', 'updatedAt'])
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

// Disease ID Parameter Schema
export const diseaseParamSchema = z.object({
  id: z.string().uuid('รหัสโรคไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
});

// ============================================
// DISEASE RESPONSE SCHEMAS
// ============================================

// Disease Info Schema (for responses)
export const diseaseInfoSchema = z.object({
  id: z.string().uuid(),
  engName: z.string(),
  thaiName: z.string(),
  shortName: z.string(),
  details: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    symptoms: z.number(),
    patientVisits: z.number(),
  }).optional(),
  symptoms: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    isActive: z.boolean(),
  })).optional(),
});

// Disease List Response Schema
export const diseaseListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    diseases: z.array(diseaseInfoSchema),
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

// Disease Detail Response Schema
export const diseaseDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    disease: diseaseInfoSchema,
  }),
});

// Disease Create/Update Response Schema
export const diseaseCreateUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    disease: diseaseInfoSchema,
  }),
});

// Disease Delete Response Schema
export const diseaseDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    deletedAt: z.date(),
  }),
});

// ============================================
// ERROR RESPONSE SCHEMAS
// ============================================

// Disease Error Response Schema
export const diseaseErrorResponseSchema = z.object({
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
export type CreateDiseaseRequest = z.infer<typeof createDiseaseSchema>;
export type UpdateDiseaseRequest = z.infer<typeof updateDiseaseSchema>;
export type DiseaseQueryParams = z.infer<typeof diseaseQuerySchema>;
export type DiseaseParam = z.infer<typeof diseaseParamSchema>;

// Response Types
export type DiseaseInfo = z.infer<typeof diseaseInfoSchema>;
export type DiseaseListResponse = z.infer<typeof diseaseListResponseSchema>;
export type DiseaseDetailResponse = z.infer<typeof diseaseDetailResponseSchema>;
export type DiseaseCreateUpdateResponse = z.infer<typeof diseaseCreateUpdateResponseSchema>;
export type DiseaseDeleteResponse = z.infer<typeof diseaseDeleteResponseSchema>;
export type DiseaseErrorResponse = z.infer<typeof diseaseErrorResponseSchema>;

// Combined Disease Types for easier imports
export type DiseaseRequestTypes = {
  create: CreateDiseaseRequest;
  update: UpdateDiseaseRequest;
  query: DiseaseQueryParams;
  param: DiseaseParam;
};

export type DiseaseResponseTypes = {
  list: DiseaseListResponse;
  detail: DiseaseDetailResponse;
  create: DiseaseCreateUpdateResponse;
  update: DiseaseCreateUpdateResponse;
  delete: DiseaseDeleteResponse;
  error: DiseaseErrorResponse;
};