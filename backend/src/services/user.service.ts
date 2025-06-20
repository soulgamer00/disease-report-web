// backend/src/services/user.service.ts

import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { UserRoleEnum } from '@prisma/client';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AdminChangePasswordRequest,
  UserQueryParams,
} from '../schemas/user.schema';

// ============================================
// USER MANAGEMENT SERVICE
// ============================================

export class UserService {
  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Map userRoleId to UserRoleEnum
   */
  private static getUserRoleFromId(roleId: number): UserRoleEnum {
    const roleMap: Record<number, UserRoleEnum> = {
      1: UserRoleEnum.SUPERADMIN,
      2: UserRoleEnum.ADMIN,
      3: UserRoleEnum.USER,
    };

    const role = roleMap[roleId];
    if (!role) {
      throw new Error('Role ID ไม่ถูกต้อง');
    }
    return role;
  }

  /**
   * Hash password using consistent salt rounds from config
   */
  private static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, config.security.bcryptRounds);
  }

  // ============================================
  // CREATE USER
  // ============================================
  
  static async createUser(data: CreateUserRequest): Promise<{
    id: string;
    username: string;
    name: string;
    userRole: UserRoleEnum;
    userRoleId: number;
    hospitalCode9eDigit: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    hospital: {
      id: string;
      hospitalName: string;
      hospitalCode9eDigit: string;
    } | null;
  }> {
    // Use transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Check if username already exists
      const existingUser = await tx.user.findFirst({
        where: {
          username: data.username,
          isActive: true,
        },
      });

      if (existingUser) {
        throw new Error('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
      }

      // Check if hospital exists (if provided)
      if (data.hospitalCode9eDigit) {
        const hospital = await tx.hospital.findFirst({
          where: {
            hospitalCode9eDigit: data.hospitalCode9eDigit,
            isActive: true,
          },
        });

        if (!hospital) {
          throw new Error('ไม่พบโรงพยาบาลที่ระบุ');
        }
      }

      // Hash password using consistent method
      const hashedPassword = await this.hashPassword(data.password);

      // Get user role from roleId
      const userRole = this.getUserRoleFromId(data.userRoleId);

      // Create user
      const newUser = await tx.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          name: data.name,
          userRole,
          userRoleId: data.userRoleId,
          hospitalCode9eDigit: data.hospitalCode9eDigit || null,
        },
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              hospitalCode9eDigit: true,
            },
          },
        },
      });

      return newUser;
    });
  }

  // ============================================
  // GET USER LIST
  // ============================================
  
  static async getUsers(
    queryParams: UserQueryParams,
    currentUser: { userRoleId: number; hospitalCode9eDigit?: string | null }
  ): Promise<{
    users: Array<{
      id: string;
      username: string;
      name: string;
      userRole: UserRoleEnum;
      userRoleId: number;
      hospitalCode9eDigit: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      lastLoginAt: Date | null;
      hospital: {
        id: string;
        hospitalName: string;
        hospitalCode9eDigit: string;
      } | null;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const {
      page = config.constants.pagination.defaultPage,
      limit = config.constants.pagination.defaultLimit,
      search,
      userRoleId,
      hospitalCode9eDigit,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive = true,
    } = queryParams;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {
      isActive,
    };

    // Permission-based filtering
    if (currentUser.userRoleId === config.constants.roleIds.ADMIN) {
      // Admin can only see Users (roleId: 3)
      where.userRoleId = config.constants.roleIds.USER;
      // Admin can only see users from their hospital
      if (currentUser.hospitalCode9eDigit) {
        where.hospitalCode9eDigit = currentUser.hospitalCode9eDigit;
      }
    }

    // Apply filters
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (userRoleId) {
      where.userRoleId = userRoleId;
    }

    if (hospitalCode9eDigit) {
      where.hospitalCode9eDigit = hospitalCode9eDigit;
    }

    // Execute queries
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              hospitalCode9eDigit: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  // ============================================
  // GET USER BY ID
  // ============================================
  
  static async getUserById(
    userId: string,
    currentUser: { userRoleId: number; id?: string }
  ): Promise<{
    id: string;
    username: string;
    name: string;
    userRole: UserRoleEnum;
    userRoleId: number;
    hospitalCode9eDigit: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    hospital: {
      id: string;
      hospitalName: string;
      hospitalCode9eDigit: string;
    } | null;
  }> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
      include: {
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
      throw new Error('ไม่พบผู้ใช้งานที่ระบุ');
    }

    // Permission check
    if (currentUser.userRoleId === config.constants.roleIds.ADMIN) {
      // Admin can only see Users (roleId: 3)
      if (user.userRoleId <= config.constants.roleIds.ADMIN) {
        throw new Error('ไม่มีสิทธิ์ดูข้อมูลผู้ดูแลระบบ');
      }
    } else if (currentUser.userRoleId === config.constants.roleIds.USER) {
      // User can only see themselves
      if (user.id !== currentUser.id) {
        throw new Error('ไม่มีสิทธิ์ดูข้อมูลผู้ใช้งานอื่น');
      }
    }

    return user;
  }

  // ============================================
  // UPDATE USER
  // ============================================
  
  static async updateUser(
    userId: string,
    data: UpdateUserRequest,
    currentUser: { userRoleId: number }
  ): Promise<{
    id: string;
    username: string;
    name: string;
    userRole: UserRoleEnum;
    userRoleId: number;
    hospitalCode9eDigit: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    hospital: {
      id: string;
      hospitalName: string;
      hospitalCode9eDigit: string;
    } | null;
  }> {
    // Use transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Check if user exists
      const existingUser = await tx.user.findFirst({
        where: {
          id: userId,
          isActive: true,
        },
      });

      if (!existingUser) {
        throw new Error('ไม่พบผู้ใช้งานที่ระบุ');
      }

      // Permission check
      if (currentUser.userRoleId === config.constants.roleIds.ADMIN) {
        // Admin can only update Users (roleId: 3)
        if (existingUser.userRoleId <= config.constants.roleIds.ADMIN) {
          throw new Error('ไม่สามารถแก้ไขข้อมูลผู้ดูแลระบบได้');
        }
      } else if (currentUser.userRoleId === config.constants.roleIds.USER) {
        throw new Error('ไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้งาน');
      }

      // Check username uniqueness (if changing)
      if (data.username && data.username !== existingUser.username) {
        const duplicateUser = await tx.user.findFirst({
          where: {
            username: data.username,
            isActive: true,
            id: { not: userId },
          },
        });

        if (duplicateUser) {
          throw new Error('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
        }
      }

      // Check hospital exists (if provided)
      if (data.hospitalCode9eDigit) {
        const hospital = await tx.hospital.findFirst({
          where: {
            hospitalCode9eDigit: data.hospitalCode9eDigit,
            isActive: true,
          },
        });

        if (!hospital) {
          throw new Error('ไม่พบโรงพยาบาลที่ระบุ');
        }
      }

      // Get user role from roleId (if changing role)
      let userRole: UserRoleEnum | undefined;
      if (data.userRoleId) {
        userRole = this.getUserRoleFromId(data.userRoleId);
      }

      // Update user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          ...(data.username && { username: data.username }),
          ...(data.name && { name: data.name }),
          ...(userRole && { userRole }),
          ...(data.userRoleId && { userRoleId: data.userRoleId }),
          ...(data.hospitalCode9eDigit !== undefined && { 
            hospitalCode9eDigit: data.hospitalCode9eDigit || null 
          }),
        },
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              hospitalCode9eDigit: true,
            },
          },
        },
      });

      return updatedUser;
    });
  }

  // ============================================
  // UPDATE PROFILE (Own Profile)
  // ============================================
  
  static async updateProfile(
    userId: string,
    data: UpdateProfileRequest
  ): Promise<{
    id: string;
    username: string;
    name: string;
    userRole: UserRoleEnum;
    userRoleId: number;
    hospitalCode9eDigit: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    hospital: {
      id: string;
      hospitalName: string;
      hospitalCode9eDigit: string;
    } | null;
  }> {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
    });

    if (!existingUser) {
      throw new Error('ไม่พบผู้ใช้งาน');
    }

    // Update profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
      },
      include: {
        hospital: {
          select: {
            id: true,
            hospitalName: true,
            hospitalCode9eDigit: true,
          },
        },
      },
    });

    return updatedUser;
  }

  // ============================================
  // DELETE USER (Soft Delete)
  // ============================================
  
  static async deleteUser(
    userId: string,
    currentUser: { userRoleId: number }
  ): Promise<{ deletedAt: Date }> {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
    });

    if (!existingUser) {
      throw new Error('ไม่พบผู้ใช้งานที่ระบุ');
    }

    // Permission check
    if (currentUser.userRoleId === config.constants.roleIds.ADMIN) {
      // Admin can only delete Users (roleId: 3)
      if (existingUser.userRoleId <= config.constants.roleIds.ADMIN) {
        throw new Error('ไม่สามารถลบผู้ดูแลระบบได้');
      }
    } else if (currentUser.userRoleId === config.constants.roleIds.USER) {
      throw new Error('ไม่มีสิทธิ์ลบผู้ใช้งาน');
    }

    // Soft delete user
    const deletedAt = new Date();
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: deletedAt,
      },
    });

    return { deletedAt };
  }

  // ============================================
  // CHANGE PASSWORD
  // ============================================
  
  static async changePassword(
    userId: string,
    data: ChangePasswordRequest
  ): Promise<{ changedAt: Date }> {
    // Get user with password
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('ไม่พบผู้ใช้งาน');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
    if (isSamePassword) {
      throw new Error('รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน');
    }

    // Hash new password using consistent method
    const hashedNewPassword = await this.hashPassword(data.newPassword);

    // Update password
    const changedAt = new Date();
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: changedAt,
      },
    });

    return { changedAt };
  }

  // ============================================
  // ADMIN CHANGE USER PASSWORD
  // ============================================
  
  static async adminChangeUserPassword(
    userId: string,
    data: AdminChangePasswordRequest,
    currentUser: { userRoleId: number }
  ): Promise<{ changedAt: Date }> {
    // Check if target user exists
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
    });

    if (!targetUser) {
      throw new Error('ไม่พบผู้ใช้งานที่ระบุ');
    }

    // Permission check
    if (currentUser.userRoleId === config.constants.roleIds.ADMIN) {
      // Admin can only change password for Users (roleId: 3)
      if (targetUser.userRoleId <= config.constants.roleIds.ADMIN) {
        throw new Error('ไม่สามารถเปลี่ยนรหัสผ่านผู้ดูแลระบบได้');
      }
    } else if (currentUser.userRoleId === config.constants.roleIds.USER) {
      throw new Error('ไม่มีสิทธิ์เปลี่ยนรหัสผ่านผู้ใช้งานอื่น');
    }

    // Hash new password using consistent method
    const hashedNewPassword = await this.hashPassword(data.newPassword);

    // Update password
    const changedAt = new Date();
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: changedAt,
      },
    });

    return { changedAt };
  }
}