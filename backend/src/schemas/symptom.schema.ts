// backend/src/schemas/symptom.schema.ts

import { z } from 'zod';

// ============================================
// SYMPTOM REQUEST SCHEMAS
// ============================================

// Create Symptom Schema
export const createSymptomSchema = z.object({
  diseaseId: z
    .string()
    .uuid('รหัสโรคไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
  name: z
    .string()
    .min(1, 'กรุณากรอกชื่ออาการ')
    .max(100, 'ชื่ออาการต้องไม่เกิน 100 ตัวอักษร')
    .trim(),
});

// Update Symptom Schema
export const updateSymptomSchema = z.object({
  diseaseId: z
    .string()
    .uuid('รหัสโรคไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง')
    .optional(),
  name: z
    .string()
    .min(1, 'กรุณากรอกชื่ออาการ')
    .max(100, 'ชื่ออาการต้องไม่เกิน 100 ตัวอักษร')
    .trim()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'กรุณาระบุข้อมูลที่ต้องการแก้ไขอย่างน้อย 1 รายการ' }
);

// Symptom Query Parameters Schema
export const symptomQuerySchema = z.object({
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
    .uuid('รหัสโรคไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง')
    .optional(),
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt'])
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

// Symptom ID Parameter Schema
export const symptomParamSchema = z.object({
  id: z.string().uuid('รหัสอาการไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
});

// Disease ID Parameter Schema (for /symptoms/disease/:diseaseId)
export const diseaseParamSchema = z.object({
  diseaseId: z.string().uuid('รหัสโรคไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
});

// ============================================
// SYMPTOM RESPONSE SCHEMAS
// ============================================

// Symptom Info Schema (for responses)
export const symptomInfoSchema = z.object({
  id: z.string().uuid(),
  diseaseId: z.string().uuid(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  disease: z.object({
    id: z.string().uuid(),
    engName: z.string(),
    thaiName: z.string(),
    shortName: z.string(),
  }).optional(),
});

// Symptom List Response Schema
export const symptomListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    symptoms: z.array(symptomInfoSchema),
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

// Symptom Detail Response Schema
export const symptomDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    symptom: symptomInfoSchema,
  }),
});

// Symptom Create/Update Response Schema
export const symptomCreateUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    symptom: symptomInfoSchema,
  }),
});

// Symptom Delete Response Schema
export const symptomDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    deletedAt: z.date(),
  }),
});

// Disease Symptoms Response Schema
export const diseaseSymptomListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    diseaseId: z.string().uuid(),
    diseaseName: z.string(),
    symptoms: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      isActive: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })),
    total: z.number(),
  }),
});

// ============================================
// ERROR RESPONSE SCHEMAS
// ============================================

// Symptom Error Response Schema
export const symptomErrorResponseSchema = z.object({
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
export type CreateSymptomRequest = z.infer<typeof createSymptomSchema>;
export type UpdateSymptomRequest = z.infer<typeof updateSymptomSchema>;
export type SymptomQueryParams = z.infer<typeof symptomQuerySchema>;
export type SymptomParam = z.infer<typeof symptomParamSchema>;
export type DiseaseParam = z.infer<typeof diseaseParamSchema>;

// Response Types
export type SymptomInfo = z.infer<typeof symptomInfoSchema>;
export type SymptomListResponse = z.infer<typeof symptomListResponseSchema>;
export type SymptomDetailResponse = z.infer<typeof symptomDetailResponseSchema>;
export type SymptomCreateUpdateResponse = z.infer<typeof symptomCreateUpdateResponseSchema>;
export type SymptomDeleteResponse = z.infer<typeof symptomDeleteResponseSchema>;
export type DiseaseSymptomListResponse = z.infer<typeof diseaseSymptomListResponseSchema>;
export type SymptomErrorResponse = z.infer<typeof symptomErrorResponseSchema>;

// Combined Symptom Types for easier imports
export type SymptomRequestTypes = {
  create: CreateSymptomRequest;
  update: UpdateSymptomRequest;
  query: SymptomQueryParams;
  param: SymptomParam;
  diseaseParam: DiseaseParam;
};

export type SymptomResponseTypes = {
  list: SymptomListResponse;
  detail: SymptomDetailResponse;
  create: SymptomCreateUpdateResponse;
  update: SymptomCreateUpdateResponse;
  delete: SymptomDeleteResponse;
  diseaseSymptoms: DiseaseSymptomListResponse;
  error: SymptomErrorResponse;
};