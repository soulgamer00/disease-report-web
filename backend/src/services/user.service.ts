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
    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
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
      const hospital = await prisma.hospital.findFirst({
        where: {
          hospitalCode9eDigit: data.hospitalCode9eDigit,
          isActive: true,
        },
      });

      if (!hospital) {
        throw new Error('ไม่พบโรงพยาบาลที่ระบุ');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // Map userRoleId to UserRoleEnum
    const userRoleMap: Record<number, UserRoleEnum> = {
      1: UserRoleEnum.SUPERADMIN,
      2: UserRoleEnum.ADMIN,
      3: UserRoleEnum.USER,
    };

    const userRole = userRoleMap[data.userRoleId];
    if (!userRole) {
      throw new Error('Role ID ไม่ถูกต้อง');
    }

    // Create user
    const newUser = await prisma.user.create({
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
    const page = queryParams.page || 1;
    const limit = Math.min(queryParams.limit || 20, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: queryParams.isActive !== undefined ? queryParams.isActive : true,
    };

    // Permission-based filtering
    if (currentUser.userRoleId === config.constants.roleIds.ADMIN) {
      // Admin can only see Users (roleId: 3)
      where.userRoleId = config.constants.roleIds.USER;
    } else if (currentUser.userRoleId === config.constants.roleIds.USER) {
      // User can only see themselves
      throw new Error('ไม่มีสิทธิ์ดูรายการผู้ใช้งาน');
    }

    // Search filter
    if (queryParams.search) {
      where.OR = [
        { username: { contains: queryParams.search, mode: 'insensitive' } },
        { name: { contains: queryParams.search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (queryParams.userRoleId) {
      where.userRoleId = queryParams.userRoleId;
    }

    // Hospital filter
    if (queryParams.hospitalCode9eDigit) {
      where.hospitalCode9eDigit = queryParams.hospitalCode9eDigit;
    }

    // Build orderBy
    const orderBy: any = {};
    if (queryParams.sortBy) {
      orderBy[queryParams.sortBy] = queryParams.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc'; // Default sort
    }

    // Execute queries
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              hospitalCode9eDigit: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate pagination
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
    currentUser: { userRoleId: number; id: string }
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
      // Admin can only update Users (roleId: 3)
      if (existingUser.userRoleId <= config.constants.roleIds.ADMIN) {
        throw new Error('ไม่สามารถแก้ไขข้อมูลผู้ดูแลระบบได้');
      }
    } else if (currentUser.userRoleId === config.constants.roleIds.USER) {
      throw new Error('ไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้งาน');
    }

    // Check username uniqueness (if changing)
    if (data.username && data.username !== existingUser.username) {
      const duplicateUser = await prisma.user.findFirst({
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
      const hospital = await prisma.hospital.findFirst({
        where: {
          hospitalCode9eDigit: data.hospitalCode9eDigit,
          isActive: true,
        },
      });

      if (!hospital) {
        throw new Error('ไม่พบโรงพยาบาลที่ระบุ');
      }
    }

    // Map userRoleId to UserRoleEnum (if changing role)
    let userRole: UserRoleEnum | undefined;
    if (data.userRoleId) {
      const userRoleMap: Record<number, UserRoleEnum> = {
        1: UserRoleEnum.SUPERADMIN,
        2: UserRoleEnum.ADMIN,
        3: UserRoleEnum.USER,
      };

      userRole = userRoleMap[data.userRoleId];
      if (!userRole) {
        throw new Error('Role ID ไม่ถูกต้อง');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
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

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(data.newPassword, saltRounds);

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

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(data.newPassword, saltRounds);

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