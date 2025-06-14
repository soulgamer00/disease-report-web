// backend/src/controllers/hospital.controller.ts

import { Request, Response } from 'express';
import { HospitalService } from '../services/hospital.service';
import {
  createHospitalSchema,
  updateHospitalSchema,
  hospitalQuerySchema,
  hospitalParamSchema,
  hospitalCodeParamSchema,
  CreateHospitalRequest,
  UpdateHospitalRequest,
  HospitalQueryParams,
  HospitalParam,
  HospitalCodeParam,
} from '../schemas/hospital.schema';

// ============================================
// HOSPITAL CONTROLLER CLASS
// ============================================

export class HospitalController {

  // ============================================
  // GET HOSPITALS LIST
  // ============================================

  static async getHospitals(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery: HospitalQueryParams = hospitalQuerySchema.parse(req.query);

      // Call hospital service
      const result = await HospitalService.getHospitals(validatedQuery);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการโรงพยาบาลสำเร็จ',
        data: {
          hospitals: result.hospitals,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get hospitals controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการโรงพยาบาล';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Hospital list fetch failed',
      });
    }
  }

  // ============================================
  // GET HOSPITAL BY ID
  // ============================================

  static async getHospitalById(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: HospitalParam = hospitalParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Check if should include populations
      const includePopulations = req.query.includePopulations === 'true';

      // Call hospital service
      const hospital = await HospitalService.getHospitalById(id, includePopulations);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลโรงพยาบาลสำเร็จ',
        data: {
          hospital,
        },
      });
    } catch (error) {
      console.error('Get hospital by ID controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรงพยาบาล')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Hospital not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Hospital fetch failed',
      });
    }
  }

  // ============================================
  // GET HOSPITAL BY CODE
  // ============================================

  static async getHospitalByCode(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: HospitalCodeParam = hospitalCodeParamSchema.parse(req.params);
      const { code } = validatedParams;

      // Call hospital service
      const hospital = await HospitalService.getHospitalByCode(code);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลโรงพยาบาลสำเร็จ',
        data: {
          hospital,
        },
      });
    } catch (error) {
      console.error('Get hospital by code controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรงพยาบาล')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Hospital not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Hospital fetch failed',
      });
    }
  }

  // ============================================
  // CREATE NEW HOSPITAL
  // ============================================

  static async createHospital(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData: CreateHospitalRequest = createHospitalSchema.parse(req.body);

      // Call hospital service
      const newHospital = await HospitalService.createHospital(validatedData);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'สร้างข้อมูลโรงพยาบาลสำเร็จ',
        data: {
          hospital: newHospital,
        },
      });
    } catch (error) {
      console.error('Create hospital controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างข้อมูลโรงพยาบาล';

      // Check if it's a duplicate error
      if (error instanceof Error && error.message.includes('มีอยู่ในระบบแล้ว')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Duplicate hospital data',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Hospital creation failed',
      });
    }
  }

  // ============================================
  // UPDATE HOSPITAL
  // ============================================

  static async updateHospital(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: HospitalParam = hospitalParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Validate request body
      const validatedData: UpdateHospitalRequest = updateHospitalSchema.parse(req.body);

      // Call hospital service
      const updatedHospital = await HospitalService.updateHospital(id, validatedData);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'แก้ไขข้อมูลโรงพยาบาลสำเร็จ',
        data: {
          hospital: updatedHospital,
        },
      });
    } catch (error) {
      console.error('Update hospital controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลโรงพยาบาล';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรงพยาบาล')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Hospital not found',
        });
        return;
      }

      // Check if it's a duplicate error
      if (error instanceof Error && error.message.includes('มีอยู่ในระบบแล้ว')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Duplicate hospital data',  
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Hospital update failed',
      });
    }
  }

  // ============================================
  // DELETE HOSPITAL (SOFT DELETE)
  // ============================================

  static async deleteHospital(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: HospitalParam = hospitalParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call hospital service
      const result = await HospitalService.deleteHospital(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ลบข้อมูลโรงพยาบาลเรียบร้อยแล้ว',
        data: {
          deletedAt: result.deletedAt,
        },
      });
    } catch (error) {
      console.error('Delete hospital controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบข้อมูลโรงพยาบาล';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรงพยาบาล')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Hospital not found',
        });
        return;
      }

      // Check if it's a "constraint" error (hospital being used)
      if (error instanceof Error && (error.message.includes('มีข้อมูลผู้ป่วย') || error.message.includes('มีผู้ใช้งาน'))) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'Hospital deletion constraint violation',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Hospital deletion failed',
      });
    }
  }

  // ============================================
  // GET HOSPITAL STATISTICS
  // ============================================

  static async getHospitalStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Call hospital service
      const statistics = await HospitalService.getHospitalStatistics();

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสถิติโรงพยาบาลสำเร็จ',
        data: {
          statistics: {
            ...statistics,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Get hospital statistics controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติโรงพยาบาล';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Hospital statistics fetch failed',
      });
    }
  }

  // ============================================
  // GET HOSPITAL CODES MAP (UTILITY ENDPOINT)
  // ============================================

  static async getHospitalCodes(req: Request, res: Response): Promise<void> {
    try {
      // Call hospital service
      const hospitalCodes = await HospitalService.getHospitalCodesMap();

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรหัสโรงพยาบาลสำเร็จ',
        data: {
          hospitalCodes,
          total: Object.keys(hospitalCodes).length,
        },
      });
    } catch (error) {
      console.error('Get hospital codes controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรหัสโรงพยาบาล';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Hospital codes fetch failed',
      });
    }
  }

  // ============================================
  // HEALTH CHECK FOR HOSPITAL ENDPOINTS
  // ============================================

  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const [totalHospitals, statistics] = await Promise.all([
        HospitalService.getHospitalCount(),
        HospitalService.getHospitalStatistics(),
      ]);

      res.status(200).json({
        success: true,
        message: 'Hospital service is healthy',
        data: {
          service: 'hospital-management',
          status: 'operational',
          totalHospitals,
          statistics: {
            byOrganizationType: statistics.byOrganizationType.length,
            byHealthServiceType: statistics.byHealthServiceType.length,
            byAffiliation: statistics.byAffiliation.length,
          },
          timestamp: new Date().toISOString(),
          endpoints: {
            list: 'GET /api/hospitals - List all hospitals',
            detail: 'GET /api/hospitals/:id - Get hospital by ID',
            byCode: 'GET /api/hospitals/code/:code - Get hospital by code',
            codes: 'GET /api/hospitals/codes/map - Get hospital codes map',
            statistics: 'GET /api/hospitals/statistics/summary - Get hospital statistics',
            create: 'POST /api/hospitals - Create new hospital (Superadmin)',
            update: 'PUT /api/hospitals/:id - Update hospital (Superadmin)',
            delete: 'DELETE /api/hospitals/:id - Delete hospital (Superadmin)',
          },
        },
      });
    } catch (error) {
      console.error('Hospital health check error:', error);

      res.status(500).json({
        success: false,
        message: 'Hospital service health check failed',
        error: 'Service unhealthy',
      });
    }
  }
}