// backend/src/routes/user.routes.ts

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { 
  isAdmin, 
  isSuperadmin, 
  isUser, 
  canManageUsers,
  canManageTargetUser 
} from '../middleware/permission.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware';
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  adminChangePasswordSchema,
  userParamSchema,
  userQuerySchema, // ตรวจสอบว่ามี export ใน schema แล้ว
} from '../schemas/user.schema';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   GET /api/users/health
 * @desc    User service health check
 * @access  Public
 */
router.get('/health', UserController.healthCheck);

// ============================================
// PROTECTED ROUTES - USER MANAGEMENT (Admin+ only)
// ============================================

/**
 * @route   GET /api/users
 * @desc    Get list of users with pagination and search
 * @access  Private (Admin+ only)
 * @query   { page?: number, limit?: number, search?: string, userRoleId?: number, hospitalCode9eDigit?: string, sortBy?: string, sortOrder?: 'asc'|'desc', isActive?: boolean }
 * @permission Superadmin: All users, Admin: Only Users (roleId: 3)
 */
router.get(
  '/',
  authenticateToken,
  isAdmin,
  canManageUsers,
  validateQuery(userQuerySchema),
  UserController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin+ only)
 * @params  { id: string (UUID) }
 * @permission Superadmin: All users, Admin: Only Users (roleId: 3)
 */
router.get(
  '/:id',
  authenticateToken,
  isAdmin,
  canManageUsers,
  validateParams(userParamSchema),
  UserController.getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin+ only)
 * @body    { username: string, password: string, name: string, userRoleId: number, hospitalCode9eDigit?: string }
 * @permission Superadmin: Can create any role, Admin: Can create only Users (roleId: 3)
 */
router.post(
  '/',
  authenticateToken,
  isAdmin,
  canManageUsers,
  validateBody(createUserSchema),
  UserController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update existing user
 * @access  Private (Admin+ only)
 * @params  { id: string (UUID) }
 * @body    { username?: string, name?: string, userRoleId?: number, hospitalCode9eDigit?: string }
 * @permission Superadmin: Can update any user, Admin: Can update only Users (roleId: 3)
 */
router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  canManageUsers,
  canManageTargetUser,
  validateParams(userParamSchema),
  validateBody(updateUserSchema),
  UserController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user
 * @access  Private (Admin+ only)
 * @params  { id: string (UUID) }
 * @permission Superadmin: Can delete any user, Admin: Can delete only Users (roleId: 3)
 */
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  canManageUsers,
  canManageTargetUser,
  validateParams(userParamSchema),
  UserController.deleteUser
);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Admin change user password
 * @access  Private (Admin+ only)
 * @params  { id: string (UUID) }
 * @body    { newPassword: string, confirmPassword: string }
 * @permission Superadmin: Can change any user's password, Admin: Can change only Users' password (roleId: 3)
 */
router.put(
  '/:id/password',
  authenticateToken,
  isAdmin,
  canManageUsers,
  canManageTargetUser,
  validateParams(userParamSchema),
  validateBody(adminChangePasswordSchema),
  UserController.adminChangeUserPassword
);

// ============================================
// PROTECTED ROUTES - PROFILE MANAGEMENT (Any authenticated user)
// ============================================

/**
 * @route   GET /api/users/profile
 * @desc    Get own profile
 * @access  Private (Any authenticated user)
 */
router.get(
  '/profile',
  authenticateToken,
  isUser,
  UserController.getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile
 * @access  Private (Any authenticated user)
 * @body    { name?: string }
 */
router.put(
  '/profile',
  authenticateToken,
  isUser,
  validateBody(updateProfileSchema),
  UserController.updateProfile
);

/**
 * @route   PUT /api/users/profile/password
 * @desc    Change own password
 * @access  Private (Any authenticated user)
 * @body    { currentPassword: string, newPassword: string, confirmPassword: string }
 */
router.put(
  '/profile/password',
  authenticateToken,
  isUser,
  validateBody(changePasswordSchema),
  UserController.changePassword
);

// ============================================
// DEVELOPMENT & MONITORING ROUTES
// ============================================

/**
 * @route   GET /api/users/debug/permissions
 * @desc    Debug permission information (Development only)
 * @access  Private (Any authenticated user)
 */
router.get(
  '/debug/permissions',
  authenticateToken,
  (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      res.status(404).json({
        success: false,
        message: 'Route not available in production',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Debug user permission information',
      data: {
        user: req.user,
        permissions: {
          isSuperadmin: req.user?.userRoleId === 1,
          isAdmin: req.user?.userRoleId && req.user.userRoleId <= 2,
          isUser: req.user?.userRoleId && req.user.userRoleId <= 3,
          canManageUsers: req.user?.userRoleId && req.user.userRoleId <= 2,
          hospitalCode: req.user?.hospitalCode9eDigit,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
);

// ============================================
// ROUTE DOCUMENTATION
// ============================================

/**
 * @route   GET /api/users/docs
 * @desc    Get route documentation
 * @access  Public
 */
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'User Management API Documentation',
    data: {
      version: '1.0.0',
      description: 'User Management API with role-based access control',
      publicRoutes: [
        'GET /health - Health check',
        'GET /docs - API documentation',
      ],
      protectedRoutes: {
        userManagement: [
          'GET / - List users (Admin+)',
          'GET /:id - Get user by ID (Admin+)',
          'POST / - Create user (Admin+)',
          'PUT /:id - Update user (Admin+)',
          'DELETE /:id - Delete user (Admin+)',
          'PUT /:id/password - Admin change user password (Admin+)',
        ],
        profileManagement: [
          'GET /profile - Get own profile (User+)',
          'PUT /profile - Update own profile (User+)',
          'PUT /profile/password - Change own password (User+)',
        ],
        development: [
          'GET /debug/permissions - Debug permissions (Dev only)',
        ],
      },
      permissions: {
        'Superadmin (roleId: 1)': 'Full access to all users',
        'Admin (roleId: 2)': 'CRUD access to Users (roleId: 3) only',
        'User (roleId: 3)': 'Profile management and password change only',
      },
      dataFlow: {
        'User Management': 'Admin+ can manage users based on role hierarchy',
        'Profile Management': 'All users can manage their own profile',
        'Permission System': 'Role-based access control with hospital-level isolation',
      },
      security: {
        authentication: 'JWT tokens required for all protected routes',
        authorization: 'Role-based permissions with middleware validation',
        passwordSecurity: 'bcrypt hashing with salt rounds',
        softDelete: 'Users are soft deleted (isActive: false)',
      },
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;