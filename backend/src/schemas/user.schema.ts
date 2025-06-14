// backend/src/schemas/user.schema.ts

import { z } from 'zod';

// ============================================
// VALIDATION CONSTANTS
// ============================================

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Username validation regex
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

// ============================================
// REQUEST BODY SCHEMAS
// ============================================

// Create User Schema
export const createUserSchema = z.object({
  username: z.string()
    .min(1, 'ชื่อผู้ใช้จำเป็นต้องระบุ')
    .max(50, 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร')
    .regex(USERNAME_REGEX, 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข _ . - เท่านั้น'),
  password: z.string()
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .regex(PASSWORD_REGEX, 'รหัสผ่านต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ'),
  name: z.string()
    .min(1, 'ชื่อจำเป็นต้องระบุ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  userRoleId: z.number()
    .int('Role ID ต้องเป็นตัวเลขจำนวนเต็ม')
    .min(1, 'Role ID ต้องมีค่าอย่างน้อย 1')
    .max(3, 'Role ID ต้องไม่เกิน 3'),
  hospitalCode9eDigit: z.string()
    .length(9, 'รหัสโรงพยาบาลต้องเป็น 9 หลัก')
    .optional(),
});

// Update User Schema
export const updateUserSchema = z.object({
  username: z.string()
    .min(1, 'ชื่อผู้ใช้จำเป็นต้องระบุ')
    .max(50, 'ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร')
    .regex(USERNAME_REGEX, 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข _ . - เท่านั้น')
    .optional(),
  name: z.string()
    .min(1, 'ชื่อจำเป็นต้องระบุ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  userRoleId: z.number()
    .int('Role ID ต้องเป็นตัวเลขจำนวนเต็ม')
    .min(1, 'Role ID ต้องมีค่าอย่างน้อย 1')
    .max(3, 'Role ID ต้องไม่เกิน 3')
    .optional(),
  hospitalCode9eDigit: z.string()
    .length(9, 'รหัสโรงพยาบาลต้องเป็น 9 หลัก')
    .optional(),
});

// Update Profile Schema (for own profile)
export const updateProfileSchema = z.object({
  name: z.string()
    .min(1, 'ชื่อจำเป็นต้องระบุ')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'รหัสผ่านปัจจุบันจำเป็นต้องระบุ'),
  newPassword: z.string()
    .min(8, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
    .regex(PASSWORD_REGEX, 'รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ'),
  confirmPassword: z.string()
    .min(1, 'ยืนยันรหัสผ่านจำเป็นต้องระบุ'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

// Admin Change User Password Schema
export const adminChangePasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
    .regex(PASSWORD_REGEX, 'รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ'),
  confirmPassword: z.string()
    .min(1, 'ยืนยันรหัสผ่านจำเป็นต้องระบุ'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

// ============================================
// QUERY PARAMETER SCHEMAS
// ============================================

// User List Query Schema
export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  userRoleId: z.coerce.number().int().min(1).max(3).optional(),
  hospitalCode9eDigit: z.string().length(9).optional(),
  sortBy: z.enum(['createdAt', 'name', 'username', 'userRoleId']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ============================================
// URL PARAMETER SCHEMAS
// ============================================

// User ID Parameter Schema
export const userParamSchema = z.object({
  id: z.string().uuid('User ID ต้องเป็น UUID format'),
});

// ============================================
// RESPONSE DATA SCHEMAS
// ============================================

// User Info Schema (for responses)
export const userInfoSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  name: z.string(),
  userRole: z.enum(['SUPERADMIN', 'ADMIN', 'USER']),
  userRoleId: z.number().int(),
  hospitalCode9eDigit: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().nullable(),
  // Relations
  hospital: z.object({
    id: z.string().uuid(),
    hospitalName: z.string(),
    hospitalCode9eDigit: z.string(),
  }).nullable(),
});

// ============================================
// API RESPONSE SCHEMAS
// ============================================

// User List Response Schema
export const userListResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    users: z.array(userInfoSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
      hasNext: z.boolean(),
      hasPrevious: z.boolean(),
    }),
  }),
});

// User Detail Response Schema
export const userDetailResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    user: userInfoSchema,
  }),
});

// User Create/Update Response Schema
export const userCreateUpdateResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    user: userInfoSchema,
  }),
});

// User Delete Response Schema
export const userDeleteResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    deletedAt: z.date(),
  }),
});

// Password Change Response Schema
export const passwordChangeResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    changedAt: z.date(),
  }),
});

// ============================================
// ERROR RESPONSE SCHEMAS
// ============================================

// User Error Response Schema
export const userErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.string().optional(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
});

// ============================================
// TYPE EXPORTS (for TypeScript inference)
// ============================================

// Request Types
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type AdminChangePasswordRequest = z.infer<typeof adminChangePasswordSchema>;
export type UserQueryParams = z.infer<typeof userQuerySchema>;
export type UserParam = z.infer<typeof userParamSchema>;

// Response Types
export type UserInfo = z.infer<typeof userInfoSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
export type UserDetailResponse = z.infer<typeof userDetailResponseSchema>;
export type UserCreateUpdateResponse = z.infer<typeof userCreateUpdateResponseSchema>;
export type UserDeleteResponse = z.infer<typeof userDeleteResponseSchema>;
export type PasswordChangeResponse = z.infer<typeof passwordChangeResponseSchema>;
export type UserErrorResponse = z.infer<typeof userErrorResponseSchema>;

// Combined User Types for easier imports
export type UserRequestTypes = {
  create: CreateUserRequest;
  update: UpdateUserRequest;
  updateProfile: UpdateProfileRequest;
  changePassword: ChangePasswordRequest;
  adminChangePassword: AdminChangePasswordRequest;
  query: UserQueryParams;
  param: UserParam;
};

export type UserResponseTypes = {
  list: UserListResponse;
  detail: UserDetailResponse;
  create: UserCreateUpdateResponse;
  update: UserCreateUpdateResponse;
  delete: UserDeleteResponse;
  passwordChange: PasswordChangeResponse;
  error: UserErrorResponse;
};