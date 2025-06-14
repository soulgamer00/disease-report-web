// backend/src/services/auth.service.ts

import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../middleware/auth.middleware';
import { 
  LoginRequest, 
  ChangePasswordRequest, 
  RefreshTokenRequest,
  UserInfo,
  JwtPayload 
} from '../schemas/auth.schema';

// ============================================
// AUTH SERVICE CLASS
// ============================================

export class AuthService {
  
  // ============================================
  // LOGIN SERVICE
  // ============================================
  
  static async login(loginData: LoginRequest): Promise<{
    user: UserInfo;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    const { username, password } = loginData;

    // Find user with hospital relation
    const user = await prisma.user.findFirst({
      where: {
        username,
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
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      userRoleId: user.userRoleId,
      hospitalCode9eDigit: user.hospitalCode9eDigit,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Prepare user info for response
    const userInfo: UserInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      userRole: user.userRole,
      userRoleId: user.userRoleId,
      hospitalCode9eDigit: user.hospitalCode9eDigit,
      hospital: user.hospital,
      lastLoginAt: new Date(), // Updated timestamp
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: userInfo,
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  // ============================================
  // CHANGE PASSWORD SERVICE
  // ============================================
  
  static async changePassword(
    userId: string,
    changePasswordData: ChangePasswordRequest
  ): Promise<{ updatedAt: Date }> {
    const { currentPassword, newPassword } = changePasswordData;

    // Find user
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
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new Error('รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      updatedAt: updatedUser.updatedAt,
    };
  }

  // ============================================
  // REFRESH TOKEN SERVICE
  // ============================================
  
  static async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }> {
    const { refreshToken } = refreshTokenData;

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Check if user still exists and is active
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          isActive: true,
        },
      });

      if (!user) {
        throw new Error('ไม่พบผู้ใช้งาน หรือบัญชีถูกปิดใช้งาน');
      }

      // Generate new tokens
      const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        userId: user.id,
        username: user.username,
        userRoleId: user.userRoleId,
        hospitalCode9eDigit: user.hospitalCode9eDigit,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: config.jwt.expiresIn,
      };
    } catch (error) {
      throw new Error('Refresh token ไม่ถูกต้องหรือหมดอายุ');
    }
  }

  // ============================================
  // USER PROFILE SERVICE
  // ============================================
  
  static async getUserProfile(userId: string): Promise<UserInfo> {
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
      throw new Error('ไม่พบผู้ใช้งาน');
    }

    const userInfo: UserInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      userRole: user.userRole,
      userRoleId: user.userRoleId,
      hospitalCode9eDigit: user.hospitalCode9eDigit,
      hospital: user.hospital,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userInfo;
  }

  // ============================================
  // LOGOUT SERVICE (Optional - for token blacklisting)
  // ============================================
  
  static async logout(userId: string): Promise<{ message: string }> {
    // In a more complex system, you might want to blacklist tokens
    // For now, we'll just return a success message
    // The actual logout will be handled by removing tokens from the client
    
    // Optionally update lastLoginAt or add logout timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });

    return {
      message: 'ออกจากระบบเรียบร้อยแล้ว',
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  
  static async validateUserExists(userId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
    });

    return !!user;
  }

  static async validateUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        isActive: true,
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
    });

    return !existingUser;
  }
}