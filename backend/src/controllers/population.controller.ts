// backend/src/controllers/population.controller.ts

import { Request, Response } from 'express';
import { PopulationService } from '../services/population.service';
import {
  createPopulationSchema,
  updatePopulationSchema,
  populationQuerySchema,
  populationParamSchema,
  hospitalCodeParamSchema,
  yearParamSchema,
  CreatePopulationRequest,
  UpdatePopulationRequest,
  PopulationQueryParams,
  PopulationParam,
  HospitalCodeParam,
  YearParam,
} from '../schemas/population.schema';

// ============================================
// POPULATION CONTROLLER CLASS
// ============================================

export class PopulationController {

  // ============================================
  // GET POPULATIONS LIST
  // ============================================

  static async getPopulations(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedQuery: PopulationQueryParams = populationQuerySchema.parse(req.query);

      // Call population service
      const result = await PopulationService.getPopulations(validatedQuery);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการประชากรสำเร็จ',
        data: {
          populations: result.populations,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Get populations controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการประชากร';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Population list fetch failed',
      });
    }
  }

  // ============================================
  // GET POPULATION BY ID
  // ============================================

  static async getPopulationById(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: PopulationParam = populationParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call population service
      const population = await PopulationService.getPopulationById(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลประชากรสำเร็จ',
        data: {
          population,
        },
      });
    } catch (error) {
      console.error('Get population by ID controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลประชากร';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลประชากร')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Population not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Population fetch failed',
      });
    }
  }

  // ============================================
  // GET POPULATIONS BY HOSPITAL CODE
  // ============================================

  static async getPopulationsByHospitalCode(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: HospitalCodeParam = hospitalCodeParamSchema.parse(req.params);
      const { code } = validatedParams;

      // Call population service
      const populations = await PopulationService.getPopulationsByHospitalCode(code);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลประชากรของโรงพยาบาลสำเร็จ',
        data: {
          hospitalCode: code,
          populations,
          total: populations.length,
        },
      });
    } catch (error) {
      console.error('Get populations by hospital code controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลประชากรของโรงพยาบาล';

      // Check if it's a "hospital not found" error
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
        error: 'Hospital populations fetch failed',
      });
    }
  }

  // ============================================
  // GET POPULATIONS BY YEAR
  // ============================================

  static async getPopulationsByYear(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: YearParam = yearParamSchema.parse(req.params);
      const year = parseInt(validatedParams.year, 10);

      // Additional year validation
      if (year < 2000 || year > new Date().getFullYear() + 5) {
        res.status(400).json({
          success: false,
          message: `ปีต้องอยู่ในช่วง 2000 - ${new Date().getFullYear() + 5}`,
          error: 'Invalid year range',
        });
        return;
      }

      // Call population service
      const populations = await PopulationService.getPopulationsByYear(year);

      // Return success response
      res.status(200).json({
        success: true,
        message: `ดึงข้อมูลประชากรปี ${year} สำเร็จ`,
        data: {
          year,
          populations,
          total: populations.length,
          totalPopulation: populations.reduce((sum, p) => sum + p.count, 0),
        },
      });
    } catch (error) {
      console.error('Get populations by year controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลประชากรของปี';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Year populations fetch failed',
      });
    }
  }

  // ============================================
  // CREATE NEW POPULATION
  // ============================================

  static async createPopulation(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData: CreatePopulationRequest = createPopulationSchema.parse(req.body);

      // Call population service
      const result = await PopulationService.createPopulation(validatedData);

      // Determine response message based on action
      const message = result.action === 'restored' 
        ? 'สร้างข้อมูลประชากรสำเร็จ (กู้คืนจากข้อมูลที่ถูกลบไว้)'
        : 'สร้างข้อมูลประชากรสำเร็จ';

      // Return success response
      res.status(201).json({
        success: true,
        message,
        data: {
          population: result.population,
          info: {
            action: result.action,
            previouslyDeleted: result.previouslyDeleted,
          },
        },
      });
    } catch (error) {
      console.error('Create population controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างข้อมูลประชากร';

      // Check if it's a hospital not found error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลโรงพยาบาล')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Hospital not found',
        });
        return;
      }

      // Check if it's a duplicate error
      if (error instanceof Error && error.message.includes('มีอยู่แล้ว')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Duplicate population data',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Population creation failed',
      });
    }
  }

  // ============================================
  // UPDATE POPULATION
  // ============================================

  static async updatePopulation(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: PopulationParam = populationParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Validate request body
      const validatedData: UpdatePopulationRequest = updatePopulationSchema.parse(req.body);

      // Call population service
      const updatedPopulation = await PopulationService.updatePopulation(id, validatedData);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'แก้ไขข้อมูลประชากรสำเร็จ',
        data: {
          population: updatedPopulation,
        },
      });
    } catch (error) {
      console.error('Update population controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลประชากร';

      // Check if it's a "not found" error
      if (error instanceof Error && (error.message.includes('ไม่พบข้อมูลประชากร') || error.message.includes('ไม่พบข้อมูลโรงพยาบาล'))) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Resource not found',
        });
        return;
      }

      // Check if it's a duplicate error
      if (error instanceof Error && error.message.includes('มีอยู่แล้ว')) {
        res.status(409).json({
          success: false,
          message: errorMessage,
          error: 'Duplicate population data',
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Population update failed',
      });
    }
  }

  // ============================================
  // DELETE POPULATION (SOFT DELETE)
  // ============================================

  static async deletePopulation(req: Request, res: Response): Promise<void> {
    try {
      // Validate URL parameters
      const validatedParams: PopulationParam = populationParamSchema.parse(req.params);
      const { id } = validatedParams;

      // Call population service
      const result = await PopulationService.deletePopulation(id);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ลบข้อมูลประชากรเรียบร้อยแล้ว',
        data: {
          deletedAt: result.deletedAt,
        },
      });
    } catch (error) {
      console.error('Delete population controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบข้อมูลประชากร';

      // Check if it's a "not found" error
      if (error instanceof Error && error.message.includes('ไม่พบข้อมูลประชากร')) {
        res.status(404).json({
          success: false,
          message: errorMessage,
          error: 'Population not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Population deletion failed',
      });
    }
  }

  // ============================================
  // GET POPULATION STATISTICS
  // ============================================

  static async getPopulationStatistics(req: Request, res: Response): Promise<void> {
    try {
      // Call population service
      const statistics = await PopulationService.getPopulationStatistics();

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสถิติประชากรสำเร็จ',
        data: {
          statistics: {
            ...statistics,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Get population statistics controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติประชากร';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Population statistics fetch failed',
      });
    }
  }

  // ============================================
  // GET POPULATION TRENDS (ADDITIONAL ENDPOINT)
  // ============================================

  static async getPopulationTrends(req: Request, res: Response): Promise<void> {
    try {
      // Get hospital code from query if provided
      const hospitalCode = req.query.hospitalCode as string;

      // For now, use the same statistics method
      // In a real application, you might want a separate method for trends
      const statistics = await PopulationService.getPopulationStatistics();

      // Return success response with trends focus
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลแนวโน้มประชากรสำเร็จ',
        data: {
          trends: statistics.trends,
          byYear: statistics.byYear,
          totalRecords: statistics.totalRecords,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Get population trends controller error:', error);

      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลแนวโน้มประชากร';

      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Population trends fetch failed',
      });
    }
  }

  // ============================================
  // HEALTH CHECK FOR POPULATION ENDPOINTS
  // ============================================

  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const [totalPopulations, statistics] = await Promise.all([
        PopulationService.getPopulationCount(),
        PopulationService.getPopulationStatistics(),
      ]);

      res.status(200).json({
        success: true,
        message: 'Population service is healthy',
        data: {
          service: 'population-management',
          status: 'operational',
          totalRecords: totalPopulations,
          totalPopulation: statistics.totalPopulation,
          averagePopulation: statistics.averagePopulation,
          availableYears: statistics.byYear.length,
          timestamp: new Date().toISOString(),
          endpoints: {
            list: 'GET /api/populations - List all populations',
            detail: 'GET /api/populations/:id - Get population by ID',
            byHospital: 'GET /api/populations/hospital/:code - Get populations by hospital',
            byYear: 'GET /api/populations/year/:year - Get populations by year',
            statistics: 'GET /api/populations/statistics/summary - Get population statistics',
            trends: 'GET /api/populations/trends - Get population trends',
            create: 'POST /api/populations - Create new population (Admin+)',
            update: 'PUT /api/populations/:id - Update population (Admin+)',
            delete: 'DELETE /api/populations/:id - Delete population (Admin+)',
          },
        },
      });
    } catch (error) {
      console.error('Population health check error:', error);

      res.status(500).json({
        success: false,
        message: 'Population service health check failed',
        error: 'Service unhealthy',
      });
    }
  }
}