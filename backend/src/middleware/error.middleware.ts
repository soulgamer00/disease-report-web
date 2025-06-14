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
        'ข้อมูลที่ส่งมาไม่ถูกต้อง',
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
            `ข้อมูล${field ? ` ${field.join(', ')} ` : ''}นี้มีอยู่ในระบบแล้ว`,
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
            'ไม่พบข้อมูลที่ต้องการ',
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
            'ข้อมูลอ้างอิงไม่ถูกต้อง',
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
            'เกิดข้อผิดพลาดของระบบฐานข้อมูล',
            'Database table not found',
            500
          )
        );
        return;

      default:
        res.status(500).json(
          createErrorResponse(
            req,
            'เกิดข้อผิดพลาดของฐานข้อมูล',
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
        'ข้อมูลที่ส่งไม่ถูกต้องตามโครงสร้างฐานข้อมูล',
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
        'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุของฐานข้อมูล',
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
        'Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
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
        'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่',
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
  // UNAUTHORIZED AND FORBIDDEN ERRORS
  // ============================================
  if (error.message.includes('Authentication required') || error.message.includes('กรุณาเข้าสู่ระบบ')) {
    res.status(401).json(
      createErrorResponse(
        req,
        'กรุณาเข้าสู่ระบบเพื่อเข้าถึงข้อมูลนี้',
        'Authentication required',
        401
      )
    );
    return;
  }

  if (error.message.includes('ไม่มีสิทธิ์') || error.message.includes('Permission denied')) {
    res.status(403).json(
      createErrorResponse(
        req,
        'ไม่มีสิทธิ์ในการดำเนินการนี้',
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
        'รูปแบบข้อมูลไม่ถูกต้อง',
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
        'เกิดข้อผิดพลาดในการประมวลผลข้อมูล',
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
      'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
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
      `ไม่พบเส้นทาง ${req.method} ${req.originalUrl}`,
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
  constructor(message: string = 'ข้อมูลไม่ถูกต้อง') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'ไม่พบข้อมูลที่ต้องการ') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'กรุณาเข้าสู่ระบบ') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'ไม่มีสิทธิ์ในการดำเนินการนี้') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'ข้อมูลซ้ำกับที่มีอยู่ในระบบ') {
    super(message, 409);
  }
}