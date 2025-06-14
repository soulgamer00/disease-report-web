// backend/src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AdminChangePasswordRequest,
  UserQueryParams,
} from '../schemas/user.schema';

// ============================================
// USER CONTROLLER CLASS
// ============================================

export class UserController {
  // ============================================
  // HEALTH CHECK
  // ============================================
  
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'User service is healthy',
        data: {
          service: 'user-management',
          status: 'active',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('User health check error:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ User service',
        error: 'Health check failed',
      });
    }
  }

  // ============================================
  // GET USER LIST
  // ============================================
  
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const queryParams = req.query as unknown as UserQueryParams;
      
      const result = await UserService.getUsers(queryParams, {
        userRoleId: req.user.userRoleId,
        hospitalCode9eDigit: req.user.hospitalCode9eDigit,
      });

      res.status(200).json({
        success: true,
        message: 'ดึงรายการผู้ใช้งานสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get users error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงรายการผู้ใช้งาน';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Get users failed',
      });
    }
  }

  // ============================================
  // GET USER BY ID
  // ============================================
  
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      
      const user = await UserService.getUserById(id, {
        userRoleId: req.user.userRoleId,
        id: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ใช้งานสำเร็จ',
        data: {
          user,
        },
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน';
      
      // Check for permission or not found errors
      if (errorMessage.includes('ไม่พบผู้ใช้งาน')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'User not found',
        });
      } else if (errorMessage.includes('ไม่มีสิทธิ์')) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          error: 'Permission denied',
        });
      } else {
        res.status(500).json({
          success: false,
          message: errorMessage,
          error: 'Get user failed',
        });
      }
    }
  }

  // ============================================
  // CREATE USER
  // ============================================
  
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กرุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const userData = req.body as CreateUserRequest;
      
      const newUser = await UserService.createUser(userData);

      res.status(201).json({
        success: true,
        message: 'สร้างผู้ใช้งานสำเร็จ',
        data: {
          user: newUser,
        },
      });
    } catch (error) {
      console.error('Create user error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน';
      
      // Check for duplicate username or invalid data
      if (errorMessage.includes('มีอยู่ในระบบแล้ว')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Username already exists',
        });
      } else if (errorMessage.includes('ไม่พบโรงพยาบาล')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'Hospital not found',
        });
      } else {
        res.status(500).json({
          success: false,
          message: errorMessage,
          error: 'Create user failed',
        });
      }
    }
  }

  // ============================================
  // UPDATE USER
  // ============================================
  
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const updateData = req.body as UpdateUserRequest;
      
      const updatedUser = await UserService.updateUser(id, updateData, {
        userRoleId: req.user.userRoleId,
      });

      res.status(200).json({
        success: true,
        message: 'อัปเดตข้อมูลผู้ใช้งานสำเร็จ',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Update user error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้งาน';
      
      // Check for various error types
      if (errorMessage.includes('ไม่พบผู้ใช้งาน')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'User not found',
        });
      } else if (errorMessage.includes('ไม่มีสิทธิ์') || errorMessage.includes('ไม่สามารถแก้ไข')) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          error: 'Permission denied',
        });
      } else if (errorMessage.includes('มีอยู่ในระบบแล้ว')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Username already exists',
        });
      } else if (errorMessage.includes('ไม่พบโรงพยาบาล')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'Hospital not found',
        });
      } else {
        res.status(500).json({
          success: false,
          message: errorMessage,
          error: 'Update user failed',
        });
      }
    }
  }

  // ============================================
  // DELETE USER (Soft Delete)
  // ============================================
  
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      
      const result = await UserService.deleteUser(id, {
        userRoleId: req.user.userRoleId,
      });

      res.status(200).json({
        success: true,
        message: 'ลบผู้ใช้งานสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Delete user error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน';
      
      // Check for various error types
      if (errorMessage.includes('ไม่พบผู้ใช้งาน')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'User not found',
        });
      } else if (errorMessage.includes('ไม่มีสิทธิ์') || errorMessage.includes('ไม่สามารถลบ')) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          error: 'Permission denied',
        });
      } else {
        res.status(500).json({
          success: false,
          message: errorMessage,
          error: 'Delete user failed',
        });
      }
    }
  }

  // ============================================
  // GET PROFILE (Own Profile)
  // ============================================
  
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const user = await UserService.getUserById(req.user.id, {
        userRoleId: req.user.userRoleId,
        id: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
        data: {
          user,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Get profile failed',
      });
    }
  }

  // ============================================
  // UPDATE PROFILE (Own Profile)
  // ============================================
  
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const updateData = req.body as UpdateProfileRequest;
      
      const updatedUser = await UserService.updateProfile(req.user.id, updateData);

      res.status(200).json({
        success: true,
        message: 'อัปเดตโปรไฟล์สำเร็จ',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Update profile failed',
      });
    }
  }

  // ============================================
  // CHANGE PASSWORD (Own Password)
  // ============================================
  
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const passwordData = req.body as ChangePasswordRequest;
      
      const result = await UserService.changePassword(req.user.id, passwordData);

      res.status(200).json({
        success: true,
        message: 'เปลี่ยนรหัสผ่านสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Change password error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
      
      // Check for invalid current password
      if (errorMessage.includes('รหัสผ่านปัจจุบันไม่ถูกต้อง')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'Invalid current password',
        });
      } else {
        res.status(500).json({
          success: false,
          message: errorMessage,
          error: 'Change password failed',
        });
      }
    }
  }

  // ============================================
  // ADMIN CHANGE USER PASSWORD
  // ============================================
  
  static async adminChangeUserPassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;
      const passwordData = req.body as AdminChangePasswordRequest;
      
      const result = await UserService.adminChangeUserPassword(id, passwordData, {
        userRoleId: req.user.userRoleId,
      });

      res.status(200).json({
        success: true,
        message: 'เปลี่ยนรหัสผ่านผู้ใช้งานสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Admin change user password error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่านผู้ใช้งาน';
      
      // Check for various error types
      if (errorMessage.includes('ไม่พบผู้ใช้งาน')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'User not found',
        });
      } else if (errorMessage.includes('ไม่มีสิทธิ์') || errorMessage.includes('ไม่สามารถเปลี่ยนรหัสผ่าน')) {
        res.status(403).json({
          success: false,
          message: errorMessage,
          error: 'Permission denied',
        });
      } else {
        res.status(500).json({
          success: false,
          message: errorMessage,
          error: 'Admin change password failed',
        });
      }
    }
  }
}