// backend/src/controllers/symptom.controller.ts

import { Request, Response } from 'express';
import { SymptomService } from '../services/symptom.service';
import {
  createSymptomSchema,
  updateSymptomSchema,
  symptomQuerySchema,
  symptomParamSchema,
  diseaseParamSchema,
  CreateSymptomRequest,
  UpdateSymptomRequest,
  SymptomQueryParams,
  SymptomParam,
  DiseaseParam,
} from '../schemas/symptom.schema';

// ============================================
// SYMPTOM CONTROLLER CLASS
// ============================================

export class SymptomController {

  // ============================================
  // GET SYMPTOMS LIST
  // ============================================

  static async getSymptoms(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery: SymptomQueryParams = symptomQuerySchema.parse(req.query);

      // Call symptom service
      const result = await SymptomService.getSymptoms(validatedQuery);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการอาการสำเร็จ',
        data: {
          symptoms: result.symptoms,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get symptoms controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการอาการ';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Symptom list fetch failed',
      });
    }
  }

  // ============================================
  // GET SYMPTOM BY ID
  // ============================================

  static async getSymptomById(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: SymptomParam = symptomParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call symptom service
      const symptom = await SymptomService.getSymptomById(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลอาการสำเร็จ',
        data: {
          symptom,
        },
      });
    } catch (error) {
      console.error('Get symptom by ID controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลอาการ';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลอาการ')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Symptom not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Symptom fetch failed',
      });
    }
  }

  // ============================================
  // GET SYMPTOMS BY DISEASE ID
  // ============================================

  static async getSymptomsByDiseaseId(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: DiseaseParam = diseaseParamSchema.parse(req.params);
      const { diseaseId } = validatedParams;

      // Call symptom service
      const result = await SymptomService.getSymptomsByDiseaseId(diseaseId);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลอาการของโรคสำเร็จ',
        data: {
          diseaseId: result.diseaseId,
          diseaseName: result.diseaseName,
          symptoms: result.symptoms,
          total: result.total,
        },
      });
    } catch (error) {
      console.error('Get symptoms by disease ID controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลอาการของโรค';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรค')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Disease not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Disease symptoms fetch failed',
      });
    }
  }

  // ============================================
  // CREATE NEW SYMPTOM
  // ============================================

  static async createSymptom(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData: CreateSymptomRequest = createSymptomSchema.parse(req.body);

      // Call symptom service
      const newSymptom = await SymptomService.createSymptom(validatedData);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'สร้างข้อมูลอาการสำเร็จ',
        data: {
          symptom: newSymptom,
        },
      });
    } catch (error) {
      console.error('Create symptom controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างข้อมูลอาการ';

      // Check if it's a disease not found error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรค')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Disease not found',
        });
        return;
      }

      // Check if it's a duplicate error
      if (error instanceof Error && error.message.includes('มีอยู่ใน')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Duplicate symptom data',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Symptom creation failed',
      });
    }
  }

  // ============================================
  // UPDATE SYMPTOM
  // ============================================

  static async updateSymptom(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: SymptomParam = symptomParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Validate request body
      const validatedData: UpdateSymptomRequest = updateSymptomSchema.parse(req.body);

      // Call symptom service
      const updatedSymptom = await SymptomService.updateSymptom(id, validatedData);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'แก้ไขข้อมูลอาการสำเร็จ',
        data: {
          symptom: updatedSymptom,
        },
      });
    } catch (error) {
      console.error('Update symptom controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลอาการ';

      // Check if it's a "not found" error
      if (error instanceof Error && (error.message.includes('ไม่พบข้อมูลอาการ') || error.message.includes('ไม่พบข้อมูลโรค'))) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Resource not found',
        });
        return;
      }

      // Check if it's a duplicate error
      if (error instanceof Error && error.message.includes('มีอยู่ใน')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Duplicate symptom data',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Symptom update failed',
      });
    }
  }

  // ============================================
  // DELETE SYMPTOM (SOFT DELETE)
  // ============================================

  static async deleteSymptom(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: SymptomParam = symptomParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call symptom service
      const result = await SymptomService.deleteSymptom(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ลบข้อมูลอาการเรียบร้อยแล้ว',
        data: {
          deletedAt: result.deletedAt,
        },
      });
    } catch (error) {
      console.error('Delete symptom controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบข้อมูลอาการ';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลอาการ')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Symptom not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Symptom deletion failed',
      });
    }
  }

  // ============================================
  // GET SYMPTOM STATISTICS
  // ============================================

  static async getSymptomStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Get basic symptom statistics
      const [totalSymptoms, symptomsByDisease] = await Promise.all([
        SymptomService.getSymptomCount(),
        SymptomService.getSymptomCountByDisease(),
      ]);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสถิติอาการสำเร็จ',
        data: {
          statistics: {
            totalSymptoms,
            symptomsByDisease,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Get symptom statistics controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติอาการ';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Symptom statistics fetch failed',
      });
    }
  }

  // ============================================
  // HEALTH CHECK FOR SYMPTOM ENDPOINTS
  // ============================================

  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const totalSymptoms = await SymptomService.getSymptomCount();

      res.status(200).json({
        success: true,
        message: 'Symptom service is healthy',
        data: {
          service: 'symptom-management',
          status: 'operational',
          totalSymptoms,
          timestamp: new Date().toISOString(),
          endpoints: {
            list: 'GET /api/symptoms - List all symptoms',
            detail: 'GET /api/symptoms/:id - Get symptom by ID',
            byDisease: 'GET /api/symptoms/disease/:diseaseId - Get symptoms by disease',
            create: 'POST /api/symptoms - Create new symptom (Superadmin)',
            update: 'PUT /api/symptoms/:id - Update symptom (Superadmin)',
            delete: 'DELETE /api/symptoms/:id - Delete symptom (Superadmin)',
            statistics: 'GET /api/symptoms/statistics/summary - Get symptom statistics',
          },
        },
      });
    } catch (error) {
      console.error('Symptom health check error:', error);

      res.status(500).json({
        success: false,
        message: 'Symptom service health check failed',
        error: 'Service unhealthy',
      });
    }
  }
}