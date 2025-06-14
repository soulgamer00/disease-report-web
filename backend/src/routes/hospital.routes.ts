// backend/src/routes/hospital.routes.ts

import { Router } from 'express';
import { HospitalController } from '../controllers/hospital.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isSuperadmin } from '../middleware/permission.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import {
  createHospitalSchema,
  updateHospitalSchema,
  hospitalParamSchema,
  hospitalCodeParamSchema,
} from '../schemas/hospital.schema';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   GET /api/hospitals/health
 * @desc    Hospital service health check
 * @access  Public
 */
router.get('/health', HospitalController.healthCheck);

/**
 * @route   GET /api/hospitals/statistics/summary
 * @desc    Get hospital statistics summary
 * @access  Public
 */
router.get('/statistics/summary', HospitalController.getHospitalStatistics);

/**
 * @route   GET /api/hospitals/codes/map
 * @desc    Get hospital codes mapping (for dropdowns)
 * @access  Public
 */
router.get('/codes/map', HospitalController.getHospitalCodes);

/**
 * @route   GET /api/hospitals/code/:code
 * @desc    Get hospital by hospital code
 * @access  Public (for public reports)
 * @params  { code: string (Hospital Code 9 digits new format) }
 */
router.get(
  '/code/:code',
  validateParams(hospitalCodeParamSchema),
  HospitalController.getHospitalByCode
);

/**
 * @route   GET /api/hospitals
 * @desc    Get list of hospitals with pagination and search
 * @access  Public (for public reports)
 * @query   { page?: number, limit?: number, search?: string, organizationType?: string, healthServiceType?: string, affiliation?: string, sortBy?: string, sortOrder?: 'asc'|'desc', isActive?: boolean }
 */
router.get(
  '/',
  HospitalController.getHospitals
);

/**
 * @route   GET /api/hospitals/:id
 * @desc    Get hospital by ID
 * @access  Public (for public reports)
 * @params  { id: string (UUID) }
 * @query   { includePopulations?: boolean }
 */
router.get(
  '/:id',
  validateParams(hospitalParamSchema),
  HospitalController.getHospitalById
);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route   POST /api/hospitals
 * @desc    Create new hospital
 * @access  Private (Superadmin only)
 * @body    { hospitalName: string, hospitalCode9eDigit: string, hospitalCode9Digit?: string, hospitalCode5Digit?: string, organizationType?: string, healthServiceType?: string, affiliation?: string, departmentDivision?: string }
 */
router.post(
  '/',
  authenticateToken,
  isSuperadmin,
  validateBody(createHospitalSchema),
  HospitalController.createHospital
);

/**
 * @route   PUT /api/hospitals/:id
 * @desc    Update existing hospital
 * @access  Private (Superadmin only)
 * @params  { id: string (UUID) }
 * @body    { hospitalName?: string, hospitalCode9eDigit?: string, hospitalCode9Digit?: string, hospitalCode5Digit?: string, organizationType?: string, healthServiceType?: string, affiliation?: string, departmentDivision?: string }
 */
router.put(
  '/:id',
  authenticateToken,
  isSuperadmin,
  validateParams(hospitalParamSchema),
  validateBody(updateHospitalSchema),
  HospitalController.updateHospital
);

/**
 * @route   DELETE /api/hospitals/:id
 * @desc    Soft delete hospital
 * @access  Private (Superadmin only)
 * @params  { id: string (UUID) }
 */
router.delete(
  '/:id',
  authenticateToken,
  isSuperadmin,
  validateParams(hospitalParamSchema),
  HospitalController.deleteHospital
);

export default router;