// backend/src/routes/patientVisit.routes.ts

import { Router } from 'express';
import { PatientVisitController } from '../controllers/patientVisit.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { 
  isAdmin, 
  isSuperadmin, 
  isUser, 
  canAccessHospitalData, 
  addHospitalFilter 
} from '../middleware/permission.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware';
import {
  createPatientVisitSchema,
  updatePatientVisitSchema,
  patientVisitParamSchema,
} from '../schemas/patientVisit.schema';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * @route   GET /api/patient-visits/health
 * @desc    Patient visit service health check
 * @access  Public
 */
router.get('/health', PatientVisitController.healthCheck);

/**
 * @route   GET /api/patient-visits/statistics
 * @desc    Get patient visit statistics (public reports)
 * @access  Public
 * @query   { hospitalCode9eDigit?: string, year?: number, diseaseId?: string }
 */
router.get('/statistics', PatientVisitController.getPatientVisitStatistics);

/**
 * @route   GET /api/patient-visits/disease/:diseaseId
 * @desc    Get patient visits by disease ID (public reports)
 * @access  Public
 * @params  { diseaseId: string (UUID) }
 * @query   { page?: number, limit?: number, search?: string, ... }
 */
router.get('/disease/:diseaseId', PatientVisitController.getPatientVisitsByDisease);

/**
 * @route   GET /api/patient-visits/hospital/:hospitalCode
 * @desc    Get patient visits by hospital code (public reports)
 * @access  Public
 * @params  { hospitalCode: string (Hospital Code 9 digits new format) }
 * @query   { page?: number, limit?: number, search?: string, ... }
 */
router.get('/hospital/:hospitalCode', PatientVisitController.getPatientVisitsByHospital);

/**
 * @route   GET /api/patient-visits/history
 * @desc    Get patient history by ID card (public lookup)
 * @access  Public
 * @query   { idCardCode: string (13 digits) }
 */
router.get('/history', PatientVisitController.getPatientHistory);

/**
 * @route   GET /api/patient-visits
 * @desc    Get list of patient visits with pagination and search (public reports)
 * @access  Public
 * @query   { page?: number, limit?: number, search?: string, diseaseId?: string, hospitalCode9eDigit?: string, gender?: string, patientType?: string, patientCondition?: string, startDate?: string, endDate?: string, ageMin?: number, ageMax?: number, sortBy?: string, sortOrder?: 'asc'|'desc', isActive?: boolean }
 */
router.get(
  '/',
  PatientVisitController.getPatientVisits
);

/**
 * @route   GET /api/patient-visits/:id
 * @desc    Get patient visit by ID (public reports)
 * @access  Public
 * @params  { id: string (UUID) }
 */
router.get(
  '/:id',
  validateParams(patientVisitParamSchema),
  PatientVisitController.getPatientVisitById
);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * @route   POST /api/patient-visits
 * @desc    Create new patient visit
 * @access  Private (Admin+ only)
 * @body    { idCardCode, namePrefix, fname, lname, gender, birthday, nationality, maritalStatus, occupation, phoneNumber?, currentHouseNumber?, currentVillageNumber?, currentRoadName?, currentProvince?, currentDistrict?, currentSubDistrict?, addressSickHouseNumber?, addressSickVillageNumber?, addressSickRoadName?, addressSickProvince, addressSickDistrict?, addressSickSubDistrict?, diseaseId, symptomsOfDisease?, treatmentArea, treatmentHospital?, illnessDate, treatmentDate, diagnosisDate, diagnosis1?, diagnosis2?, patientType, patientCondition, deathDate?, causeOfDeath?, receivingProvince, hospitalCode9eDigit, reportName?, remarks? }
 * @permission Superadmin: All hospitals, Admin: Must match user's hospital
 */
router.post(
  '/',
  authenticateToken,
  isAdmin,
  canAccessHospitalData,
  // Note: Using custom validation due to ZodEffects compatibility
  (req, res, next) => {
    try {
      createPatientVisitSchema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Invalid input',
      });
      return;
    }
  },
  PatientVisitController.createPatientVisit
);

/**
 * @route   PUT /api/patient-visits/:id
 * @desc    Update existing patient visit
 * @access  Private (Admin+ only)
 * @params  { id: string (UUID) }
 * @body    Same as create but all fields optional
 * @permission Superadmin: All hospitals, Admin: Must match user's hospital
 */
router.put(
  '/:id',
  authenticateToken,
  isAdmin,
  canAccessHospitalData,
  validateParams(patientVisitParamSchema),
  // Note: Using custom validation due to ZodEffects compatibility  
  (req, res, next) => {
    try {
      updatePatientVisitSchema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
        error: 'Validation failed',
        details: error instanceof Error ? error.message : 'Invalid input',
      });
      return;
    }
  },
  PatientVisitController.updatePatientVisit
);

/**
 * @route   DELETE /api/patient-visits/:id
 * @desc    Soft delete patient visit
 * @access  Private (Admin+ only)
 * @params  { id: string (UUID) }
 * @permission Superadmin: All hospitals, Admin: Must match user's hospital
 */
router.delete(
  '/:id',
  authenticateToken,
  isAdmin,
  canAccessHospitalData,
  validateParams(patientVisitParamSchema),
  PatientVisitController.deletePatientVisit
);

// ============================================
// USER ROLE ROUTES (Read + Export)
// ============================================

/**
 * @route   GET /api/patient-visits/export/excel
 * @desc    Export patient visits to Excel
 * @access  Private (User+ only)
 * @query   { hospitalCode9eDigit?: string, year?: number, diseaseId?: string, startDate?: string, endDate?: string }
 * @permission User: Own hospital only, Admin+: Can specify hospital
 */
router.get(
  '/export/excel',
  authenticateToken,
  isUser,
  canAccessHospitalData,
  addHospitalFilter, // Auto-add hospital filter for User role
  PatientVisitController.exportPatientVisitsToExcel
);

// ============================================
// HOSPITAL-FILTERED ROUTES (Hospital-specific data)
// ============================================

/**
 * @route   GET /api/patient-visits/my-hospital
 * @desc    Get patient visits for current user's hospital only
 * @access  Private (User+ only)
 * @query   Same as main patient visits list
 * @permission User/Admin: Own hospital data only
 */
router.get(
  '/my-hospital',
  authenticateToken,
  isUser,
  canAccessHospitalData,
  addHospitalFilter, // This middleware adds hospitalCode9eDigit to query
  PatientVisitController.getPatientVisits
);

/**
 * @route   GET /api/patient-visits/my-hospital/statistics
 * @desc    Get patient visit statistics for current user's hospital only
 * @access  Private (User+ only)
 * @permission User/Admin: Own hospital data only
 */
router.get(
  '/my-hospital/statistics',
  authenticateToken,
  isUser,
  canAccessHospitalData,
  addHospitalFilter,
  PatientVisitController.getPatientVisitStatistics
);

/**
 * @route   GET /api/patient-visits/my-hospital/history
 * @desc    Get patient history for current user's hospital only
 * @access  Private (User+ only)
 * @query   { idCardCode: string (13 digits) }
 * @permission User/Admin: Own hospital data only
 */
router.get(
  '/my-hospital/history',
  authenticateToken,
  isUser,
  canAccessHospitalData,
  addHospitalFilter,
  PatientVisitController.getPatientHistory
);

// ============================================
// ADMIN ROUTES (Hospital Management)
// ============================================

/**
 * @route   GET /api/patient-visits/manage
 * @desc    Get patient visits for management (Admin+ only)
 * @access  Private (Admin+ only)
 * @query   Same as main list but with management flags
 * @permission Admin: Own hospital only, Superadmin: All hospitals
 */
router.get(
  '/manage',
  authenticateToken,
  isAdmin,
  canAccessHospitalData,
  addHospitalFilter, // Admin gets own hospital filter
  PatientVisitController.getPatientVisits
);

/**
 * @route   GET /api/patient-visits/manage/statistics
 * @desc    Get management statistics (Admin+ only)
 * @access  Private (Admin+ only)
 * @permission Admin: Own hospital only, Superadmin: All hospitals
 */
router.get(
  '/manage/statistics',
  authenticateToken,
  isAdmin,
  canAccessHospitalData,
  addHospitalFilter,
  PatientVisitController.getPatientVisitStatistics
);

// ============================================
// DEVELOPMENT & MONITORING ROUTES
// ============================================

/**
 * @route   GET /api/patient-visits/debug/permissions
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
      message: 'Debug permission information',
      data: {
        user: req.user,
        permissions: {
          isSuperadmin: req.user?.userRoleId === 1,
          isAdmin: req.user?.userRoleId && req.user.userRoleId <= 2,
          isUser: req.user?.userRoleId && req.user.userRoleId <= 3,
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
 * @route   GET /api/patient-visits/docs
 * @desc    Get route documentation
 * @access  Public
 */
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Patient Visit API Documentation',
    data: {
      version: '1.0.0',
      description: 'Patient Visit Management API with role-based access control',
      publicRoutes: [
        'GET /health - Health check',
        'GET /statistics - Public statistics',
        'GET /disease/:diseaseId - Visits by disease',
        'GET /hospital/:hospitalCode - Visits by hospital',
        'GET /history?idCardCode=... - Patient history lookup',
        'GET / - List all visits (public)',
        'GET /:id - Get visit by ID',
      ],
      protectedRoutes: [
        'POST / - Create visit (Admin+)',
        'PUT /:id - Update visit (Admin+)',
        'DELETE /:id - Delete visit (Admin+)',
        'GET /export/excel - Export to Excel (User+)',
        'GET /my-hospital - Own hospital data (User+)',
        'GET /my-hospital/statistics - Own hospital stats (User+)',
        'GET /manage - Management interface (Admin+)',
      ],
      permissions: {
        'Superadmin (roleId: 1)': 'Full access to all hospitals',
        'Admin (roleId: 2)': 'CRUD own hospital data + manage users',
        'User (roleId: 3)': 'Read own hospital data + export Excel',
      },
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;