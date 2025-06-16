// backend/src/controllers/report.controller.ts

import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import {
  reportFiltersSchema,
  ageGroupsReportRequestSchema,
  genderRatioReportRequestSchema,
  incidenceRatesReportRequestSchema,
  occupationReportRequestSchema,
  ReportFilters,
} from '../schemas/report.schema';

// ============================================
// REPORT CONTROLLER CLASS
// ============================================

export class ReportController {

  // ============================================
  // HEALTH CHECK
  // ============================================

  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Report service is running',
        timestamp: new Date().toISOString(),
        endpoints: [
          'GET /api/reports/age-groups - Get age groups report',
          'GET /api/reports/gender-ratio - Get gender ratio report',
          'GET /api/reports/incidence-rates - Get incidence rates report',
          'GET /api/reports/occupation - Get occupation report',
          'GET /api/reports/diseases - Get diseases list',
          'GET /api/reports/hospitals - Get hospitals list',
          'GET /api/reports/public-stats - Get public statistics',
        ],
      });
    } catch (error) {
      console.error('Report health check error:', error);
      res.status(500).json({
        success: false,
        message: 'Report service health check failed',
        error: 'Health check failed',
      });
    }
  }

  // ============================================
  // AGE GROUPS REPORT
  // ============================================

  static async getAgeGroupsReport(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const filters: ReportFilters = ageGroupsReportRequestSchema.parse(req.query);

      // Call service
      const result = await ReportService.getAgeGroupsReport(filters);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายงานกลุ่มอายุสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get age groups report error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานกลุ่มอายุ';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get age groups report failed',
      });
    }
  }

  // ============================================
  // GENDER RATIO REPORT
  // ============================================

  static async getGenderRatioReport(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const filters: ReportFilters = genderRatioReportRequestSchema.parse(req.query);

      // Call service
      const result = await ReportService.getGenderRatioReport(filters);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายงานอัตราส่วนเพศสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get gender ratio report error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานอัตราส่วนเพศ';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get gender ratio report failed',
      });
    }
  }

  // ============================================
  // INCIDENCE RATES REPORT
  // ============================================

  static async getIncidenceRatesReport(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const filters: ReportFilters = incidenceRatesReportRequestSchema.parse(req.query);

      // Call service
      const result = await ReportService.getIncidenceRatesReport(filters);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายงานอัตราป่วยสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get incidence rates report error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานอัตราป่วย';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get incidence rates report failed',
      });
    }
  }

  // ============================================
  // OCCUPATION REPORT
  // ============================================

  static async getOccupationReport(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const filters: ReportFilters = occupationReportRequestSchema.parse(req.query);

      // Call service
      const result = await ReportService.getOccupationReport(filters);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายงานอาชีพสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get occupation report error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายงานอาชีพ';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get occupation report failed',
      });
    }
  }

  // ============================================
  // UTILITY ENDPOINTS
  // ============================================

  /**
   * Get all diseases for dropdown
   */
  static async getDiseases(req: Request, res: Response): Promise<void> {
    try {
      const diseases = await ReportService.getAllDiseases();

      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการโรคสำเร็จ',
        data: {
          diseases,
          total: diseases.length,
        },
      });
    } catch (error) {
      console.error('Get diseases error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการโรค';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Get diseases failed',
      });
    }
  }

  /**
   * Get all hospitals for dropdown
   */
  static async getHospitals(req: Request, res: Response): Promise<void> {
    try {
      const hospitals = await ReportService.getHospitals();

      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการโรงพยาบาลสำเร็จ',
        data: {
          hospitals,
          total: hospitals.length,
        },
      });
    } catch (error) {
      console.error('Get hospitals error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการโรงพยาบาล';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Get hospitals failed',
      });
    }
  }

  /**
   * Get public statistics
   */
  static async getPublicStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await ReportService.getPublicStats();

      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลสถิติทั่วไปสำเร็จ',
        data: stats,
      });
    } catch (error) {
      console.error('Get public stats error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติทั่วไป';
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: 'Get public stats failed',
      });
    }
  }
}