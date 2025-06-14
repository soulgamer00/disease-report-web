// backend/src/routes/symptom.routes.ts

import { Router } from 'express';
import { SymptomController } from '../controllers/symptom.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isSuperadmin } from '../middleware/permission.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import {
  createSymptomSchema,
  updateSymptomSchema,
  symptomParamSchema,
  diseaseParamSchema,
} from '../schemas/symptom.schema';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   GET /api/symptoms/health
 * @desc    Symptom service health check
 * @access  Public
 */
router.get('/health', SymptomController.healthCheck);

/**
 * @route   GET /api/symptoms/statistics/summary
 * @desc    Get symptom statistics summary
 * @access  Public
 */
router.get('/statistics/summary', SymptomController.getSymptomStatistics);

/**
 * @route   GET /api/symptoms/disease/:diseaseId
 * @desc    Get symptoms by disease ID
 * @access  Public (for public reports)
 * @params  { diseaseId: string (UUID) }
 */
router.get(
  '/disease/:diseaseId',
  validateParams(diseaseParamSchema),
  SymptomController.getSymptomsByDiseaseId
);

/**
 * @route   GET /api/symptoms
 * @desc    Get list of symptoms with pagination and search
 * @access  Public (for public reports)
 * @query   { page?: number, limit?: number, search?: string, diseaseId?: string, sortBy?: string, sortOrder?: 'asc'|'desc', isActive?: boolean }
 */
router.get(
  '/',
  SymptomController.getSymptoms
);

/**
 * @route   GET /api/symptoms/:id
 * @desc    Get symptom by ID
 * @access  Public (for public reports)
 * @params  { id: string (UUID) }
 */
router.get(
  '/:id',
  validateParams(symptomParamSchema),
  SymptomController.getSymptomById
);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route   POST /api/symptoms
 * @desc    Create new symptom
 * @access  Private (Superadmin only)
 * @body    { diseaseId: string (UUID), name: string }
 */
router.post(
  '/',
  authenticateToken,
  isSuperadmin,
  validateBody(createSymptomSchema),
  SymptomController.createSymptom
);

/**
 * @route   PUT /api/symptoms/:id
 * @desc    Update existing symptom
 * @access  Private (Superadmin only)
 * @params  { id: string (UUID) }
 * @body    { diseaseId?: string (UUID), name?: string }
 */
router.put(
  '/:id',
  authenticateToken,
  isSuperadmin,
  validateParams(symptomParamSchema),
  validateBody(updateSymptomSchema),
  SymptomController.updateSymptom
);

/**
 * @route   DELETE /api/symptoms/:id
 * @desc    Soft delete symptom
 * @access  Private (Superadmin only)
 * @params  { id: string (UUID) }
 */
router.delete(
  '/:id',
  authenticateToken,
  isSuperadmin,
  validateParams(symptomParamSchema),
  SymptomController.deleteSymptom
);

export default router;