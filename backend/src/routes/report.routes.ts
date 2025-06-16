// backend/src/routes/report.routes.ts

import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

// Create router instance
const router = Router();

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// All report endpoints are public for generating public reports
// ============================================

/**
 * @route   GET /api/reports/health
 * @desc    Report service health check
 * @access  Public
 */
router.get('/health', ReportController.healthCheck);

// ============================================
// REPORT ENDPOINTS
// ============================================

/**
 * @route   GET /api/reports/age-groups
 * @desc    Get age groups report with calculated statistics
 * @access  Public (for public reports)
 * @query   { diseaseId: string, year?: string, hospitalCode?: string, gender?: 'MALE'|'FEMALE'|'all', ageGroup?: string, occupation?: string }
 */
router.get('/age-groups', ReportController.getAgeGroupsReport);

/**
 * @route   GET /api/reports/gender-ratio
 * @desc    Get gender ratio report with calculated statistics
 * @access  Public (for public reports)
 * @query   { diseaseId: string, year?: string, hospitalCode?: string, gender?: 'MALE'|'FEMALE'|'all', ageGroup?: string, occupation?: string }
 */
router.get('/gender-ratio', ReportController.getGenderRatioReport);

/**
 * @route   GET /api/reports/incidence-rates
 * @desc    Get incidence rates report with calculated statistics
 * @access  Public (for public reports)
 * @query   { diseaseId: string, year?: string, hospitalCode?: string, gender?: 'MALE'|'FEMALE'|'all', ageGroup?: string, occupation?: string }
 */
router.get('/incidence-rates', ReportController.getIncidenceRatesReport);

/**
 * @route   GET /api/reports/occupation
 * @desc    Get occupation report with calculated statistics
 * @access  Public (for public reports)
 * @query   { diseaseId: string, year?: string, hospitalCode?: string, gender?: 'MALE'|'FEMALE'|'all', ageGroup?: string, occupation?: string }
 */
router.get('/occupation', ReportController.getOccupationReport);

// ============================================
// UTILITY ENDPOINTS
// ============================================

/**
 * @route   GET /api/reports/diseases
 * @desc    Get all diseases for dropdown options
 * @access  Public
 */
router.get('/diseases', ReportController.getDiseases);

/**
 * @route   GET /api/reports/hospitals
 * @desc    Get all hospitals for dropdown options
 * @access  Public
 */
router.get('/hospitals', ReportController.getHospitals);

/**
 * @route   GET /api/reports/public-stats
 * @desc    Get public statistics (total diseases, patients, etc.)
 * @access  Public
 */
router.get('/public-stats', ReportController.getPublicStats);

// ============================================
// HEALTH CHECK & DOCUMENTATION
// ============================================

/**
 * @route   GET /api/reports/docs
 * @desc    Get report API documentation
 * @access  Public
 */
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Report API Documentation',
    data: {
      version: '2.0.0',
      description: 'Public Report API - provides calculated statistics and reports',
      philosophy: 'Backend calculates all statistics, Frontend displays results',
      endpoints: {
        'GET /api/reports/age-groups': {
          description: 'Get age groups report with calculated percentages and incidence rates',
          purpose: 'Display age distribution analysis with ready-to-use statistics',
          returns: 'Age groups with counts, percentages, and incidence rates',
          queryParams: [
            'diseaseId (required) - Disease UUID',
            'year - Filter by year (default: all)',
            'hospitalCode - Filter by hospital (default: all)',
            'gender - Filter by gender: MALE|FEMALE|all (default: all)',
            'ageGroup - Filter by age group (default: all)',
            'occupation - Filter by occupation (default: all)',
          ],
        },
        'GET /api/reports/gender-ratio': {
          description: 'Get gender ratio report with calculated ratios and percentages',
          purpose: 'Display gender distribution analysis with normalized ratios',
          returns: 'Gender counts, ratios (e.g., 1.5:1), and percentages',
          queryParams: ['...same as age-groups'],
        },
        'GET /api/reports/incidence-rates': {
          description: 'Get incidence rates report with calculated rates per 100,000 population',
          purpose: 'Display incidence, mortality, and case fatality rates by hospital',
          returns: 'Overall rates and detailed hospital breakdown with calculated statistics',
          queryParams: ['...same as age-groups'],
        },
        'GET /api/reports/occupation': {
          description: 'Get occupation report with calculated percentages',
          purpose: 'Display occupation distribution analysis',
          returns: 'Occupation counts and percentages, sorted by frequency',
          queryParams: ['...same as age-groups'],
        },
        'GET /api/reports/diseases': {
          description: 'Get all diseases for dropdown options',
          purpose: 'Provide disease selection options for report forms',
          returns: 'List of active diseases with IDs and names',
        },
        'GET /api/reports/hospitals': {
          description: 'Get all hospitals for dropdown options',
          purpose: 'Provide hospital selection options for report forms',
          returns: 'List of active hospitals formatted for dropdowns',
        },
        'GET /api/reports/public-stats': {
          description: 'Get public statistics summary',
          purpose: 'Display overview statistics on public dashboard',
          returns: 'Total diseases, total patients, current month patients',
        },
      },
      calculations: {
        incidenceRate: 'Backend: (patientCount ÷ population) × 100,000',
        mortalityRate: 'Backend: (deaths ÷ population) × 100,000',
        caseFatalityRate: 'Backend: (deaths ÷ totalPatients) × 100',
        genderRatio: 'Backend: normalize male:female ratios (e.g., 1.5:1)',
        percentages: 'Backend: (part ÷ total) × 100',
        ageGroups: 'Backend: categorize ages and calculate distributions',
      },
      dataSecurity: {
        access: 'Public endpoints - no authentication required',
        calculation: 'All calculations performed on backend for accuracy',
        privacy: 'No personal identifiable information in aggregated data',
      },
      performance: {
        calculation: 'Backend calculations for optimal performance',
        caching: 'Responses can be cached by frontend for better UX',
        efficiency: 'Minimal data transfer with pre-calculated results',
      },
      usage: {
        workflow: [
          '1. Frontend calls report endpoints with filters',
          '2. Backend calculates all statistics and rates',
          '3. Backend returns ready-to-display results',
          '4. Frontend displays charts and tables directly',
        ],
        example: {
          ageGroups: [
            'GET /api/reports/age-groups?diseaseId=123e4567-e89b-12d3-a456-426614174000&year=2024',
            'Returns: age groups with counts, percentages, and incidence rates',
          ],
          genderRatio: [
            'GET /api/reports/gender-ratio?diseaseId=123e4567-e89b-12d3-a456-426614174000',
            'Returns: gender counts, normalized ratios, and percentages',
          ],
          incidenceRates: [
            'GET /api/reports/incidence-rates?diseaseId=123e4567-e89b-12d3-a456-426614174000&hospitalCode=123456789',
            'Returns: calculated incidence, mortality, and case fatality rates',
          ],
        },
      },
      changelog: {
        'v2.0.0': 'Complete redesign - Backend now calculates all statistics',
        'v1.0.0': 'Initial version - Frontend calculations (deprecated)',
      },
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;