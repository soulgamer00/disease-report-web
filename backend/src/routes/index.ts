// backend/src/routes/index.ts

import { Router } from 'express';
import authRoutes from './auth.routes';
import diseaseRoutes from './disease.routes';
import symptomRoutes from './symptom.routes';
import hospitalRoutes from './hospital.routes';
import populationRoutes from './population.routes';
import patientVisitRoutes from './patientVisit.routes';
import reportRoutes from './report.routes';
import userRoutes from './user.routes';


// Create main router
const router = Router();

// ============================================
// API VERSION AND INFO
// ============================================

/**
 * @route   GET /api
 * @desc    API information and available endpoints
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Disease Report System API v1.0',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Bangkok',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh',
        profile: 'GET /api/auth/profile',
        changePassword: 'POST /api/auth/change-password',
        verify: 'GET /api/auth/verify',
      },
      diseases: {
        list: 'GET /api/diseases',
        detail: 'GET /api/diseases/:id',
        symptoms: 'GET /api/diseases/:id/symptoms',
        create: 'POST /api/diseases (Superadmin)',
        update: 'PUT /api/diseases/:id (Superadmin)',
        delete: 'DELETE /api/diseases/:id (Superadmin)',
        statistics: 'GET /api/diseases/statistics/summary',
      },
      symptoms: {
        list: 'GET /api/symptoms',
        detail: 'GET /api/symptoms/:id',
        byDisease: 'GET /api/symptoms/disease/:diseaseId',
        create: 'POST /api/symptoms (Superadmin)',
        update: 'PUT /api/symptoms/:id (Superadmin)',
        delete: 'DELETE /api/symptoms/:id (Superadmin)',
        statistics: 'GET /api/symptoms/statistics/summary',
      },
      hospitals: {
        list: 'GET /api/hospitals',
        detail: 'GET /api/hospitals/:id',
        byCode: 'GET /api/hospitals/code/:code',
        codes: 'GET /api/hospitals/codes/map',
        statistics: 'GET /api/hospitals/statistics/summary',
        create: 'POST /api/hospitals (Superadmin)',
        update: 'PUT /api/hospitals/:id (Superadmin)',
        delete: 'DELETE /api/hospitals/:id (Superadmin)',
      },
      populations: {
        list: 'GET /api/populations',
        detail: 'GET /api/populations/:id',
        byHospital: 'GET /api/populations/hospital/:code',
        byYear: 'GET /api/populations/year/:year',
        statistics: 'GET /api/populations/statistics/summary',
        trends: 'GET /api/populations/trends',
        myHospital: 'GET /api/populations/my-hospital (Admin+)',
        create: 'POST /api/populations (Admin+)',
        update: 'PUT /api/populations/:id (Admin+)',
        delete: 'DELETE /api/populations/:id (Admin+)',
      },
      patientVisits: {
        list: 'GET /api/patient-visits',
        detail: 'GET /api/patient-visits/:id',
        history: 'GET /api/patient-visits/history',
        statistics: 'GET /api/patient-visits/statistics',
        export: 'GET /api/patient-visits/export/excel (User+)',
        search: 'GET /api/patient-visits/search/advanced',
        filters: 'GET /api/patient-visits/filters/options',
        create: 'POST /api/patient-visits (Admin+)',
        update: 'PUT /api/patient-visits/:id (Admin+)',
        delete: 'DELETE /api/patient-visits/:id (Admin+)',
        bulkImport: 'POST /api/patient-visits/bulk-import (Admin+)',
        bulkUpdate: 'PUT /api/patient-visits/bulk-update (Admin+)',
      },
      reports: {
        patientVisitData: 'GET /api/reports/patient-visit-data',
        incidenceData: 'GET /api/reports/incidence-data',
        genderData: 'GET /api/reports/gender-data',
        trendData: 'GET /api/reports/trend-data',
        populationData: 'GET /api/reports/population-data',
        filterOptions: 'GET /api/reports/filter-options',
        docs: 'GET /api/reports/docs',
      },
    },
    documentation: {
      health: 'GET /health - System health check',
      services: {
        auth: 'GET /api/auth/health - Auth service health check',
        diseases: 'GET /api/diseases/health - Disease service health check',
        symptoms: 'GET /api/symptoms/health - Symptom service health check',
        hospitals: 'GET /api/hospitals/health - Hospital service health check',
        populations: 'GET /api/populations/health - Population service health check',
        patientVisits: 'GET /api/patient-visits/health - Patient visit service health check',
        reports: 'GET /api/reports/health - Report service health check',
      },
    },
    permissions: {
      superadmin: {
        description: 'Full system access',
        access: 'All hospitals, all CRUD operations, user management',
        roleId: 1,
      },
      admin: {
        description: 'Hospital administrator',
        access: 'Own hospital CRUD operations, limited user management',
        roleId: 2,
      },
      user: {
        description: 'Read-only access',
        access: 'Read own hospital data, export Excel',
        roleId: 3,
      },
    },
    philosophy: {
      dataFlow: 'Backend provides filtered raw data, Frontend performs calculations',
      security: 'Role-based access control with hospital-level data isolation',
      architecture: 'Clean separation of concerns with service layer',
      validation: 'Comprehensive input validation using Zod schemas',
      timezone: 'All dates in Asia/Bangkok timezone',
      performance: 'Pagination and data limits to prevent overload',
    },
    users: {
  list: 'GET /api/users (Admin+)',
  detail: 'GET /api/users/:id (Admin+)',
  create: 'POST /api/users (Admin+)',
  update: 'PUT /api/users/:id (Admin+)',
  delete: 'DELETE /api/users/:id (Admin+)',
  adminChangePassword: 'PUT /api/users/:id/password (Admin+)',
  profile: 'GET /api/users/profile (User+)',
  updateProfile: 'PUT /api/users/profile (User+)',
  changePassword: 'PUT /api/users/profile/password (User+)',
  health: 'GET /api/users/health',
  docs: 'GET /api/users/docs',
},
  });
});

// ============================================
// MOUNT ROUTES
// ============================================

// Authentication routes
router.use('/auth', authRoutes);

// Master data routes (public for reports)
router.use('/diseases', diseaseRoutes);
router.use('/symptoms', symptomRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/populations', populationRoutes);

// Patient visit routes
router.use('/patient-visits', patientVisitRoutes);

// Report routes (public for generating reports)
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
// ============================================
// API HEALTH CHECK
// ============================================

/**
 * @route   GET /api/health
 * @desc    API health check with system information
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      success: true,
      message: 'Disease Report API is healthy',
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Bangkok',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      services: {
        auth: 'operational',
        diseases: 'operational',
        symptoms: 'operational',
        hospitals: 'operational',
        populations: 'operational',
        patientVisits: 'operational',
        reports: 'operational',
      },
      database: {
        status: 'connected',
        provider: 'postgresql',
      },
      features: {
        authentication: 'JWT with refresh tokens',
        authorization: 'Role-based access control (3 levels)',
        validation: 'Zod schema validation',
        timezone: 'Asia/Bangkok',
        softDelete: 'All entities support soft delete',
        reports: 'Public report data APIs',
        export: 'Excel export with permissions',
        search: 'Full-text search across entities',
        pagination: 'Consistent pagination pattern',
      },
    };

    res.json(healthStatus);
  } catch (error) {
    console.error('API health check error:', error);
    
    res.status(500).json({
      success: false,
      message: 'API health check failed',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// ============================================
// API STATISTICS ENDPOINT
// ============================================

/**
 * @route   GET /api/stats
 * @desc    Get API usage statistics
 * @access  Public
 */
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    message: 'API Statistics',
    data: {
      totalEndpoints: 60, // Updated count
      services: {
        auth: 6,
        diseases: 7,
        symptoms: 7,
        hospitals: 9,
        populations: 12,
        patientVisits: 20,
        reports: 8, // New service
      },
      features: {
        authentication: 'JWT with refresh tokens',
        authorization: 'Role-based access control (3 levels)',
        validation: 'Zod schema validation',
        database: 'PostgreSQL with Prisma ORM',
        timezone: 'Asia/Bangkok',
        softDelete: 'All entities support soft delete',
        audit: 'Created/updated by tracking',
        export: 'Excel export with permissions',
        search: 'Full-text search across entities',
        pagination: 'Consistent pagination pattern',
        filtering: 'Advanced filtering capabilities',
        reports: 'Public report data APIs', // New feature
      },
      security: {
        passwordHashing: 'bcrypt (12 rounds)',
        rateLimiting: 'Auth endpoints protected',
        cors: 'Configured for production',
        helmet: 'Security headers enabled',
        validation: 'Input sanitization',
        permissions: 'Hospital-based data isolation',
      },
      reportingSystem: {
        philosophy: 'Backend provides filtered raw data, Frontend calculates',
        publicAccess: 'Report endpoints are public for transparency',
        dataTypes: 'Patient visits, population, incidence, gender, trends',
        calculations: 'Performed on frontend for better performance',
        filtering: 'Advanced filtering with date ranges, hospitals, diseases',
        aggregation: 'Group by various dimensions (time, location, demographics)',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;