// backend/src/schemas/auth.schema.ts

import { z } from 'zod';
import { UserRoleEnum } from '@prisma/client';

// ============================================
// AUTH REQUEST SCHEMAS
// ============================================

// Login Schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้')
    .max(50, 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข _ . - เท่านั้น'),
  password: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .max(100, 'รหัสผ่านต้องไม่เกิน 100 ตัวอักษร'),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
  newPassword: z
    .string()
    .min(8, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
    .max(100, 'รหัสผ่านใหม่ต้องไม่เกิน 100 ตัวอักษร')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลขอย่างน้อย 1 ตัว'
    ),
  confirmPassword: z
    .string()
    .min(1, 'กรุณายืนยันรหัสผ่านใหม่'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านใหม่และรหัสผ่านยืนยันไม่ตรงกัน',
  path: ['confirmPassword'],
});

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'กรุณาระบุ refresh token'),
});

// ============================================
// AUTH RESPONSE SCHEMAS
// ============================================

// User Info Schema (for responses)
export const userInfoSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  name: z.string(),
  userRole: z.nativeEnum(UserRoleEnum),
  userRoleId: z.number().int().min(1).max(3),
  hospitalCode9eDigit: z.string().nullable(),
  hospital: z.object({
    id: z.string().uuid(),
    hospitalName: z.string(),
    hospitalCode9eDigit: z.string(),
  }).nullable(),
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Login Response Schema
export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: userInfoSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.string(),
  }),
});

// Change Password Response Schema
export const changePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    updatedAt: z.date(),
  }),
});

// Refresh Token Response Schema
export const refreshTokenResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.string(),
  }),
});

// JWT Payload Schema (for token verification)
export const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  userRoleId: z.number().int().min(1).max(3),
  hospitalCode9eDigit: z.string().nullable(),
  iat: z.number(),
  exp: z.number(),
});

// ============================================
// ERROR RESPONSE SCHEMAS
// ============================================

// Auth Error Response Schema
export const authErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.string().optional(),
});

// ============================================
// TYPE EXPORTS (for TypeScript inference)
// ============================================

// Request Types
export type LoginRequest = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

// Response Types
export type UserInfo = z.infer<typeof userInfoSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
export type AuthErrorResponse = z.infer<typeof authErrorResponseSchema>;

// Combined Auth Types for easier imports
export type AuthRequestTypes = {
  login: LoginRequest;
  changePassword: ChangePasswordRequest;
  refreshToken: RefreshTokenRequest;
};

export type AuthResponseTypes = {
  login: LoginResponse;
  changePassword: ChangePasswordResponse;
  refreshToken: RefreshTokenResponse;
  error: AuthErrorResponse;
};