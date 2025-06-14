// backend/src/schemas/report.schema.ts

import { z } from 'zod';

// ============================================
// REPORT REQUEST SCHEMAS
// ============================================

// Base Report Query Schema (common filters)
export const baseReportQuerySchema = z.object({
  // Date Range Filters
  dateFrom: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'วันที่เริ่มต้นไม่ถูกต้อง')
    .transform((date) => (date ? new Date(date) : undefined)),
  dateTo: z
    .string()
    .optional()
    .refine((date) => !date || !date || !isNaN(Date.parse(date)), 'วันที่สิ้นสุดไม่ถูกต้อง')
    .transform((date) => (date ? new Date(date) : undefined)),
  
  // Hospital Filters
  hospitalCode: z
    .string()
    .regex(/^\d{9}$/, 'รหัสโรงพยาบาลต้องเป็นตัวเลข 9 หลัก')
    .optional(),
  hospitalId: z
    .string()
    .uuid('รหัสโรงพยาบาลไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง')
    .optional(),
  
  // Disease Filters
  diseaseId: z
    .string()
    .uuid('รหัสโรคไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง')
    .optional(),
  
  // Demographics Filters
  gender: z
    .enum(['M', 'F'])
    .optional(),
  ageMin: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(0, 'อายุขั้นต่ำต้องมากกว่าหรือเท่ากับ 0').max(120, 'อายุขั้นต่ำต้องไม่เกิน 120').optional()),
  ageMax: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(0, 'อายุสูงสุดต้องมากกว่าหรือเท่ากับ 0').max(120, 'อายุสูงสุดต้องไม่เกิน 120').optional()),
  
  // Pagination
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, 'หน้าต้องมากกว่าหรือเท่ากับ 1')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1000))
    .pipe(z.number().min(1, 'จำนวนรายการต่อหน้าต้องมากกว่าหรือเท่ากับ 1').max(5000, 'จำนวนรายการต่อหน้าต้องไม่เกิน 5000')),
});

// Incidence Rate Data Query Schema
export const incidenceDataQuerySchema = baseReportQuerySchema.extend({
  groupBy: z
    .enum(['month', 'quarter', 'year', 'hospital', 'disease'])
    .optional()
    .default('month'),
});

// Gender Ratio Data Query Schema
export const genderDataQuerySchema = baseReportQuerySchema.extend({
  groupBy: z
    .enum(['age_group', 'hospital', 'disease', 'month'])
    .optional()
    .default('age_group'),
});

// Trend Analysis Data Query Schema
export const trendDataQuerySchema = baseReportQuerySchema.extend({
  groupBy: z
    .enum(['day', 'week', 'month', 'quarter', 'year'])
    .optional()
    .default('month'),
  trendType: z
    .enum(['patient_count', 'incidence_rate', 'gender_ratio'])
    .optional()
    .default('patient_count'),
});

// Population Data Query Schema
export const populationDataQuerySchema = z.object({
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : new Date().getFullYear()))
    .pipe(z.number().min(2020, 'ปีต้องตั้งแต่ 2020').max(new Date().getFullYear() + 5, `ปีต้องไม่เกิน ${new Date().getFullYear() + 5}`)),
  hospitalCode: z
    .string()
    .regex(/^\d{9}$/, 'รหัสโรงพยาบาลต้องเป็นตัวเลข 9 หลัก')
    .optional(),
  hospitalId: z
    .string()
    .uuid('รหัสโรงพยาบาลไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง')
    .optional(),
  groupBy: z
    .enum(['hospital', 'year', 'age_group', 'gender'])
    .optional()
    .default('hospital'),
});

// ============================================
// REPORT RESPONSE SCHEMAS
// ============================================

// Patient Visit Data Item Schema
export const patientVisitDataItemSchema = z.object({
  id: z.string().uuid(),
  hospitalCode: z.string(),
  hospitalName: z.string(),
  diseaseId: z.string().uuid(),
  diseaseName: z.string(),
  patientGender: z.enum(['M', 'F']),
  ageAtIllness: z.number(),
  illnessDate: z.date(),
  month: z.string(),
  year: z.number(),
  quarter: z.string(),
});

// Population Data Item Schema
export const populationDataItemSchema = z.object({
  id: z.string().uuid(),
  hospitalCode: z.string(),
  hospitalName: z.string(),
  year: z.number(),
  totalPopulation: z.number(),
});

// Aggregated Count Data Schema
export const aggregatedCountDataSchema = z.object({
  groupKey: z.string(),
  groupValue: z.string(),
  count: z.number(),
  hospitalCode: z.string().optional(),
  hospitalName: z.string().optional(),
  diseaseId: z.string().uuid().optional(),
  diseaseName: z.string().optional(),
});

// Report Data Response Schemas
export const patientVisitDataResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    items: z.array(patientVisitDataItemSchema),
    aggregated: z.array(aggregatedCountDataSchema).optional(),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export const populationDataResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    items: z.array(populationDataItemSchema),
    total: z.number(),
    year: z.number(),
  }),
});

// ============================================
// ERROR RESPONSE SCHEMAS
// ============================================

export const reportErrorResponseSchema = z.object({
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
export type BaseReportQuery = z.infer<typeof baseReportQuerySchema>;
export type IncidenceDataQuery = z.infer<typeof incidenceDataQuerySchema>;
export type GenderDataQuery = z.infer<typeof genderDataQuerySchema>;
export type TrendDataQuery = z.infer<typeof trendDataQuerySchema>;
export type PopulationDataQuery = z.infer<typeof populationDataQuerySchema>;

// Response Types
export type PatientVisitDataItem = z.infer<typeof patientVisitDataItemSchema>;
export type PopulationDataItem = z.infer<typeof populationDataItemSchema>;
export type AggregatedCountData = z.infer<typeof aggregatedCountDataSchema>;
export type PatientVisitDataResponse = z.infer<typeof patientVisitDataResponseSchema>;
export type PopulationDataResponse = z.infer<typeof populationDataResponseSchema>;
export type ReportErrorResponse = z.infer<typeof reportErrorResponseSchema>;

// Combined Report Types for easier imports
export type ReportRequestTypes = {
  base: BaseReportQuery;
  incidence: IncidenceDataQuery;
  gender: GenderDataQuery;
  trend: TrendDataQuery;
  population: PopulationDataQuery;
};

export type ReportResponseTypes = {
  patientVisitData: PatientVisitDataResponse;
  populationData: PopulationDataResponse;
  error: ReportErrorResponse;
};