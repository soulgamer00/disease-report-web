// backend/src/controllers/report.controller.ts

import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import {
  baseReportQuerySchema,
  incidenceDataQuerySchema,
  genderDataQuerySchema,
  trendDataQuerySchema,
  populationDataQuerySchema,
  BaseReportQuery,
  IncidenceDataQuery,
  GenderDataQuery,
  TrendDataQuery,
  PopulationDataQuery,
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
          'GET /api/reports/patient-visit-data - Get patient visit data for reports',
          'GET /api/reports/incidence-data - Get incidence rate data',
          'GET /api/reports/gender-data - Get gender ratio data',
          'GET /api/reports/trend-data - Get trend analysis data',
          'GET /api/reports/population-data - Get population data',
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
  // PATIENT VISIT DATA FOR REPORTS
  // ============================================

  static async getPatientVisitData(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const queryParams: BaseReportQuery = baseReportQuerySchema.parse(req.query);

      // Validate date range
      if (queryParams.dateFrom && queryParams.dateTo) {
        await ReportService.validateDateRange(queryParams.dateFrom, queryParams.dateTo);
      }

      // Call service
      const result = await ReportService.getPatientVisitData(queryParams);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลผู้ป่วยสำหรับรายงานสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get patient visit data error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get patient visit data failed',
      });
    }
  }

  // ============================================
  // INCIDENCE RATE DATA
  // ============================================

  static async getIncidenceData(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const queryParams: IncidenceDataQuery = incidenceDataQuerySchema.parse(req.query);

      // Validate date range
      if (queryParams.dateFrom && queryParams.dateTo) {
        await ReportService.validateDateRange(queryParams.dateFrom, queryParams.dateTo);
      }

      // Call service
      const result = await ReportService.getIncidenceData(queryParams);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลอัตราป่วยสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get incidence data error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลอัตราป่วย';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get incidence data failed',
      });
    }
  }

  // ============================================
  // GENDER RATIO DATA
  // ============================================

  static async getGenderData(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const queryParams: GenderDataQuery = genderDataQuerySchema.parse(req.query);

      // Validate date range
      if (queryParams.dateFrom && queryParams.dateTo) {
        await ReportService.validateDateRange(queryParams.dateFrom, queryParams.dateTo);
      }

      // Call service
      const result = await ReportService.getGenderData(queryParams);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลอัตราส่วนเพศสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get gender data error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลอัตราส่วนเพศ';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get gender data failed',
      });
    }
  }

  // ============================================
  // TREND ANALYSIS DATA
  // ============================================

  static async getTrendData(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const queryParams: TrendDataQuery = trendDataQuerySchema.parse(req.query);

      // Validate date range
      if (queryParams.dateFrom && queryParams.dateTo) {
        await ReportService.validateDateRange(queryParams.dateFrom, queryParams.dateTo);
      }

      // Call service
      const result = await ReportService.getTrendData(queryParams);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลแนวโน้มสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get trend data error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลแนวโน้ม';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get trend data failed',
      });
    }
  }

  // ============================================
  // POPULATION DATA
  // ============================================

  static async getPopulationData(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const queryParams: PopulationDataQuery = populationDataQuerySchema.parse(req.query);

      // Call service
      const result = await ReportService.getPopulationData(queryParams);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลประชากรสำเร็จ',
        data: result,
      });
    } catch (error) {
      console.error('Get population data error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลประชากร';
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        error: 'Get population data failed',
      });
    }
  }

  // ============================================
  // UTILITY ENDPOINTS
  // ============================================

  static async getAvailableFilters(req: Request, res: Response): Promise<void> {
    try {
      // Get available filter options (can be cached)
      const filterOptions = {
        dateRange: {
          minDate: '2020-01-01',
          maxDate: new Date().toISOString().split('T')[0],
        },
        groupByOptions: {
          incidence: ['month', 'quarter', 'year', 'hospital', 'disease'],
          gender: ['age_group', 'hospital', 'disease', 'month'],
          trend: ['day', 'week', 'month', 'quarter', 'year'],
          population: ['hospital', 'year', 'age_group', 'gender'],
        },
        ageGroups: [
          { label: '0-4 ปี', value: '0-4' },
          { label: '5-14 ปี', value: '5-14' },
          { label: '15-24 ปี', value: '15-24' },
          { label: '25-34 ปี', value: '25-34' },
          { label: '35-44 ปี', value: '35-44' },
          { label: '45-54 ปี', value: '45-54' },
          { label: '55-64 ปี', value: '55-64' },
          { label: '65+ ปี', value: '65+' },
        ],
        genderOptions: [
          { label: 'ชาย', value: 'M' },
          { label: 'หญิง', value: 'F' },
        ],
      };

      res.status(200).json({
        success: true,
        message: 'ดึงตัวเลือกการกรองข้อมูลสำเร็จ',
        data: filterOptions,
      });
    } catch (error) {
      console.error('Get filter options error:', error);
      
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงตุตัวเลือกการกรองข้อมูล',
        error: 'Get filter options failed',
      });
    }
  }
}