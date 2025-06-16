// backend/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { 
  loginSchema, 
  changePasswordSchema, 
  refreshTokenSchema,
  LoginRequest,
  ChangePasswordRequest,
  RefreshTokenRequest
} from '../schemas/auth.schema';
import { config } from '../config';

// ============================================
// AUTH CONTROLLER CLASS
// ============================================

export class AuthController {

  // ============================================
  // LOGIN ENDPOINT
  // ============================================
  
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData: LoginRequest = loginSchema.parse(req.body);

      // Call auth service
      const result = await AuthService.login(validatedData);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.server.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: config.cookie.maxAge,
      });

      // Set access token as httpOnly cookie
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: config.server.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes (same as JWT expiry)
      });

      // Return success response (WITHOUT tokens in body)
      res.status(200).json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        data: {
          user: result.user,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error instanceof Error ? 
        error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Login failed',
      });
    }
  }

  // ============================================
  // CHANGE PASSWORD ENDPOINT
  // ============================================
  
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      // Validate request body
      const validatedData: ChangePasswordRequest = changePasswordSchema.parse(req.body);

      // Call auth service
      const result = await AuthService.changePassword(req.user.id, validatedData);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'เปลี่ยนรหัสผ่านสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Change password error:', error);
      
      const errorMessage = error instanceof Error ? 
        error.message : 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Password change failed',
      });
    }
  }

  // ============================================
  // REFRESH TOKEN ENDPOINT
  // ============================================
  
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookies only (not from request body)
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'ไม่พบ refresh token',
          error: 'Refresh token required',
        });
        return;
      }

      // Validate refresh token
      const validatedData: RefreshTokenRequest = refreshTokenSchema.parse({
        refreshToken,
      });

      // Call auth service
      const result = await AuthService.refreshToken(validatedData);

      // Update cookies with new tokens
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: config.server.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: config.cookie.maxAge,
      });

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: config.server.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      // Return success response (WITHOUT tokens in body)
      res.status(200).json({
        success: true,
        message: 'ต่ออายุ token สำเร็จ',
        data: {
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      
      const errorMessage = error instanceof Error ? 
        error.message : 'เกิดข้อผิดพลาดในการต่ออายุ token';
      
      res.status(401).json({
        success: false,
        message: errorMessage,
        error: 'Token refresh failed',
      });
    }
  }

  // ============================================
  // GET PROFILE ENDPOINT
  // ============================================
  
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      // Call auth service
      const userProfile = await AuthService.getUserProfile(req.user.id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
        data: {
          user: userProfile,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      
      const errorMessage = error instanceof Error ? 
        error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Profile fetch failed',
      });
    }
  }

  // ============================================
  // LOGOUT ENDPOINT
  // ============================================
  
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear cookies
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: config.server.nodeEnv === 'production',
        sameSite: 'strict',
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config.server.nodeEnv === 'production',
        sameSite: 'strict',
      });

      // If user is authenticated, call logout service
      if (req.user) {
        await AuthService.logout(req.user.id);
      }

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ออกจากระบบสำเร็จ',
        data: {
          loggedOut: true,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout service fails, we should clear cookies and return success
      res.status(200).json({
        success: true,
        message: 'ออกจากระบบสำเร็จ',
        data: {
          loggedOut: true,
        },
      });
    }
  }

  // ============================================
  // VERIFY TOKEN ENDPOINT (for frontend to check auth status)
  // ============================================
  
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      // If middleware passed, user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Token ไม่ถูกต้อง',
          error: 'Invalid token',
        });
        return;
      }

      // Get user profile
      const userProfile = await AuthService.getUserProfile(req.user.id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Token ถูกต้อง',
        data: {
          user: userProfile,
          authenticated: true,
        },
      });
    } catch (error) {
      console.error('Verify token error:', error);
      
      res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้อง',
        error: 'Invalid token',
      });
    }
  }
}