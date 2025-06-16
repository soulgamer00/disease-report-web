// backend/src/schemas/report.schema.ts

import { z } from 'zod';

// ============================================
// REPORT REQUEST SCHEMAS
// ============================================

// Base Report Filters (common to all reports)
export const reportFiltersSchema = z.object({
  diseaseId: z.string().uuid('รหัสโรคต้องเป็น UUID'),
  year: z.string().optional().default(new Date().getFullYear().toString()),
  hospitalCode: z.string().optional().default('all'),
  gender: z.enum(['MALE', 'FEMALE', 'all']).optional().default('all'),
  ageGroup: z.enum(['0-10', '11-20', '21-30', '31-40', '41-50', '51+', 'all']).optional().default('all'),
  occupation: z.string().optional().default('all'),
});

// Age Groups Report Request
export const ageGroupsReportRequestSchema = reportFiltersSchema;

// Gender Ratio Report Request
export const genderRatioReportRequestSchema = reportFiltersSchema;

// Incidence Rates Report Request
export const incidenceRatesReportRequestSchema = reportFiltersSchema;

// Occupation Report Request
export const occupationReportRequestSchema = reportFiltersSchema;

// ============================================
// REPORT RESPONSE SCHEMAS
// ============================================

// Disease Info Schema
export const diseaseInfoSchema = z.object({
  id: z.number(),
  thaiName: z.string().nullable(),
  engName: z.string().nullable(),
  daName: z.string().nullable(),
});

// Age Groups Report Response
export const ageGroupDataSchema = z.object({
  ageGroup: z.string(),
  count: z.number(),
  percentage: z.number(),
  incidenceRate: z.number(),
});

export const ageGroupsReportResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    disease: diseaseInfoSchema,
    filters: reportFiltersSchema,
    summary: z.object({
      totalPatients: z.number(),
      totalPopulation: z.number(),
      hasPopulationData: z.boolean(),
    }),
    ageGroups: z.array(ageGroupDataSchema),
  }),
});

// Gender Ratio Report Response
export const genderRatioDataSchema = z.object({
  total: z.number(),
  male: z.number(),
  female: z.number(),
  other: z.number(),
  notSpecified: z.number(),
});

export const genderRatioResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    disease: diseaseInfoSchema,
    filters: reportFiltersSchema,
    summary: z.object({
      total: z.number(),
      male: z.number(),
      female: z.number(),
      other: z.number(),
      notSpecified: z.number(),
      totalPopulation: z.number(),
      hasPopulationData: z.boolean(),
    }),
    ratio: z.object({
      male: z.number(),
      female: z.number(),
    }),
    percentages: z.object({
      male: z.number(),
      female: z.number(),
      other: z.number(),
      notSpecified: z.number(),
    }),
  }),
});

// Incidence Rates Report Response
export const hospitalStatsSchema = z.object({
  hospitalCode: z.string(),
  hospitalName: z.string(),
  population: z.number(),
  patients: z.number(),
  deaths: z.number(),
  incidenceRate: z.number(),
  mortalityRate: z.number(),
  caseFatalityRate: z.number(),
  hasPopulationData: z.boolean(),
});

export const incidenceRatesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    disease: diseaseInfoSchema,
    filters: reportFiltersSchema,
    summary: z.object({
      totalPopulation: z.number(),
      totalPatients: z.number(),
      deaths: z.number(),
      incidenceRate: z.number(),
      mortalityRate: z.number(),
      caseFatalityRate: z.number(),
      hasPopulationData: z.boolean(),
      populationNote: z.string().optional(),
    }),
    hospitals: z.array(hospitalStatsSchema),
    populationDetails: z.object({
      totalHospitalsWithData: z.number(),
      yearsCovered: z.array(z.number()),
      note: z.string(),
    }),
  }),
});

// Occupation Report Response
export const occupationDataSchema = z.object({
  occupation: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export const occupationReportResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    disease: diseaseInfoSchema,
    filters: reportFiltersSchema,
    summary: z.object({
      totalPatients: z.number(),
      uniqueOccupations: z.number(),
    }),
    occupations: z.array(occupationDataSchema),
  }),
});

// ============================================
// UTILITY RESPONSE SCHEMAS
// ============================================

// Diseases List Response
export const diseaseItemSchema = z.object({
  id: z.string().uuid(),
  engName: z.string(),
  thaiName: z.string(),
  shortName: z.string(),
  details: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
});

export const diseasesListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    diseases: z.array(diseaseItemSchema),
    total: z.number(),
  }),
});

// Hospitals List Response
export const hospitalItemSchema = z.object({
  value: z.string(),
  label: z.string(),
  code: z.string(),
});

export const hospitalsListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    hospitals: z.array(hospitalItemSchema),
    total: z.number(),
  }),
});

// Public Stats Response
export const publicStatsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    totalDiseases: z.number(),
    totalPatients: z.number(),
    currentMonthPatients: z.number(),
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
export type ReportFilters = z.infer<typeof reportFiltersSchema>;
export type AgeGroupsReportRequest = z.infer<typeof ageGroupsReportRequestSchema>;
export type GenderRatioReportRequest = z.infer<typeof genderRatioReportRequestSchema>;
export type IncidenceRatesReportRequest = z.infer<typeof incidenceRatesReportRequestSchema>;
export type OccupationReportRequest = z.infer<typeof occupationReportRequestSchema>;

// Response Data Types
export type DiseaseInfo = z.infer<typeof diseaseInfoSchema>;
export type AgeGroupData = z.infer<typeof ageGroupDataSchema>;
export type GenderRatioData = z.infer<typeof genderRatioDataSchema>;
export type HospitalStats = z.infer<typeof hospitalStatsSchema>;
export type OccupationData = z.infer<typeof occupationDataSchema>;
export type DiseaseItem = z.infer<typeof diseaseItemSchema>;
export type HospitalItem = z.infer<typeof hospitalItemSchema>;

// Response Types
export type AgeGroupsReportResponse = z.infer<typeof ageGroupsReportResponseSchema>;
export type GenderRatioResponse = z.infer<typeof genderRatioResponseSchema>;
export type IncidenceRatesResponse = z.infer<typeof incidenceRatesResponseSchema>;
export type OccupationReportResponse = z.infer<typeof occupationReportResponseSchema>;
export type DiseasesListResponse = z.infer<typeof diseasesListResponseSchema>;
export type HospitalsListResponse = z.infer<typeof hospitalsListResponseSchema>;
export type PublicStatsResponse = z.infer<typeof publicStatsResponseSchema>;
export type ReportErrorResponse = z.infer<typeof reportErrorResponseSchema>;

// Combined Types for convenience
export type ReportRequestTypes = {
  ageGroups: AgeGroupsReportRequest;
  genderRatio: GenderRatioReportRequest;
  incidenceRates: IncidenceRatesReportRequest;
  occupation: OccupationReportRequest;
};

export type ReportResponseTypes = {
  ageGroups: AgeGroupsReportResponse;
  genderRatio: GenderRatioResponse;
  incidenceRates: IncidenceRatesResponse;
  occupation: OccupationReportResponse;
  diseases: DiseasesListResponse;
  hospitals: HospitalsListResponse;
  publicStats: PublicStatsResponse;
  error: ReportErrorResponse;
};