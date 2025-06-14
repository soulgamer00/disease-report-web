// backend/src/controllers/patientVisit.controller.ts

import { Request, Response } from 'express';
import { PatientVisitService } from '../services/patientVisit.service';
import {
  createPatientVisitSchema,
  updatePatientVisitSchema,
  patientVisitQuerySchema,
  patientVisitParamSchema,
  CreatePatientVisitRequest,
  UpdatePatientVisitRequest,
  PatientVisitQueryParams,
  PatientVisitParam,
} from '../schemas/patientVisit.schema';

// ============================================
// PATIENT VISIT CONTROLLER CLASS
// ============================================

export class PatientVisitController {

  // ============================================
  // GET PATIENT VISITS LIST
  // ============================================

  static async getPatientVisits(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery: PatientVisitQueryParams = patientVisitQuerySchema.parse(req.query);

      // Call patient visit service
      const result = await PatientVisitService.getPatientVisits(validatedQuery);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการผู้ป่วยสำเร็จ',
        data: {
          patientVisits: result.patientVisits,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get patient visits controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการผู้ป่วย';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Patient visit list fetch failed',
      });
    }
  }

  // ============================================
  // GET PATIENT VISIT BY ID
  // ============================================

  static async getPatientVisitById(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: PatientVisitParam = patientVisitParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call patient visit service
      const patientVisit = await PatientVisitService.getPatientVisitById(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ป่วยสำเร็จ',
        data: {
          patientVisit,
        },
      });
    } catch (error) {
      console.error('Get patient visit by ID controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลผู้ป่วย')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Patient visit not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Patient visit fetch failed',
      });
    }
  }

  // ============================================
  // GET PATIENT HISTORY BY ID CARD
  // ============================================

  static async getPatientHistory(req: Request, res: Response): Promise<void> {
    try {
      // Get ID card from query parameters
      const idCardCode = req.query.idCardCode as string;

      if (!idCardCode) {
        res.status(400).json({
          success: false,
          message: 'กรุณาระบุเลขบัตรประจำตัวประชาชน',
          error: 'ID card code required',
        });
        return;
      }

      // Validate ID card format
      if (!/^\d{13}$/.test(idCardCode)) {
        res.status(400).json({
          success: false,
          message: 'เลขบัตรประจำตัวประชาชนไม่ถูกต้อง',
          error: 'Invalid ID card format',
        });
        return;
      }

      // Call patient visit service
      const patientHistory = await PatientVisitService.getPatientVisitsByIdCardCode(idCardCode);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลประวัติผู้ป่วยสำเร็จ',
        data: {
          idCardCode,
          patientHistory,
          total: patientHistory.length,
        },
      });
    } catch (error) {
      console.error('Get patient history controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติผู้ป่วย';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Patient history fetch failed',
      });
    }
  }

  // ============================================
  // CREATE NEW PATIENT VISIT
  // ============================================

  static async createPatientVisit(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      // Validate request body
      const validatedData: CreatePatientVisitRequest = createPatientVisitSchema.parse(req.body);

      // Call patient visit service
      const newPatientVisit = await PatientVisitService.createPatientVisit(
        validatedData,
        req.user.id
      );

      // Return success response
      res.status(201).json({
        success: true,
        message: 'สร้างข้อมูลผู้ป่วยสำเร็จ',
        data: {
          patientVisit: newPatientVisit,
        },
      });
    } catch (error) {
      console.error('Create patient visit controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างข้อมูลผู้ป่วย';

      // Check if it's a validation error (disease/hospital not found)
      if (error instanceof Error && (error.message.includes('ไม่พบข้อมูลโรค') || error.message.includes('ไม่พบข้อมูลโรงพยาบาล'))) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Related resource not found',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Patient visit creation failed',
      });
    }
  }

  // ============================================
  // UPDATE PATIENT VISIT
  // ============================================

  static async updatePatientVisit(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      // Validate URL parameters
      const validatedParams: PatientVisitParam = patientVisitParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Validate request body
      const validatedData: UpdatePatientVisitRequest = updatePatientVisitSchema.parse(req.body);

      // Call patient visit service
      const updatedPatientVisit = await PatientVisitService.updatePatientVisit(id, validatedData);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'แก้ไขข้อมูลผู้ป่วยสำเร็จ',
        data: {
          patientVisit: updatedPatientVisit,
        },
      });
    } catch (error) {
      console.error('Update patient visit controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ป่วย';

      // Check if it's a "not found" error
      if (error instanceof Error && (error.message.includes('ไม่พบข้อมูลผู้ป่วย') || error.message.includes('ไม่พบข้อมูลโรค') || error.message.includes('ไม่พบข้อมูลโรงพยาบาล'))) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Resource not found',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Patient visit update failed',
      });
    }
  }

  // ============================================
  // DELETE PATIENT VISIT (SOFT DELETE)
  // ============================================

  static async deletePatientVisit(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      // Validate URL parameters
      const validatedParams: PatientVisitParam = patientVisitParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call patient visit service
      const result = await PatientVisitService.deletePatientVisit(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ลบข้อมูลผู้ป่วยเรียบร้อยแล้ว',
        data: {
          deletedAt: result.deletedAt,
        },
      });
    } catch (error) {
      console.error('Delete patient visit controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบข้อมูลผู้ป่วย';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลผู้ป่วย')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Patient visit not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Patient visit deletion failed',
      });
    }
  }

  // ============================================
  // GET PATIENT VISIT STATISTICS
  // ============================================

  static async getPatientVisitStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Get optional filters from query
      const hospitalCode9eDigit = req.query.hospitalCode9eDigit as string;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const diseaseId = req.query.diseaseId as string;

      // Validate year if provided
      if (year && (isNaN(year) || year < 2000 || year > new Date().getFullYear() + 5)) {
        res.status(400).json({
          success: false,
          message: `ปีต้องอยู่ในช่วง 2000 - ${new Date().getFullYear() + 5}`,
          error: 'Invalid year',
        });
        return;
      }

      // Call patient visit service
      const statistics = await PatientVisitService.getPatientVisitStatistics(
        hospitalCode9eDigit,
        year,
        diseaseId
      );

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสถิติผู้ป่วยสำเร็จ',
        data: {
          statistics: {
            ...statistics,
            filters: {
              hospitalCode9eDigit: hospitalCode9eDigit || null,
              year: year || null,
              diseaseId: diseaseId || null,
            },
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Get patient visit statistics controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติผู้ป่วย';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Patient visit statistics fetch failed',
      });
    }
  }

  // ============================================
  // EXPORT PATIENT VISITS TO EXCEL
  // ============================================

  static async exportPatientVisitsToExcel(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'กรุณาเข้าสู่ระบบ',
          error: 'Authentication required',
        });
        return;
      }

      // For now, return a placeholder response
      // This will be implemented with actual Excel export utility
      res.status(200).json({
        success: true,
        message: 'กำลังเตรียมไฟล์ Excel สำหรับดาวน์โหลด',
        data: {
          message: 'Excel export feature will be implemented in export.utils.ts',
          user: {
            id: req.user.id,
            hospitalCode9eDigit: req.user.hospitalCode9eDigit,
          },
        },
      });
    } catch (error) {
      console.error('Export patient visits controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งออกข้อมูล';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Export failed',
      });
    }
  }

  // ============================================
  // GET PATIENT VISITS BY DISEASE
  // ============================================

  static async getPatientVisitsByDisease(req: Request, res: Response): Promise<void> {
    try {
      // Get disease ID from URL parameters
      const diseaseId = req.params.diseaseId;

      if (!diseaseId) {
        res.status(400).json({
          success: false,
          message: 'กรุณาระบุรหัสโรค',
          error: 'Disease ID required',
        });
        return;
      }

      // Validate disease ID format (UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(diseaseId)) {
        res.status(400).json({
          success: false,
          message: 'รหัสโรคไม่ถูกต้อง',
          error: 'Invalid disease ID format',
        });
        return;
      }

      // Build query with disease filter
      const queryParams: PatientVisitQueryParams = {
        ...patientVisitQuerySchema.parse(req.query),
        diseaseId,
      };

      // Call patient visit service
      const result = await PatientVisitService.getPatientVisits(queryParams);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ป่วยตามโรคสำเร็จ',
        data: {
          diseaseId,
          patientVisits: result.patientVisits,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get patient visits by disease controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วยตามโรค';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Patient visits by disease fetch failed',
      });
    }
  }

  // ============================================
  // GET PATIENT VISITS BY HOSPITAL
  // ============================================

  static async getPatientVisitsByHospital(req: Request, res: Response): Promise<void> {
    try {
      // Get hospital code from URL parameters
      const hospitalCode = req.params.hospitalCode;

      if (!hospitalCode) {
        res.status(400).json({
          success: false,
          message: 'กรุณาระบุรหัสโรงพยาบาล',
          error: 'Hospital code required',
        });
        return;
      }

      // Validate hospital code format
      if (!/^[A-Z]{2}\d{7}$/.test(hospitalCode)) {
        res.status(400).json({
          success: false,
          message: 'รหัสโรงพยาบาลไม่ถูกต้อง',
          error: 'Invalid hospital code format',
        });
        return;
      }

      // Build query with hospital filter
      const queryParams: PatientVisitQueryParams = {
        ...patientVisitQuerySchema.parse(req.query),
        hospitalCode9eDigit: hospitalCode,
      };

      // Call patient visit service
      const result = await PatientVisitService.getPatientVisits(queryParams);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ป่วยตามโรงพยาบาลสำเร็จ',
        data: {
          hospitalCode,
          patientVisits: result.patientVisits,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get patient visits by hospital controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วยตามโรงพยาบาล';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Patient visits by hospital fetch failed',
      });
    }
  }

  // ============================================
  // HEALTH CHECK FOR PATIENT VISIT ENDPOINTS
  // ============================================

  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const [totalPatientVisits, statistics] = await Promise.all([
        PatientVisitService.getPatientVisitCount(),
        PatientVisitService.getPatientVisitStatistics(),
      ]);

      res.status(200).json({
        success: true,
        message: 'Patient visit service is healthy',
        data: {
          service: 'patient-visit-management',
          status: 'operational',
          totalPatientVisits,
          genderDistribution: {
            male: statistics.byGender.male,
            female: statistics.byGender.female,
          },
          timestamp: new Date().toISOString(),
          endpoints: {
            list: 'GET /api/patient-visits - List all patient visits',
            detail: 'GET /api/patient-visits/:id - Get patient visit by ID',
            history: 'GET /api/patient-visits/history?idCardCode=... - Get patient history',
            byDisease: 'GET /api/patient-visits/disease/:diseaseId - Get visits by disease',
            byHospital: 'GET /api/patient-visits/hospital/:hospitalCode - Get visits by hospital',
            statistics: 'GET /api/patient-visits/statistics - Get patient visit statistics',
            create: 'POST /api/patient-visits - Create new patient visit (Admin+)',
            update: 'PUT /api/patient-visits/:id - Update patient visit (Admin+)',
            delete: 'DELETE /api/patient-visits/:id - Delete patient visit (Admin+)',
            export: 'GET /api/patient-visits/export/excel - Export to Excel (User+)',
          },
        },
      });
    } catch (error) {
      console.error('Patient visit health check error:', error);

      res.status(500).json({
        success: false,
        message: 'Patient visit service health check failed',
        error: 'Service unhealthy',
      });
    }
  }
}