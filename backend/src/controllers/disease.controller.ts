// backend/src/controllers/disease.controller.ts

import { Request, Response } from 'express';
import { DiseaseService } from '../services/disease.service';
import {
  createDiseaseSchema,
  updateDiseaseSchema,
  diseaseQuerySchema,
  diseaseParamSchema,
  CreateDiseaseRequest,
  UpdateDiseaseRequest,
  DiseaseQueryParams,
  DiseaseParam,
} from '../schemas/disease.schema';

// ============================================
// DISEASE CONTROLLER CLASS
// ============================================

export class DiseaseController {

  // ============================================
  // GET DISEASES LIST
  // ============================================

  static async getDiseases(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery: DiseaseQueryParams = diseaseQuerySchema.parse(req.query);

      // Call disease service
      const result = await DiseaseService.getDiseases(validatedQuery);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการโรคสำเร็จ',
        data: {
          diseases: result.diseases,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get diseases controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการโรค';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Disease list fetch failed',
      });
    }
  }

  // ============================================
  // GET DISEASE BY ID
  // ============================================

  static async getDiseaseById(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: DiseaseParam = diseaseParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Check if should include symptoms
      const includeSymptoms = req.query.includeSymptoms === 'true';

      // Call disease service
      const disease = await DiseaseService.getDiseaseById(id, includeSymptoms);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลโรคสำเร็จ',
        data: {
          disease,
        },
      });
    } catch (error) {
      console.error('Get disease by ID controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลโรค';

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
        error: 'Disease fetch failed',
      });
    }
  }

  // ============================================
  // CREATE NEW DISEASE
  // ============================================

  static async createDisease(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData: CreateDiseaseRequest = createDiseaseSchema.parse(req.body);

      // Call disease service
      const newDisease = await DiseaseService.createDisease(validatedData);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'สร้างข้อมูลโรคสำเร็จ',
        data: {
          disease: newDisease,
        },
      });
    } catch (error) {
      console.error('Create disease controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างข้อมูลโรค';

      // Check if it's a duplicate error
      if (error instanceof Error && error.message.includes('มีอยู่ในระบบแล้ว')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Duplicate disease data',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Disease creation failed',
      });
    }
  }

  // ============================================
  // UPDATE DISEASE
  // ============================================

  static async updateDisease(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: DiseaseParam = diseaseParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Validate request body
      const validatedData: UpdateDiseaseRequest = updateDiseaseSchema.parse(req.body);

      // Call disease service
      const updatedDisease = await DiseaseService.updateDisease(id, validatedData);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'แก้ไขข้อมูลโรคสำเร็จ',
        data: {
          disease: updatedDisease,
        },
      });
    } catch (error) {
      console.error('Update disease controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลโรค';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรค')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Disease not found',
        });
        return;
      }

      // Check if it's a duplicate error
      if (error instanceof Error && error.message.includes('มีอยู่ในระบบแล้ว')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Duplicate disease data',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Disease update failed',
      });
    }
  }

  // ============================================
  // DELETE DISEASE (SOFT DELETE)
  // ============================================

  static async deleteDisease(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: DiseaseParam = diseaseParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call disease service
      const result = await DiseaseService.deleteDisease(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ลบข้อมูลโรคเรียบร้อยแล้ว',
        data: {
          deletedAt: result.deletedAt,
        },
      });
    } catch (error) {
      console.error('Delete disease controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบข้อมูลโรค';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรค')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Disease not found',
        });
        return;
      }

      // Check if it's a "constraint" error (disease being used)
      if (error instanceof Error && error.message.includes('มีข้อมูลผู้ป่วย')) {
        res.status(400).json({
          success: false,
          message: errorMessage,
          error: 'Disease deletion constraint violation',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Disease deletion failed',
      });
    }
  }

  // ============================================
  // GET DISEASE SYMPTOMS
  // ============================================

  static async getDiseaseSymptoms(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: DiseaseParam = diseaseParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call disease service
      const result = await DiseaseService.getDiseaseSymptoms(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลอาการของโรคสำเร็จ',
        data: {
          diseaseId: result.diseaseId,
          diseaseName: result.diseaseName,
          symptoms: result.symptoms,
          total: result.symptoms.length,
        },
      });
    } catch (error) {
      console.error('Get disease symptoms controller error:', error);

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
  // GET DISEASE STATISTICS
  // ============================================

  static async getDiseaseStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Get basic disease statistics
      const totalDiseases = await DiseaseService.getDiseaseCount();

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสถิติโรคสำเร็จ',
        data: {
          statistics: {
            totalDiseases,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Get disease statistics controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติโรค';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Disease statistics fetch failed',
      });
    }
  }

  // ============================================
  // HEALTH CHECK FOR DISEASE ENDPOINTS
  // ============================================

  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const totalDiseases = await DiseaseService.getDiseaseCount();

      res.status(200).json({
        success: true,
        message: 'Disease service is healthy',
        data: {
          service: 'disease-management',
          status: 'operational',
          totalDiseases,
          timestamp: new Date().toISOString(),
          endpoints: {
            list: 'GET /api/diseases - List all diseases',
            detail: 'GET /api/diseases/:id - Get disease by ID',
            symptoms: 'GET /api/diseases/:id/symptoms - Get disease symptoms',
            create: 'POST /api/diseases - Create new disease (Superadmin)',
            update: 'PUT /api/diseases/:id - Update disease (Superadmin)',
            delete: 'DELETE /api/diseases/:id - Delete disease (Superadmin)',
          },
        },
      });
    } catch (error) {
      console.error('Disease health check error:', error);

      res.status(500).json({
        success: false,
        message: 'Disease service health check failed',
        error: 'Service unhealthy',
      });
    }
  }
}