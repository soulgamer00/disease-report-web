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

/**
 * @route   GET /api/reports/patient-visit-data
 * @desc    Get patient visit data for reports (filtered raw data)
 * @access  Public (for public reports)
 * @query   { dateFrom?: string, dateTo?: string, hospitalCode?: string, hospitalId?: string, diseaseId?: string, gender?: 'M'|'F', ageMin?: number, ageMax?: number, page?: number, limit?: number }
 */
router.get('/patient-visit-data', ReportController.getPatientVisitData);

/**
 * @route   GET /api/reports/incidence-data
 * @desc    Get incidence rate data (aggregated by groupBy parameter)
 * @access  Public (for public reports)
 * @query   { ...baseQuery, groupBy?: 'month'|'quarter'|'year'|'hospital'|'disease' }
 */
router.get('/incidence-data', ReportController.getIncidenceData);

/**
 * @route   GET /api/reports/gender-data
 * @desc    Get gender ratio data (aggregated by groupBy parameter)
 * @access  Public (for public reports)
 * @query   { ...baseQuery, groupBy?: 'age_group'|'hospital'|'disease'|'month' }
 */
router.get('/gender-data', ReportController.getGenderData);

/**
 * @route   GET /api/reports/trend-data
 * @desc    Get trend analysis data (time-series data)
 * @access  Public (for public reports)
 * @query   { ...baseQuery, groupBy?: 'day'|'week'|'month'|'quarter'|'year', trendType?: 'patient_count'|'incidence_rate'|'gender_ratio' }
 */
router.get('/trend-data', ReportController.getTrendData);

/**
 * @route   GET /api/reports/population-data
 * @desc    Get population data for incidence rate calculations
 * @access  Public (for public reports)
 * @query   { year?: number, hospitalCode?: string, hospitalId?: string, groupBy?: 'hospital'|'year'|'age_group'|'gender' }
 */
router.get('/population-data', ReportController.getPopulationData);

/**
 * @route   GET /api/reports/filter-options
 * @desc    Get available filter options for report forms
 * @access  Public
 */
router.get('/filter-options', ReportController.getAvailableFilters);

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
      version: '1.0.0',
      description: 'Public Report Data API - provides filtered raw data for frontend calculations',
      philosophy: 'Backend sends filtered raw data, Frontend calculates statistics and ratios',
      endpoints: {
        'GET /api/reports/patient-visit-data': {
          description: 'Get filtered patient visit raw data',
          purpose: 'Base data for all report calculations',
          returns: 'Raw patient visit records with basic filters applied',
          queryParams: [
            'dateFrom, dateTo - Date range filter',
            'hospitalCode, hospitalId - Hospital filter',
            'diseaseId - Disease filter',
            'gender - Gender filter (M/F)',
            'ageMin, ageMax - Age range filter',
            'page, limit - Pagination',
          ],
        },
        'GET /api/reports/incidence-data': {
          description: 'Get patient visit data aggregated by specified grouping',
          purpose: 'Data for incidence rate calculations (Frontend: patientCount ÷ population × 100,000)',
          returns: 'Raw data + aggregated counts by groupBy parameter',
          queryParams: ['...baseQuery', 'groupBy - month|quarter|year|hospital|disease'],
        },
        'GET /api/reports/gender-data': {
          description: 'Get patient visit data grouped for gender analysis',
          purpose: 'Data for gender ratio calculations (Frontend: male:female ratios)',
          returns: 'Raw data + male/female counts by age groups or other groupings',
          queryParams: ['...baseQuery', 'groupBy - age_group|hospital|disease|month'],
        },
        'GET /api/reports/trend-data': {
          description: 'Get time-series patient visit data',
          purpose: 'Data for trend analysis charts',
          returns: 'Raw data + time-based aggregations',
          queryParams: [
            '...baseQuery',
            'groupBy - day|week|month|quarter|year',
            'trendType - patient_count|incidence_rate|gender_ratio',
          ],
        },
        'GET /api/reports/population-data': {
          description: 'Get population data for incidence calculations',
          purpose: 'Population denominators for incidence rate calculations',
          returns: 'Population counts by hospital/year',
          queryParams: [
            'year - Target year',
            'hospitalCode, hospitalId - Hospital filter',
            'groupBy - hospital|year|age_group|gender',
          ],
        },
        'GET /api/reports/filter-options': {
          description: 'Get available filter options for forms',
          purpose: 'Provide dropdown options and validation rules',
          returns: 'Available filters, date ranges, age groups, etc.',
        },
      },
      calculations: {
        incidenceRate: 'Frontend: (patientCount ÷ population) × 100,000',
        genderRatio: 'Frontend: normalize male:female ratios (e.g., 1.5:1)',
        trends: 'Frontend: time-series analysis and percentage changes',
        ageDistribution: 'Frontend: percentage distributions by age groups',
      },
      dataSecurity: {
        access: 'Public endpoints - no authentication required',
        filtering: 'Data pre-filtered by backend for performance',
        privacy: 'No personal identifiable information in aggregated data',
      },
      performance: {
        pagination: 'All endpoints support pagination (default: limit=1000)',
        caching: 'Responses can be cached by frontend for better UX',
        maxRecords: 'Maximum 5000 records per request to prevent overload',
      },
      usage: {
        workflow: [
          '1. Frontend calls report endpoints with filters',
          '2. Backend returns filtered raw data',
          '3. Frontend performs calculations (ratios, percentages, trends)',
          '4. Frontend displays charts and tables',
        ],
        example: {
          incidenceRate: [
            'GET /api/reports/incidence-data?diseaseId=123&year=2024&groupBy=month',
            'GET /api/reports/population-data?year=2024',
            'Frontend: calculate monthly incidence rates',
          ],
          genderRatio: [
            'GET /api/reports/gender-data?diseaseId=123&groupBy=age_group',
            'Frontend: calculate male:female ratios by age group',
          ],
        },
      },
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;