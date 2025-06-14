// backend/src/routes/disease.routes.ts

import { Router } from 'express';
import { DiseaseController } from '../controllers/disease.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { isSuperadmin } from '../middleware/permission.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import {
  createDiseaseSchema,
  updateDiseaseSchema,
  diseaseParamSchema,
} from '../schemas/disease.schema';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   GET /api/diseases/health
 * @desc    Disease service health check
 * @access  Public
 */
router.get('/health', DiseaseController.healthCheck);

/**
 * @route   GET /api/diseases/statistics/summary
 * @desc    Get disease statistics summary
 * @access  Public
 */
router.get('/statistics/summary', DiseaseController.getDiseaseStatistics);

/**
 * @route   GET /api/diseases
 * @desc    Get list of diseases with pagination and search
 * @access  Public (for public reports)
 * @query   { page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc'|'desc', isActive?: boolean }
 */
router.get(
  '/',
  DiseaseController.getDiseases
);

/**
 * @route   GET /api/diseases/:id
 * @desc    Get disease by ID with optional symptoms
 * @access  Public (for public reports)
 * @params  { id: string (UUID) }
 * @query   { includeSymptoms?: boolean }
 */
router.get(
  '/:id',
  validateParams(diseaseParamSchema),
  DiseaseController.getDiseaseById
);

/**
 * @route   GET /api/diseases/:id/symptoms
 * @desc    Get symptoms for specific disease
 * @access  Public (for public reports)
 * @params  { id: string (UUID) }
 */
router.get(
  '/:id/symptoms',
  validateParams(diseaseParamSchema),
  DiseaseController.getDiseaseSymptoms
);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route   POST /api/diseases
 * @desc    Create new disease
 * @access  Private (Superadmin only)
 * @body    { engName: string, thaiName: string, shortName: string, details?: string }
 */
router.post(
  '/',
  authenticateToken,
  isSuperadmin,
  validateBody(createDiseaseSchema),
  DiseaseController.createDisease
);

/**
 * @route   PUT /api/diseases/:id
 * @desc    Update existing disease
 * @access  Private (Superadmin only)
 * @params  { id: string (UUID) }
 * @body    { engName?: string, thaiName?: string, shortName?: string, details?: string }
 */
router.put(
  '/:id',
  authenticateToken,
  isSuperadmin,
  validateParams(diseaseParamSchema),
  validateBody(updateDiseaseSchema),
  DiseaseController.updateDisease
);

/**
 * @route   DELETE /api/diseases/:id
 * @desc    Soft delete disease
 * @access  Private (Superadmin only)
 * @params  { id: string (UUID) }
 */
router.delete(
  '/:id',
  authenticateToken,
  isSuperadmin,
  validateParams(diseaseParamSchema),
  DiseaseController.deleteDisease
);

// ============================================
// HEALTH CHECK ROUTE
// ============================================

// Routes moved to top

export default router;