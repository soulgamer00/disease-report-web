// backend/src/middleware/permission.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { prisma } from '../lib/prisma';

// ============================================
// PERMISSION CONSTANTS
// ============================================

export const PERMISSIONS = {
  PATIENT_VISIT_CREATE: 'PATIENT_VISIT_CREATE',
  PATIENT_VISIT_READ: 'PATIENT_VISIT_READ',
  PATIENT_VISIT_UPDATE: 'PATIENT_VISIT_UPDATE',
  PATIENT_VISIT_DELETE: 'PATIENT_VISIT_DELETE',
  DISEASE_MANAGE: 'DISEASE_MANAGE',
  DISEASE_READ: 'DISEASE_READ',
  HOSPITAL_MANAGE: 'HOSPITAL_MANAGE',
  HOSPITAL_READ: 'HOSPITAL_READ',
  USER_MANAGE: 'USER_MANAGE',
  USER_MANAGE_LIMITED: 'USER_MANAGE_LIMITED',
  REPORT_EXPORT: 'REPORT_EXPORT',
  REPORT_EXPORT_LIMITED: 'REPORT_EXPORT_LIMITED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
} as const;

// ============================================
// ROLE-BASED MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Check if user is Superadmin (roleId: 1)
 */
export const isSuperadmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ',
      error: 'Authentication required',
    });
    return;
  }

  if (req.user.userRoleId !== config.constants.roleIds.SUPERADMIN) {
    res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง - สำหรับผู้ดูแลระบบหลักเท่านั้น',
      error: 'Superadmin access required',
    });
    return;
  }

  next();
};

/**
 * Check if user is Admin or above (roleId: 1 or 2)
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ',
      error: 'Authentication required',
    });
    return;
  }

  const allowedRoles: number[] = [config.constants.roleIds.SUPERADMIN, config.constants.roleIds.ADMIN];  
  if (!allowedRoles.includes(req.user.userRoleId)) {
    res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง - สำหรับผู้ดูแลระบบเท่านั้น',
      error: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * Check if user is authenticated (any role)
 */
export const isUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ',
      error: 'Authentication required',
    });
    return;
  }

  next();
};

// ============================================
// HOSPITAL-BASED ACCESS CONTROL
// ============================================

/**
 * Check if user can access data from specific hospital
 * Superadmin: Access all hospitals
 * Admin/User: Access only their assigned hospital
 */
export const canAccessHospitalData = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ',
      error: 'Authentication required',
    });
    return;
  }

  // Superadmin can access all hospital data
  if (req.user.userRoleId === config.constants.roleIds.SUPERADMIN) {
    next();
    return;
  }

  // For Admin and User roles, check if they have a hospital assigned
  if (!req.user.hospitalCode9eDigit) {
    res.status(403).json({
      success: false,
      message: 'ไม่มีโรงพยาบาลที่ได้รับมอบหมาย',
      error: 'No hospital assigned',
    });
    return;
  }

  next();
};

/**
 * Check if user can manage other users
 * Superadmin: Can manage all users
 * Admin: Can manage users with roleId > their roleId (only Users)
 * User: Cannot manage other users
 */
export const canManageUsers = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ',
      error: 'Authentication required',
    });
    return;
  }

  // User role cannot manage other users
  if (req.user.userRoleId === config.constants.roleIds.USER) {
    res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์จัดการผู้ใช้งาน',
      error: 'User management not allowed',
    });
    return;
  }

  // Superadmin and Admin can manage users
  next();
};

// ============================================
// PERMISSION-BASED ACCESS CONTROL
// ============================================

/**
 * Create a middleware to check specific permission
 */
export const hasPermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ',
        error: 'Authentication required',
      });
      return;
    }

    try {
      // Check permission in database
      const permission = await prisma.permission.findFirst({
        where: {
          roleId: req.user.userRoleId,
          permissionCode,
          canAccess: true,
        },
      });

      if (!permission) {
        res.status(403).json({
          success: false,
          message: 'ไม่มีสิทธิ์ในการดำเนินการนี้',
          error: `Permission ${permissionCode} denied`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
        error: 'Permission check failed',
      });
    }
  };
};

// ============================================
// DATA FILTERING MIDDLEWARE
// ============================================

/**
 * Add hospital filter to query for non-superadmin users
 */
export const addHospitalFilter = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ',
      error: 'Authentication required',
    });
    return;
  }

  // Superadmin can see all data - no filter needed
if (req.user.userRoleId <= config.constants.roleIds.ADMIN) {
    next();
    return;
  }

  // For other roles, add hospital filter to query parameters
  if (req.user.hospitalCode9eDigit) {
    // Add to query parameters for filtering
    req.query.hospitalCode9eDigit = req.user.hospitalCode9eDigit;
  }

  next();
};

/**
 * Check if user can manage target user (for user management endpoints)
 */
export const canManageTargetUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ',
      error: 'Authentication required',
    });
    return;
  }

  try {
    const targetUserId = req.params.id || req.body.id;
    
    if (!targetUserId) {
      res.status(400).json({
        success: false,
        message: 'ไม่พบรหัสผู้ใช้งานที่ต้องการจัดการ',
        error: 'User ID required',
      });
      return;
    }

    // Superadmin can manage anyone
    if (req.user.userRoleId === config.constants.roleIds.SUPERADMIN) {
      next();
      return;
    }

    // Get target user info
    const targetUser = await prisma.user.findFirst({
      where: {
        id: targetUserId,
        isActive: true,
      },
    });

    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งานที่ต้องการจัดการ',
        error: 'User not found',
      });
      return;
    }

    // Admin can only manage Users (roleId > their roleId)
    if (req.user.userRoleId === config.constants.roleIds.ADMIN) {
      if (targetUser.userRoleId <= config.constants.roleIds.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'ไม่สามารถจัดการผู้ดูแลระบบหรือผู้ดูแลระบบหลักได้',
          error: 'Cannot manage admin or superadmin users',
        });
        return;
      }
    } else {
      // User role cannot manage anyone
      res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์จัดการผู้ใช้งานอื่น',
        error: 'User management not allowed',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Target user check error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
      error: 'Permission check failed',
    });
  }
};