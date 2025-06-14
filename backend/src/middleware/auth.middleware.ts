// backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { jwtPayloadSchema, JwtPayload } from '../schemas/auth.schema';

// Import JWT with require to avoid type issues
const jwt = require('jsonwebtoken');

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        userRoleId: number;
        hospitalCode9eDigit: string | null;
      };
    }
  }
}

// ============================================
// JWT TOKEN UTILITIES
// ============================================

export const generateAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const tokenPayload = {
    userId: payload.userId,
    username: payload.username,
    userRoleId: payload.userRoleId,
    hospitalCode9eDigit: payload.hospitalCode9eDigit,
  };

  return jwt.sign(tokenPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'disease-report-system',
    audience: 'disease-report-users',
  });
};

export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const tokenPayload = {
    userId: payload.userId,
    username: payload.username,
    userRoleId: payload.userRoleId,
    hospitalCode9eDigit: payload.hospitalCode9eDigit,
  };

  return jwt.sign(tokenPayload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'disease-report-system',
    audience: 'disease-report-users',
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, config.jwt.secret, {
    issuer: 'disease-report-system',
    audience: 'disease-report-users',
  });
  
  // Validate the decoded payload structure
  const validatedPayload = jwtPayloadSchema.parse(decoded);
  return validatedPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'disease-report-system',
    audience: 'disease-report-users',
  });
  
  // Validate the decoded payload structure
  const validatedPayload = jwtPayloadSchema.parse(decoded);
  return validatedPayload;
};

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'ไม่พบ access token กรุณาเข้าสู่ระบบ',
        error: 'Authentication required',
      });
      return;
    }

    // Verify and decode token
    const decoded = verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        userRoleId: true,
        hospitalCode9eDigit: true,
        hospital: {
          select: {
            id: true,
            hospitalName: true,
            hospitalCode9eDigit: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน หรือบัญชีถูกปิดใช้งาน',
        error: 'User not found or inactive',
      });
      return;
    }

    // Attach user info to request object
    req.user = {
      id: user.id,
      username: user.username,
      userRoleId: user.userRoleId,
      hospitalCode9eDigit: user.hospitalCode9eDigit,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
        error: 'Invalid token',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่',
        error: 'Token expired',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
      error: 'Authentication error',
    });
  }
};

// ============================================
// OPTIONAL AUTHENTICATION MIDDLEWARE
// ============================================

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to authenticate, but don't fail if no token
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        
        const user = await prisma.user.findFirst({
          where: {
            id: decoded.userId,
            isActive: true,
          },
          select: {
            id: true,
            username: true,
            userRoleId: true,
            hospitalCode9eDigit: true,
          },
        });

        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            userRoleId: user.userRoleId,
            hospitalCode9eDigit: user.hospitalCode9eDigit,
          };
        }
      } catch {
        // Ignore token errors in optional auth
      }
    }

    next();
  } catch (error) {
    // Continue without authentication in case of errors
    next();
  }
};

// ============================================
// TOKEN EXTRACTION UTILITIES
// ============================================

export const extractTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
};