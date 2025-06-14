// backend/src/routes/population.routes.ts

import { Router } from 'express';
import { PopulationController } from '../controllers/population.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isAdmin, isSuperadmin, canAccessHospitalData, addHospitalFilter } from '../middleware/permission.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import {
  createPopulationSchema,
  updatePopulationSchema,
  populationParamSchema,
  hospitalCodeParamSchema,
  yearParamSchema,
} from '../schemas/population.schema';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   GET /api/populations/health
 * @desc    Population service health check
 * @access  Public
 */
router.get('/health', PopulationController.healthCheck);

/**
 * @route   GET /api/populations/statistics/summary
 * @desc    Get population statistics summary
 * @access  Public
 */
router.get('/statistics/summary', PopulationController.getPopulationStatistics);

/**
 * @route   GET /api/populations/trends
 * @desc    Get population trends and growth data
 * @access  Public
 * @query   { hospitalCode?: string }
 */
router.get('/trends', PopulationController.getPopulationTrends);

/**
 * @route   GET /api/populations/hospital/:code
 * @desc    Get populations by hospital code
 * @access  Public (for public reports)
 * @params  { code: string (Hospital Code 9 digits new format) }
 */
router.get(
  '/hospital/:code',
  validateParams(hospitalCodeParamSchema),
  PopulationController.getPopulationsByHospitalCode
);

/**
 * @route   GET /api/populations/year/:year
 * @desc    Get populations by year
 * @access  Public (for public reports)
 * @params  { year: number }
 */
router.get(
  '/year/:year',
  validateParams(yearParamSchema),
  PopulationController.getPopulationsByYear
);

/**
 * @route   GET /api/populations
 * @desc    Get list of populations with pagination and search
 * @access  Public (for public reports)
 * @query   { page?: number, limit?: number, search?: string, year?: number, hospitalCode9eDigit?: string, startYear?: number, endYear?: number, sortBy?: string, sortOrder?: 'asc'|'desc', isActive?: boolean }
 */
router.get(
  '/',
  PopulationController.getPopulations
);

/**
 * @route   GET /api/populations/:id
 * @desc    Get population by ID
 * @access  Public (for public reports)
 * @params  { id: string (UUID) }
 */
router.get(
  '/:id',
  validateParams(populationParamSchema),
  PopulationController.getPopulationById
);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route   POST /api/populations
 * @desc    Create new population record
 * @access  Private (Admin+ only)
 * @body    { year: number, hospitalCode9eDigit: string, count: number }
 * @permission Superadmin: All hospitals, Admin: Own hospital only
 */
router.post(
  '/',
  authenticateToken,
  isAdmin,
  canAccessHospitalData,
  validateBody(createPopulationSchema),
  // Note: Hospital filtering for Admin users should be handled in middleware or service
  PopulationController.createPopulation
);

/**
 * @route   PUT /api/populations/:id
 * @desc    Update existing population record
 * @access  Private (Admin+ only)
 * @params  { id: string (UUID) }
 * @body    { year?: number, hospitalCode9eDigit?: string, count?: number }
 * @permission Superadmin: All hospitals, Admin: Own hospital only
 */
router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  canAccessHospitalData,
  validateParams(populationParamSchema),
  validateBody(updatePopulationSchema),
  PopulationController.updatePopulation
);

/**
 * @route   DELETE /api/populations/:id
 * @desc    Soft delete population record
 * @access  Private (Admin+ only)
 * @params  { id: string (UUID) }
 * @permission Superadmin: All hospitals, Admin: Own hospital only
 */
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  canAccessHospitalData,
  validateParams(populationParamSchema),
  PopulationController.deletePopulation
);

// ============================================
// SUPERADMIN ONLY ROUTES
// ============================================

/**
 * @route   POST /api/populations/batch
 * @desc    Batch create population records (future feature)
 * @access  Private (Superadmin only)
 * @body    { populations: Array<{ year: number, hospitalCode9eDigit: string, count: number }> }
 */
// router.post(
//   '/batch',
//   authenticateToken,
//   isSuperadmin,
//   // validateBody(batchCreatePopulationSchema),
//   // PopulationController.batchCreatePopulations
// );

/**
 * @route   PUT /api/populations/restore/:id
 * @desc    Restore soft deleted population record (future feature)
 * @access  Private (Superadmin only)
 * @params  { id: string (UUID) }
 */
// router.put(
//   '/restore/:id',
//   authenticateToken,
//   isSuperadmin,
//   validateParams(populationParamSchema),
//   // PopulationController.restorePopulation
// );

// ============================================
// ADMIN FILTERED ROUTES (Hospital-specific data)
// ============================================

/**
 * @route   GET /api/populations/my-hospital
 * @desc    Get populations for current user's hospital only
 * @access  Private (Admin+ only)
 * @query   Same as main populations list
 * @permission Admin/User: Own hospital data only
 */
router.get(
  '/my-hospital',
  authenticateToken,
  canAccessHospitalData,
  addHospitalFilter, // This middleware adds hospitalCode9eDigit to query
  PopulationController.getPopulations
);

/**
 * @route   GET /api/populations/my-hospital/statistics
 * @desc    Get population statistics for current user's hospital only
 * @access  Private (Admin+ only)
 * @permission Admin/User: Own hospital data only
 */
router.get(
  '/my-hospital/statistics',
  authenticateToken,
  canAccessHospitalData,
  addHospitalFilter,
  PopulationController.getPopulationStatistics
);

export default router;