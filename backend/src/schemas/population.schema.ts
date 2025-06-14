// backend/src/schemas/population.schema.ts

import { z } from 'zod';

// ============================================
// POPULATION REQUEST SCHEMAS
// ============================================

// Create Population Schema
export const createPopulationSchema = z.object({
  year: z
    .number()
    .int('ปีต้องเป็นจำนวนเต็ม')
    .min(2000, 'ปีต้องไม่น้อยกว่า 2000')
    .max(new Date().getFullYear() + 5, `ปีต้องไม่เกิน ${new Date().getFullYear() + 5}`)
    .refine(
      (year) => year >= 2000 && year <= new Date().getFullYear() + 5,
      'ปีต้องอยู่ในช่วงที่สมเหตุสมผล'
    ),
  hospitalCode9eDigit: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, 'รหัสโรงพยาบาลต้องเป็นรูปแบบ XX0000000 (ตัวอักษร 2 ตัว + ตัวเลข 7 ตัว)')
    .length(9, 'รหัสโรงพยาบาลต้องมี 9 หลักพอดี'),
  count: z
    .number()
    .int('จำนวนประชากรต้องเป็นจำนวนเต็ม')
    .min(0, 'จำนวนประชากรต้องไม่น้อยกว่า 0')
    .max(10000000, 'จำนวนประชากรต้องไม่เกิน 10,000,000'),
});

// Update Population Schema
export const updatePopulationSchema = z.object({
  year: z
    .number()
    .int('ปีต้องเป็นจำนวนเต็ม')
    .min(2000, 'ปีต้องไม่น้อยกว่า 2000')
    .max(new Date().getFullYear() + 5, `ปีต้องไม่เกิน ${new Date().getFullYear() + 5}`)
    .optional(),
  hospitalCode9eDigit: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, 'รหัสโรงพยาบาลต้องเป็นรูปแบบ XX0000000 (ตัวอักษร 2 ตัว + ตัวเลข 7 ตัว)')
    .length(9, 'รหัสโรงพยาบาลต้องมี 9 หลักพอดี')
    .optional(),
  count: z
    .number()
    .int('จำนวนประชากรต้องเป็นจำนวนเต็ม')
    .min(0, 'จำนวนประชากรต้องไม่น้อยกว่า 0')
    .max(10000000, 'จำนวนประชากรต้องไม่เกิน 10,000,000')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'กรุณาระบุข้อมูลที่ต้องการแก้ไขอย่างน้อย 1 รายการ' }
);

// Population Query Parameters Schema
export const populationQuerySchema = z.object({
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
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(2000).max(new Date().getFullYear() + 5).optional()),
  hospitalCode9eDigit: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, 'รหัสโรงพยาบาลไม่ถูกต้อง')
    .optional(),
  startYear: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(2000).optional()),
  endYear: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(2000).optional()),
  sortBy: z
    .enum(['year', 'count', 'createdAt', 'updatedAt'])
    .optional()
    .default('year'),
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
    if (data.startYear && data.endYear) {
      return data.startYear <= data.endYear;
    }
    return true;
  },
  { message: 'ปีเริ่มต้นต้องไม่มากกว่าปีสิ้นสุด', path: ['endYear'] }
);

// Population ID Parameter Schema
export const populationParamSchema = z.object({
  id: z.string().uuid('รหัสข้อมูลประชากรไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
});

// Hospital Code Parameter Schema
export const hospitalCodeParamSchema = z.object({
  code: z.string().regex(/^[A-Z]{2}\d{7}$/, 'รหัสโรงพยาบาลไม่ถูกต้อง'),
});

// Year Parameter Schema
export const yearParamSchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'ปีต้องเป็นตัวเลข 4 หลัก'),
});

// ============================================
// POPULATION RESPONSE SCHEMAS
// ============================================

// Population Info Schema (for responses)
export const populationInfoSchema = z.object({
  id: z.string().uuid(),
  year: z.number().int(),
  hospitalCode9eDigit: z.string(),
  count: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  hospital: z.object({
    id: z.string().uuid(),
    hospitalName: z.string(),
    hospitalCode9eDigit: z.string(),
    organizationType: z.string().nullable(),
    healthServiceType: z.string().nullable(),
  }).optional(),
});

// Population List Response Schema
export const populationListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    populations: z.array(populationInfoSchema),
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

// Population Detail Response Schema
export const populationDetailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    population: populationInfoSchema,
  }),
});

// Population Create/Update Response Schema
export const populationCreateUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    population: populationInfoSchema,
    info: z.object({
      action: z.enum(['created', 'restored']),
      previouslyDeleted: z.boolean(),
    }).optional(),
  }),
});

// Population Delete Response Schema
export const populationDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    deletedAt: z.date(),
  }),
});

// Population Statistics Response Schema
export const populationStatisticsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    statistics: z.object({
      totalRecords: z.number(),
      totalPopulation: z.number(),
      averagePopulation: z.number(),
      byYear: z.array(z.object({
        year: z.number(),
        totalPopulation: z.number(),
        hospitalCount: z.number(),
      })),
      byHospital: z.array(z.object({
        hospitalCode9eDigit: z.string(),
        hospitalName: z.string(),
        latestYear: z.number(),
        latestCount: z.number(),
      })),
      trends: z.array(z.object({
        year: z.number(),
        totalPopulation: z.number(),
        growth: z.number().nullable(),
        growthPercentage: z.number().nullable(),
      })),
      timestamp: z.string(),
    }),
  }),
});

// ============================================
// ERROR RESPONSE SCHEMAS
// ============================================

// Population Error Response Schema
export const populationErrorResponseSchema = z.object({
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
export type CreatePopulationRequest = z.infer<typeof createPopulationSchema>;
export type UpdatePopulationRequest = z.infer<typeof updatePopulationSchema>;
export type PopulationQueryParams = z.infer<typeof populationQuerySchema>;
export type PopulationParam = z.infer<typeof populationParamSchema>;
export type HospitalCodeParam = z.infer<typeof hospitalCodeParamSchema>;
export type YearParam = z.infer<typeof yearParamSchema>;

// Response Types
export type PopulationInfo = z.infer<typeof populationInfoSchema>;
export type PopulationListResponse = z.infer<typeof populationListResponseSchema>;
export type PopulationDetailResponse = z.infer<typeof populationDetailResponseSchema>;
export type PopulationCreateUpdateResponse = z.infer<typeof populationCreateUpdateResponseSchema>;
export type PopulationDeleteResponse = z.infer<typeof populationDeleteResponseSchema>;
export type PopulationStatisticsResponse = z.infer<typeof populationStatisticsResponseSchema>;
export type PopulationErrorResponse = z.infer<typeof populationErrorResponseSchema>;

// Combined Population Types for easier imports
export type PopulationRequestTypes = {
  create: CreatePopulationRequest;
  update: UpdatePopulationRequest;
  query: PopulationQueryParams;
  param: PopulationParam;
  hospitalCodeParam: HospitalCodeParam;
  yearParam: YearParam;
};

export type PopulationResponseTypes = {
  list: PopulationListResponse;
  detail: PopulationDetailResponse;
  create: PopulationCreateUpdateResponse;
  update: PopulationCreateUpdateResponse;
  delete: PopulationDeleteResponse;
  statistics: PopulationStatisticsResponse;
  error: PopulationErrorResponse;
};