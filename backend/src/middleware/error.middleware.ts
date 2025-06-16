// backend/src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from '../config';

// ============================================
// ERROR TYPES AND INTERFACES
// ============================================

interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: unknown;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
}

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

// ============================================
// ERROR MESSAGE CONSTANTS (Thai Only)
// ============================================

const ERROR_MESSAGES = {
  // General Errors
  INTERNAL_SERVER_ERROR: 'เกิดข้อผิดพลาดภายในระบบ',
  ROUTE_NOT_FOUND: 'ไม่พบเส้นทางที่ร้องขอ',
  INVALID_REQUEST: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
  
  // Authentication & Authorization
  AUTHENTICATION_REQUIRED: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน',
  INVALID_TOKEN: 'รหัสการเข้าสู่ระบบไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
  TOKEN_EXPIRED: 'รหัสการเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  INSUFFICIENT_PERMISSIONS: 'ไม่มีสิทธิ์ในการดำเนินการนี้',
  
  // Database Errors
  DUPLICATE_DATA: 'ข้อมูลนี้มีอยู่ในระบบแล้ว',
  RECORD_NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  FOREIGN_KEY_CONSTRAINT: 'ไม่สามารถดำเนินการได้ เนื่องจากข้อมูลถูกใช้งานอยู่',
  DATABASE_CONNECTION_ERROR: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล',
  DATABASE_VALIDATION_ERROR: 'ข้อมูลไม่ตรงตามข้อกำหนดของฐานข้อมูล',
  
  // Validation Errors
  VALIDATION_ERROR: 'ข้อมูลที่กรอกไม่ถูกต้อง',
  REQUIRED_FIELD_MISSING: 'กรุณากรอกข้อมูลที่จำเป็น',
  INVALID_FORMAT: 'รูปแบบข้อมูลไม่ถูกต้อง',
  
  // File & Upload Errors
  FILE_TOO_LARGE: 'ไฟล์มีขนาดใหญ่เกินกำหนด',
  INVALID_FILE_TYPE: 'ประเภทไฟล์ไม่ได้รับอนุญาต',
  FILE_UPLOAD_ERROR: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์',
  
  // Rate Limiting
  TOO_MANY_REQUESTS: 'มีการใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
  TOO_MANY_LOGIN_ATTEMPTS: 'การเข้าสู่ระบบล้มเหลวหลายครั้ง กรุณาลองใหม่อีกครั้งในภายหลัง',
} as const;

// ============================================
// ERROR RESPONSE FORMATTER
// ============================================

const createErrorResponse = (
  req: Request,
  message: string,
  error: string,
  statusCode: number,
  details?: unknown
): ErrorResponse => ({
  success: false,
  message,
  error,
  details,
  timestamp: new Date().toISOString(),
  path: req.originalUrl,
  method: req.method,
  statusCode,
});

// ============================================
// MAIN ERROR HANDLING MIDDLEWARE
// ============================================

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Global Error Handler:', {
    error: error.message,
    stack: config.server.nodeEnv === 'development' ? error.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // ============================================
  // ZOD VALIDATION ERRORS
  // ============================================
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    res.status(400).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.VALIDATION_ERROR,
        'Validation failed',
        400,
        validationErrors
      )
    );
    return;
  }

  // ============================================
  // PRISMA DATABASE ERRORS
  // ============================================
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[] | undefined;
        res.status(409).json(
          createErrorResponse(
            req,
            ERROR_MESSAGES.DUPLICATE_DATA,
            'Duplicate data',
            409,
            { field: field?.[0] || 'unknown' }
          )
        );
        return;

      case 'P2025':
        // Record not found
        res.status(404).json(
          createErrorResponse(
            req,
            ERROR_MESSAGES.RECORD_NOT_FOUND,
            'Record not found',
            404
          )
        );
        return;

      case 'P2003':
        // Foreign key constraint violation
        res.status(400).json(
          createErrorResponse(
            req,
            ERROR_MESSAGES.FOREIGN_KEY_CONSTRAINT,
            'Foreign key constraint failed',
            400
          )
        );
        return;

      case 'P2021':
        // Table does not exist
        res.status(500).json(
          createErrorResponse(
            req,
            ERROR_MESSAGES.DATABASE_CONNECTION_ERROR,
            'Database table not found',
            500
          )
        );
        return;

      default:
        res.status(500).json(
          createErrorResponse(
            req,
            ERROR_MESSAGES.DATABASE_CONNECTION_ERROR,
            'Database error',
            500,
            config.server.nodeEnv === 'development' ? error.message : undefined
          )
        );
        return;
    }
  }

  // ============================================
  // PRISMA CLIENT ERRORS
  // ============================================
  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.DATABASE_VALIDATION_ERROR,
        'Database validation error',
        400,
        config.server.nodeEnv === 'development' ? error.message : undefined
      )
    );
    return;
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    res.status(500).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.DATABASE_CONNECTION_ERROR,
        'Unknown database error',
        500
      )
    );
    return;
  }

  // ============================================
  // JWT AUTHENTICATION ERRORS
  // ============================================
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.INVALID_TOKEN,
        'Invalid token',
        401
      )
    );
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.TOKEN_EXPIRED,
        'Token expired',
        401
      )
    );
    return;
  }

  // ============================================
  // CUSTOM APPLICATION ERRORS
  // ============================================
  if (error.statusCode) {
    res.status(error.statusCode).json(
      createErrorResponse(
        req,
        error.message,
        error.code || 'Application error',
        error.statusCode,
        error.details
      )
    );
    return;
  }

  // ============================================
  // AUTHORIZATION ERRORS
  // ============================================
  if (error.message.includes('Authentication required') || 
      error.message.includes('กรุณาเข้าสู่ระบบ')) {
    res.status(401).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.AUTHENTICATION_REQUIRED,
        'Authentication required',
        401
      )
    );
    return;
  }

  if (error.message.includes('ไม่มีสิทธิ์') || 
      error.message.includes('Permission denied') ||
      error.message.includes('Insufficient permissions')) {
    res.status(403).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        'Permission denied',
        403
      )
    );
    return;
  }

  // ============================================
  // SYNTAX AND TYPE ERRORS
  // ============================================
  if (error instanceof SyntaxError) {
    res.status(400).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.INVALID_FORMAT,
        'Invalid JSON syntax',
        400
      )
    );
    return;
  }

  if (error instanceof TypeError) {
    res.status(500).json(
      createErrorResponse(
        req,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        'Type error',
        500,
        config.server.nodeEnv === 'development' ? error.message : undefined
      )
    );
    return;
  }

  // ============================================
  // DEFAULT INTERNAL SERVER ERROR
  // ============================================
  res.status(500).json(
    createErrorResponse(
      req,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      'Internal server error',
      500,
      config.server.nodeEnv === 'development' ? error.message : undefined
    )
  );
};

// ============================================
// NOT FOUND HANDLER
// ============================================

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(
    createErrorResponse(
      req,
      ERROR_MESSAGES.ROUTE_NOT_FOUND,
      'Route not found',
      404
    )
  );
};

// ============================================
// ASYNC ERROR WRAPPER
// ============================================

export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<void>
) => {
  return (req: T, res: U, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.VALIDATION_ERROR) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.RECORD_NOT_FOUND) {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = ERROR_MESSAGES.AUTHENTICATION_REQUIRED) {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS) {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = ERROR_MESSAGES.DUPLICATE_DATA) {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = ERROR_MESSAGES.TOO_MANY_REQUESTS) {
    super(message, 429);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FILE_UPLOAD_ERROR) {
    super(message, 400);
  }
}