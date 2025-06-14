// backend/src/services/report.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  BaseReportQuery,
  IncidenceDataQuery,
  GenderDataQuery,
  TrendDataQuery,
  PopulationDataQuery,
  PatientVisitDataItem,
  PopulationDataItem,
  AggregatedCountData,
} from '../schemas/report.schema';

// ============================================
// REPORT SERVICE CLASS
// ============================================

export class ReportService {

  // ============================================
  // PATIENT VISIT DATA FOR REPORTS
  // ============================================

  static async getPatientVisitData(queryParams: BaseReportQuery): Promise<{
    items: PatientVisitDataItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { 
        dateFrom, 
        dateTo, 
        hospitalCode, 
        hospitalId, 
        diseaseId, 
        gender, 
        ageMin, 
        ageMax, 
        page = 1, 
        limit = 1000 
      } = queryParams;

      // Build where conditions
      const whereConditions: Prisma.PatientVisitWhereInput = {
        isActive: true,
      };

      // Date range filter
      if (dateFrom || dateTo) {
        whereConditions.illnessDate = {};
        if (dateFrom) whereConditions.illnessDate.gte = dateFrom;
        if (dateTo) whereConditions.illnessDate.lte = dateTo;
      }

      // Hospital filters
      if (hospitalCode) {
        whereConditions.hospitalCode9eDigit = hospitalCode;
      }
      if (hospitalId) {
        whereConditions.hospital = { id: hospitalId };
      }

      // Disease filter
      if (diseaseId) {
        whereConditions.diseaseId = diseaseId;
      }

      // Gender filter
      if (gender) {
        whereConditions.gender = gender === 'M' ? 'MALE' : 'FEMALE';
      }

      // Age range filter
      if (ageMin !== undefined || ageMax !== undefined) {
        whereConditions.ageAtIllness = {};
        if (ageMin !== undefined) whereConditions.ageAtIllness.gte = ageMin;
        if (ageMax !== undefined) whereConditions.ageAtIllness.lte = ageMax;
      }

      // Execute queries
      const [patientVisits, totalCount] = await Promise.all([
        prisma.patientVisit.findMany({
          where: whereConditions,
          select: {
            id: true,
            hospitalCode9eDigit: true,
            diseaseId: true,
            gender: true,
            ageAtIllness: true,
            illnessDate: true,
            hospital: {
              select: {
                hospitalName: true,
              },
            },
            disease: {
              select: {
                thaiName: true,
              },
            },
          },
          orderBy: { illnessDate: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.patientVisit.count({ where: whereConditions }),
      ]);

      // Transform data
      const items: PatientVisitDataItem[] = patientVisits.map(visit => {
        const illnessDate = new Date(visit.illnessDate);
        return {
          id: visit.id,
          hospitalCode: visit.hospitalCode9eDigit,
          hospitalName: visit.hospital.hospitalName,
          diseaseId: visit.diseaseId,
          diseaseName: visit.disease.thaiName,
          patientGender: visit.gender === 'MALE' ? 'M' : 'F',
          ageAtIllness: visit.ageAtIllness,
          illnessDate: illnessDate,
          month: `${illnessDate.getFullYear()}-${String(illnessDate.getMonth() + 1).padStart(2, '0')}`,
          year: illnessDate.getFullYear(),
          quarter: `Q${Math.floor(illnessDate.getMonth() / 3) + 1}-${illnessDate.getFullYear()}`,
        };
      });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        items,
        total: totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Get patient visit data service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วยสำหรับรายงาน');
    }
  }

  // ============================================
  // INCIDENCE RATE DATA
  // ============================================

  static async getIncidenceData(queryParams: IncidenceDataQuery): Promise<{
    items: PatientVisitDataItem[];
    aggregated: AggregatedCountData[];
    total: number;
  }> {
    try {
      const { groupBy = 'month', ...baseQuery } = queryParams;

      // Get base patient visit data
      const baseData = await this.getPatientVisitData(baseQuery);

      // Group data for aggregation
      let groupByField: string;
      switch (groupBy) {
        case 'month':
          groupByField = 'month';
          break;
        case 'quarter':
          groupByField = 'quarter';
          break;
        case 'year':
          groupByField = 'year';
          break;
        case 'hospital':
          groupByField = 'hospitalCode';
          break;
        case 'disease':
          groupByField = 'diseaseId';
          break;
        default:
          groupByField = 'month';
      }

      // Aggregate data
      const aggregatedMap = new Map<string, {
        count: number;
        hospitalCode?: string;
        hospitalName?: string;
        diseaseId?: string;
        diseaseName?: string;
      }>();

      baseData.items.forEach(item => {
        const key = groupByField === 'month' ? item.month :
                   groupByField === 'quarter' ? item.quarter :
                   groupByField === 'year' ? item.year.toString() :
                   groupByField === 'hospital' ? item.hospitalCode :
                   groupByField === 'disease' ? item.diseaseId :
                   item.month;

        if (!aggregatedMap.has(key)) {
          aggregatedMap.set(key, {
            count: 0,
            hospitalCode: groupByField === 'hospital' ? item.hospitalCode : undefined,
            hospitalName: groupByField === 'hospital' ? item.hospitalName : undefined,
            diseaseId: groupByField === 'disease' ? item.diseaseId : undefined,
            diseaseName: groupByField === 'disease' ? item.diseaseName : undefined,
          });
        }
        
        const group = aggregatedMap.get(key)!;
        group.count++;
      });

      // Convert to array
      const aggregated: AggregatedCountData[] = Array.from(aggregatedMap.entries()).map(
        ([key, data]) => ({
          groupKey: groupByField,
          groupValue: key,
          count: data.count,
          hospitalCode: data.hospitalCode,
          hospitalName: data.hospitalName,
          diseaseId: data.diseaseId,
          diseaseName: data.diseaseName,
        })
      );

      return {
        items: baseData.items,
        aggregated,
        total: baseData.total,
      };
    } catch (error) {
      console.error('Get incidence data service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลอัตราป่วย');
    }
  }

  // ============================================
  // GENDER RATIO DATA
  // ============================================

  static async getGenderData(queryParams: GenderDataQuery): Promise<{
    items: PatientVisitDataItem[];
    aggregated: AggregatedCountData[];
    total: number;
  }> {
    try {
      const { groupBy = 'age_group', ...baseQuery } = queryParams;

      // Get base patient visit data
      const baseData = await this.getPatientVisitData(baseQuery);

      // Group data by age groups and gender
      const aggregatedMap = new Map<string, {
        maleCount: number;
        femaleCount: number;
        hospitalCode?: string;
        hospitalName?: string;
        diseaseId?: string;
        diseaseName?: string;
      }>();

      baseData.items.forEach(item => {
        let key: string;
        
        if (groupBy === 'age_group') {
          // Age grouping logic
          const age = item.ageAtIllness;
          if (age < 5) key = '0-4';
          else if (age < 15) key = '5-14';
          else if (age < 25) key = '15-24';
          else if (age < 35) key = '25-34';
          else if (age < 45) key = '35-44';
          else if (age < 55) key = '45-54';
          else if (age < 65) key = '55-64';
          else key = '65+';
        } else if (groupBy === 'hospital') {
          key = item.hospitalCode;
        } else if (groupBy === 'disease') {
          key = item.diseaseId;
        } else if (groupBy === 'month') {
          key = item.month;
        } else {
          key = '0-4'; // Default age group
        }

        if (!aggregatedMap.has(key)) {
          aggregatedMap.set(key, {
            maleCount: 0,
            femaleCount: 0,
            hospitalCode: groupBy === 'hospital' ? item.hospitalCode : undefined,
            hospitalName: groupBy === 'hospital' ? item.hospitalName : undefined,
            diseaseId: groupBy === 'disease' ? item.diseaseId : undefined,
            diseaseName: groupBy === 'disease' ? item.diseaseName : undefined,
          });
        }
        
        const group = aggregatedMap.get(key)!;
        if (item.patientGender === 'M') {
          group.maleCount++;
        } else if (item.patientGender === 'F') {
          group.femaleCount++;
        }
      });

      // Convert to array with separate male/female entries
      const aggregated: AggregatedCountData[] = [];
      aggregatedMap.forEach((data, key) => {
        // Male entry
        aggregated.push({
          groupKey: `${groupBy}_male`,
          groupValue: key,
          count: data.maleCount,
          hospitalCode: data.hospitalCode,
          hospitalName: data.hospitalName,
          diseaseId: data.diseaseId,
          diseaseName: data.diseaseName,
        });
        
        // Female entry
        aggregated.push({
          groupKey: `${groupBy}_female`,
          groupValue: key,
          count: data.femaleCount,
          hospitalCode: data.hospitalCode,
          hospitalName: data.hospitalName,
          diseaseId: data.diseaseId,
          diseaseName: data.diseaseName,
        });
      });

      return {
        items: baseData.items,
        aggregated,
        total: baseData.total,
      };
    } catch (error) {
      console.error('Get gender data service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลอัตราส่วนเพศ');
    }
  }

  // ============================================
  // TREND ANALYSIS DATA
  // ============================================

  static async getTrendData(queryParams: TrendDataQuery): Promise<{
    items: PatientVisitDataItem[];
    aggregated: AggregatedCountData[];
    total: number;
  }> {
    try {
      const { groupBy = 'month', trendType = 'patient_count', ...baseQuery } = queryParams;

      // Get base patient visit data
      const baseData = await this.getPatientVisitData(baseQuery);

      // Group data for trend analysis
      const aggregatedMap = new Map<string, number>();

      baseData.items.forEach(item => {
        const illnessDate = new Date(item.illnessDate);
        let key: string;

        switch (groupBy) {
          case 'day':
            key = illnessDate.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(illnessDate);
            weekStart.setDate(illnessDate.getDate() - illnessDate.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = item.month;
            break;
          case 'quarter':
            key = item.quarter;
            break;
          case 'year':
            key = item.year.toString();
            break;
          default:
            key = item.month;
        }

        aggregatedMap.set(key, (aggregatedMap.get(key) || 0) + 1);
      });

      // Convert to array and sort by date
      const aggregated: AggregatedCountData[] = Array.from(aggregatedMap.entries())
        .map(([key, count]) => ({
          groupKey: groupBy,
          groupValue: key,
          count,
        }))
        .sort((a, b) => a.groupValue.localeCompare(b.groupValue));

      return {
        items: baseData.items,
        aggregated,
        total: baseData.total,
      };
    } catch (error) {
      console.error('Get trend data service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลแนวโน้ม');
    }
  }

  // ============================================
  // POPULATION DATA
  // ============================================

  static async getPopulationData(queryParams: PopulationDataQuery): Promise<{
    items: PopulationDataItem[];
    total: number;
    year: number;
  }> {
    try {
      const { year, hospitalCode, hospitalId, groupBy = 'hospital' } = queryParams;

      // Build where conditions
      const whereConditions: Prisma.PopulationWhereInput = {
        isActive: true,
        year,
      };

      // Hospital filters
      if (hospitalCode) {
        whereConditions.hospitalCode9eDigit = hospitalCode;
      }
      if (hospitalId) {
        whereConditions.hospital = { id: hospitalId };
      }

      // Execute query
      const [populations, totalCount] = await Promise.all([
        prisma.population.findMany({
          where: whereConditions,
          include: {
            hospital: {
              select: {
                hospitalName: true,
              },
            },
          },
          orderBy: { hospitalCode9eDigit: 'asc' },
        }),
        prisma.population.count({ where: whereConditions }),
      ]);

      // Transform data
      const items: PopulationDataItem[] = populations.map(pop => ({
        id: pop.id,
        hospitalCode: pop.hospitalCode9eDigit,
        hospitalName: pop.hospital.hospitalName,
        year: pop.year,
        totalPopulation: pop.count,
      }));

      return {
        items,
        total: totalCount,
        year,
      };
    } catch (error) {
      console.error('Get population data service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลประชากร');
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  static async validateDateRange(dateFrom?: Date, dateTo?: Date): Promise<boolean> {
    if (!dateFrom || !dateTo) return true;
    
    // Check if dateFrom is before dateTo
    if (dateFrom > dateTo) {
      throw new Error('วันที่เริ่มต้นต้องมาก่อนวันที่สิ้นสุด');
    }
    
    // Check if date range is not too large (e.g., max 5 years)
    const fiveYearsInMs = 5 * 365 * 24 * 60 * 60 * 1000;
    if (dateTo.getTime() - dateFrom.getTime() > fiveYearsInMs) {
      throw new Error('ช่วงวันที่ต้องไม่เกิน 5 ปี');
    }
    
    return true;
  }

  static async validateHospitalAccess(hospitalCode: string, userHospitalCode?: string): Promise<boolean> {
    // If no user hospital code provided, allow access (for public endpoints)
    if (!userHospitalCode) return true;
    
    // If user hospital code matches requested hospital code, allow access
    return hospitalCode === userHospitalCode;
  }
}