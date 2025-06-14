// backend/src/routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 * @body    { username: string, password: string }
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken?: string } (optional if using cookies)
 */
router.post('/refresh', AuthController.refreshToken);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @body    { currentPassword: string, newPassword: string, confirmPassword: string }
 */
router.post('/change-password', authenticateToken, AuthController.changePassword);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear cookies)
 * @access  Private (but works without auth too)
 */
router.post('/logout', optionalAuth, AuthController.logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token validity and get user info
 * @access  Private
 */
router.get('/verify', authenticateToken, AuthController.verifyToken);

// ============================================
// HEALTH CHECK ROUTE
// ============================================

/**
 * @route   GET /api/auth/health
 * @desc    Auth service health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/login - User login',
      'POST /api/auth/refresh - Refresh access token',
      'POST /api/auth/change-password - Change password (Protected)',
      'GET /api/auth/profile - Get user profile (Protected)',
      'POST /api/auth/logout - Logout user',
      'GET /api/auth/verify - Verify token (Protected)',
    ],
  });
});

export default router;