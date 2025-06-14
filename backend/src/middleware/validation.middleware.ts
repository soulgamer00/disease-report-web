// backend/src/middleware/validation.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// ============================================
// VALIDATION MIDDLEWARE TYPES
// ============================================

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidationError {
  field: string;
  message: string;
}

// Extend Express Request to include validated data
declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

// ============================================
// MAIN VALIDATION MIDDLEWARE
// ============================================

/**
 * Generic validation middleware using Zod schemas
 * @param schema - Zod schema for validation
 * @param target - Which part of request to validate (body, query, params)
 */
export const validate = <T>(schema: ZodSchema<T>, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      let targetData: unknown;

      // Select the target data based on validation target
      switch (target) {
        case 'body':
          targetData = req.body;
          break;
        case 'query':
          targetData = req.query;
          break;
        case 'params':
          targetData = req.params;
          break;
        default:
          targetData = req.body;
      }

      // Validate the data using Zod schema
      const validatedData: T = schema.parse(targetData);

      // Store validated data in req.validated instead of overriding original properties
      if (!req.validated) {
        req.validated = {};
      }

      req.validated[target] = validatedData;

      // For backward compatibility, also update the original properties safely
      switch (target) {
        case 'body':
          req.body = validatedData;
          break;
        case 'query':
          // Type-safe assignment for query
          req.query = validatedData as Record<string, string | string[] | undefined>;
          break;
        case 'params':
          // Type-safe assignment for params
          req.params = validatedData as Record<string, string>;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a more user-friendly format
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          error: 'Validation failed',
          details: validationErrors,
        });
        return;
      }

      // Handle other validation errors
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล',
        error: 'Validation error',
      });
    }
  };
};

// ============================================
// SPECIALIZED VALIDATION MIDDLEWARES
// ============================================

/**
 * Validate request body
 */
export const validateBody = <T>(schema: ZodSchema<T>) => validate(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => validate(schema, 'query');

/**
 * Validate URL parameters
 */
export const validateParams = <T>(schema: ZodSchema<T>) => validate(schema, 'params');

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

import { z } from 'zod';

// UUID parameter validation
export const uuidParamSchema = z.object({
  id: z.string().uuid('รหัสไม่ถูกต้อง กรุณาระบุ UUID ที่ถูกต้อง'),
});

// Pagination query validation
export const paginationQuerySchema = z.object({
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
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Date range query validation
export const dateRangeQuerySchema = z.object({
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
});

// Hospital filter query validation
export const hospitalFilterQuerySchema = z.object({
  hospitalCode9eDigit: z.string().optional(),
  hospitalName: z.string().optional(),
});

// ============================================
// VALIDATION HELPER FUNCTIONS
// ============================================

/**
 * Transform string to number with validation
 */
export const stringToNumber = (errorMessage: string = 'ต้องเป็นตัวเลข') => {
  return z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number({ message: errorMessage }));
};

/**
 * Transform string to date with validation
 */
export const stringToDate = (errorMessage: string = 'รูปแบบวันที่ไม่ถูกต้อง') => {
  return z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), errorMessage)
    .transform((date) => new Date(date));
};

/**
 * Optional string that transforms empty string to undefined
 */
export const optionalString = z
  .string()
  .optional()
  .transform((val) => (val === '' ? undefined : val));

/**
 * Thai ID card validation
 */
export const thaiIdCardSchema = z
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
  );

/**
 * Thai phone number validation
 */
export const thaiPhoneSchema = z
  .string()
  .regex(/^0[0-9]{8,9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก)')
  .optional();

// ============================================
// EXPORT TYPES
// ============================================

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>;
export type HospitalFilterQuery = z.infer<typeof hospitalFilterQuerySchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;