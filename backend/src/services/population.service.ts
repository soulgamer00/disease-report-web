// backend/src/services/population.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HospitalService } from './hospital.service';
import {
  CreatePopulationRequest,
  UpdatePopulationRequest,
  PopulationQueryParams,
  PopulationInfo,
} from '../schemas/population.schema';

// ============================================
// POPULATION SERVICE CLASS
// ============================================

export class PopulationService {

  // ============================================
  // GET POPULATIONS LIST WITH PAGINATION
  // ============================================

  static async getPopulations(queryParams: PopulationQueryParams): Promise<{
    populations: PopulationInfo[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { 
      page, 
      limit, 
      search, 
      year, 
      hospitalCode9eDigit, 
      startYear, 
      endYear, 
      sortBy, 
      sortOrder, 
      isActive 
    } = queryParams;

    // Build search conditions
    const searchConditions: Prisma.PopulationWhereInput = {
      isActive: isActive !== undefined ? isActive : true, // Default to active only
    };

    // Add year filter
    if (year) {
      searchConditions.year = year;
    } else if (startYear || endYear) {
      searchConditions.year = {};
      if (startYear) {
        searchConditions.year.gte = startYear;
      }
      if (endYear) {
        searchConditions.year.lte = endYear;
      }
    }

    // Add hospital filter
    if (hospitalCode9eDigit) {
      searchConditions.hospitalCode9eDigit = hospitalCode9eDigit;
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      searchConditions.OR = [
        { hospitalCode9eDigit: { contains: search, mode: 'insensitive' } },
        { hospital: { hospitalName: { contains: search, mode: 'insensitive' } } },
        { hospital: { organizationType: { contains: search, mode: 'insensitive' } } },
        { hospital: { healthServiceType: { contains: search, mode: 'insensitive' } } },
        { year: { equals: parseInt(search) || 0 } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: Prisma.PopulationOrderByWithRelationInput = {};
    if (sortBy === 'year' || sortBy === 'count') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    try {
      // Execute queries in parallel
      const [populations, totalCount] = await Promise.all([
        prisma.population.findMany({
          where: searchConditions,
          orderBy,
          skip,
          take: limit,
          include: {
            hospital: {
              select: {
                id: true,
                hospitalName: true,
                hospitalCode9eDigit: true,
                organizationType: true,
                healthServiceType: true,
              },
            },
          },
        }),
        prisma.population.count({
          where: searchConditions,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Transform data to match response schema
      const transformedPopulations: PopulationInfo[] = populations.map(population => ({
        id: population.id,
        year: population.year,
        hospitalCode9eDigit: population.hospitalCode9eDigit,
        count: population.count,
        isActive: population.isActive,
        createdAt: population.createdAt,
        updatedAt: population.updatedAt,
        hospital: population.hospital,
      }));

      return {
        populations: transformedPopulations,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      console.error('Population list service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการประชากร');
    }
  }

  // ============================================
  // GET POPULATION BY ID
  // ============================================

  static async getPopulationById(populationId: string): Promise<PopulationInfo> {
    try {
      const population = await prisma.population.findFirst({
        where: {
          id: populationId,
          isActive: true,
        },
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              hospitalCode9eDigit: true,
              organizationType: true,
              healthServiceType: true,
            },
          },
        },
      });

      if (!population) {
        throw new Error('ไม่พบข้อมูลประชากรที่ระบุ');
      }

      // Transform data to match response schema
      const transformedPopulation: PopulationInfo = {
        id: population.id,
        year: population.year,
        hospitalCode9eDigit: population.hospitalCode9eDigit,
        count: population.count,
        isActive: population.isActive,
        createdAt: population.createdAt,
        updatedAt: population.updatedAt,
        hospital: population.hospital,
      };

      return transformedPopulation;
    } catch (error) {
      console.error('Get population by ID service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลประชากร');
    }
  }

  // ============================================
  // GET POPULATIONS BY HOSPITAL CODE
  // ============================================

  static async getPopulationsByHospitalCode(hospitalCode: string): Promise<PopulationInfo[]> {
    try {
      // Validate hospital exists
      const hospitalExists = await HospitalService.validateHospitalCodeExists(hospitalCode);
      if (!hospitalExists) {
        throw new Error('ไม่พบข้อมูลโรงพยาบาลที่ระบุ');
      }

      const populations = await prisma.population.findMany({
        where: {
          hospitalCode9eDigit: hospitalCode,
          isActive: true,
        },
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              hospitalCode9eDigit: true,
              organizationType: true,
              healthServiceType: true,
            },
          },
        },
        orderBy: { year: 'desc' },
      });

      // Transform data to match response schema
      const transformedPopulations: PopulationInfo[] = populations.map(population => ({
        id: population.id,
        year: population.year,
        hospitalCode9eDigit: population.hospitalCode9eDigit,
        count: population.count,
        isActive: population.isActive,
        createdAt: population.createdAt,
        updatedAt: population.updatedAt,
        hospital: population.hospital,
      }));

      return transformedPopulations;
    } catch (error) {
      console.error('Get populations by hospital code service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลประชากรของโรงพยาบาล');
    }
  }

  // ============================================
  // GET POPULATIONS BY YEAR
  // ============================================

  static async getPopulationsByYear(year: number): Promise<PopulationInfo[]> {
    try {
      const populations = await prisma.population.findMany({
        where: {
          year,
          isActive: true,
        },
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              hospitalCode9eDigit: true,
              organizationType: true,
              healthServiceType: true,
            },
          },
        },
        orderBy: { count: 'desc' },
      });

      // Transform data to match response schema
      const transformedPopulations: PopulationInfo[] = populations.map(population => ({
        id: population.id,
        year: population.year,
        hospitalCode9eDigit: population.hospitalCode9eDigit,
        count: population.count,
        isActive: population.isActive,
        createdAt: population.createdAt,
        updatedAt: population.updatedAt,
        hospital: population.hospital,
      }));

      return transformedPopulations;
    } catch (error) {
      console.error('Get populations by year service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลประชากรของปี ' + year);
    }
  }

  // ============================================
  // CREATE OR RESTORE POPULATION
  // ============================================

  static async createPopulation(populationData: CreatePopulationRequest): Promise<{
    population: PopulationInfo;
    action: 'created' | 'restored';
    previouslyDeleted: boolean;
  }> {
    const { year, hospitalCode9eDigit, count } = populationData;

    try {
      // Validate hospital exists
      const hospitalExists = await HospitalService.validateHospitalCodeExists(hospitalCode9eDigit);
      if (!hospitalExists) {
        throw new Error('ไม่พบข้อมูลโรงพยาบาลที่ระบุ');
      }

      // Check for existing active record
      const existingActive = await prisma.population.findFirst({
        where: {
          year,
          hospitalCode9eDigit,
          isActive: true,
        },
      });

      if (existingActive) {
        throw new Error(`ข้อมูลประชากรปี ${year} ของโรงพยาบาลนี้มีอยู่แล้ว หากต้องการแก้ไขกรุณาใช้ฟังก์ชันแก้ไข`);
      }

      // Check for soft deleted record
      const deletedRecord = await prisma.population.findFirst({
        where: {
          year,
          hospitalCode9eDigit,
          isActive: false,
        },
      });

      let resultPopulation;
      let action: 'created' | 'restored';
      let previouslyDeleted: boolean;

      if (deletedRecord) {
        // Restore and update the soft deleted record
        resultPopulation = await prisma.population.update({
          where: { id: deletedRecord.id },
          data: {
            count,
            isActive: true,
          },
          include: {
            hospital: {
              select: {
                id: true,
                hospitalName: true,
                hospitalCode9eDigit: true,
                organizationType: true,
                healthServiceType: true,
              },
            },
          },
        });
        action = 'restored';
        previouslyDeleted = true;
      } else {
        // Create new record
        resultPopulation = await prisma.population.create({
          data: {
            year,
            hospitalCode9eDigit,
            count,
          },
          include: {
            hospital: {
              select: {
                id: true,
                hospitalName: true,
                hospitalCode9eDigit: true,
                organizationType: true,
                healthServiceType: true,
              },
            },
          },
        });
        action = 'created';
        previouslyDeleted = false;
      }

      // Transform data to match response schema
      const transformedPopulation: PopulationInfo = {
        id: resultPopulation.id,
        year: resultPopulation.year,
        hospitalCode9eDigit: resultPopulation.hospitalCode9eDigit,
        count: resultPopulation.count,
        isActive: resultPopulation.isActive,
        createdAt: resultPopulation.createdAt,
        updatedAt: resultPopulation.updatedAt,
        hospital: resultPopulation.hospital,
      };

      return {
        population: transformedPopulation,
        action,
        previouslyDeleted,
      };
    } catch (error) {
      console.error('Create population service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลประชากร');
    }
  }

  // ============================================
  // UPDATE POPULATION
  // ============================================

  static async updatePopulation(populationId: string, updateData: UpdatePopulationRequest): Promise<PopulationInfo> {
    try {
      // Check if population exists and is active
      const existingPopulation = await prisma.population.findFirst({
        where: {
          id: populationId,
          isActive: true,
        },
      });

      if (!existingPopulation) {
        throw new Error('ไม่พบข้อมูลประชากรที่ต้องการแก้ไข');
      }

      // If updating hospital code, validate it exists
      if (updateData.hospitalCode9eDigit && updateData.hospitalCode9eDigit !== existingPopulation.hospitalCode9eDigit) {
        const hospitalExists = await HospitalService.validateHospitalCodeExists(updateData.hospitalCode9eDigit);
        if (!hospitalExists) {
          throw new Error('ไม่พบข้อมูลโรงพยาบาลที่ระบุ');
        }
      }

      // Check for duplicate if updating year or hospital
      if (updateData.year || updateData.hospitalCode9eDigit) {
        const targetYear = updateData.year || existingPopulation.year;
        const targetHospitalCode = updateData.hospitalCode9eDigit || existingPopulation.hospitalCode9eDigit;

        const duplicatePopulation = await prisma.population.findFirst({
          where: {
            year: targetYear,
            hospitalCode9eDigit: targetHospitalCode,
            isActive: true,
            id: { not: populationId }, // Exclude current record
          },
        });

        if (duplicatePopulation) {
          throw new Error(`ข้อมูลประชากรปี ${targetYear} ของโรงพยาบาลนี้มีอยู่แล้ว`);
        }
      }

      // Prepare update data
      const updatePayload: Prisma.PopulationUpdateInput = {};
      
      if (updateData.year !== undefined) {
        updatePayload.year = updateData.year;
      }
      if (updateData.hospitalCode9eDigit !== undefined) {
        updatePayload.hospital = {
          connect: { hospitalCode9eDigit: updateData.hospitalCode9eDigit }
        };
      }
      if (updateData.count !== undefined) {
        updatePayload.count = updateData.count;
      }

      // Update population
      const updatedPopulation = await prisma.population.update({
        where: { id: populationId },
        data: updatePayload,
        include: {
          hospital: {
            select: {
              id: true,
              hospitalName: true,
              hospitalCode9eDigit: true,
              organizationType: true,
              healthServiceType: true,
            },
          },
        },
      });

      // Transform data to match response schema
      const transformedPopulation: PopulationInfo = {
        id: updatedPopulation.id,
        year: updatedPopulation.year,
        hospitalCode9eDigit: updatedPopulation.hospitalCode9eDigit,
        count: updatedPopulation.count,
        isActive: updatedPopulation.isActive,
        createdAt: updatedPopulation.createdAt,
        updatedAt: updatedPopulation.updatedAt,
        hospital: updatedPopulation.hospital,
      };

      return transformedPopulation;
    } catch (error) {
      console.error('Update population service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลประชากร');
    }
  }

  // ============================================
  // SOFT DELETE POPULATION
  // ============================================

  static async deletePopulation(populationId: string): Promise<{ deletedAt: Date }> {
    try {
      // Check if population exists and is active
      const existingPopulation = await prisma.population.findFirst({
        where: {
          id: populationId,
          isActive: true,
        },
      });

      if (!existingPopulation) {
        throw new Error('ไม่พบข้อมูลประชากรที่ต้องการลบ');
      }

      // Soft delete population
      const updatedPopulation = await prisma.population.update({
        where: { id: populationId },
        data: { isActive: false },
      });

      return {
        deletedAt: updatedPopulation.updatedAt,
      };
    } catch (error) {
      console.error('Delete population service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการลบข้อมูลประชากร');
    }
  }

  // ============================================
  // GET POPULATION STATISTICS
  // ============================================

  static async getPopulationStatistics(): Promise<{
    totalRecords: number;
    totalPopulation: number;
    averagePopulation: number;
    byYear: Array<{
      year: number;
      totalPopulation: number;
      hospitalCount: number;
    }>;
    byHospital: Array<{
      hospitalCode9eDigit: string;
      hospitalName: string;
      latestYear: number;
      latestCount: number;
    }>;
    trends: Array<{
      year: number;
      totalPopulation: number;
      growth: number | null;
      growthPercentage: number | null;
    }>;
  }> {
    try {
      // Get total records and population
      const [totalRecords, totalPopulationResult] = await Promise.all([
        prisma.population.count({
          where: { isActive: true },
        }),
        prisma.population.aggregate({
          where: { isActive: true },
          _sum: { count: true },
          _avg: { count: true },
        }),
      ]);

      const totalPopulation = totalPopulationResult._sum.count || 0;
      const averagePopulation = Math.round(totalPopulationResult._avg.count || 0);

      // Get statistics by year
      const byYearData = await prisma.population.groupBy({
        by: ['year'],
        where: { isActive: true },
        _sum: { count: true },
        _count: { id: true },
        orderBy: { year: 'desc' },
      });

      const byYear = byYearData.map(item => ({
        year: item.year,
        totalPopulation: item._sum.count || 0,
        hospitalCount: item._count.id,
      }));

      // Get latest population data by hospital
      const latestByHospital = await prisma.population.findMany({
        where: { isActive: true },
        include: {
          hospital: {
            select: {
              hospitalName: true,
            },
          },
        },
        orderBy: [
          { hospitalCode9eDigit: 'asc' },
          { year: 'desc' },
        ],
      });

      // Group by hospital and get latest year data
      const hospitalMap = new Map();
      latestByHospital.forEach(item => {
        if (!hospitalMap.has(item.hospitalCode9eDigit)) {
          hospitalMap.set(item.hospitalCode9eDigit, {
            hospitalCode9eDigit: item.hospitalCode9eDigit,
            hospitalName: item.hospital?.hospitalName || 'ไม่ทราบ',
            latestYear: item.year,
            latestCount: item.count,
          });
        }
      });

      const byHospital = Array.from(hospitalMap.values());

      // Calculate trends with growth
      const trends = byYear.map((current, index) => {
        const previous = byYear[index + 1]; // Next item (older year)
        let growth: number | null = null;
        let growthPercentage: number | null = null;

        if (previous && previous.totalPopulation > 0) {
          growth = current.totalPopulation - previous.totalPopulation;
          growthPercentage = Math.round((growth / previous.totalPopulation) * 10000) / 100; // Fix: * 10000 / 100 instead of * 100 * 100 / 100
        }

        return {
          year: current.year,
          totalPopulation: current.totalPopulation,
          growth,
          growthPercentage,
        };
      });

      return {
        totalRecords,
        totalPopulation,
        averagePopulation,
        byYear,
        byHospital,
        trends,
      };
    } catch (error) {
      console.error('Get population statistics service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสถิติประชากร');
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  static async validatePopulationExists(populationId: string): Promise<boolean> {
    const population = await prisma.population.findFirst({
      where: {
        id: populationId,
        isActive: true,
      },
    });
    return !!population;
  }

  static async getPopulationCount(hospitalCode9eDigit?: string): Promise<number> {
    const whereCondition: Prisma.PopulationWhereInput = { isActive: true };
    
    if (hospitalCode9eDigit) {
      whereCondition.hospitalCode9eDigit = hospitalCode9eDigit;
    }

    return await prisma.population.count({
      where: whereCondition,
    });
  }

  static async getTotalPopulationByYear(year: number): Promise<number> {
    const result = await prisma.population.aggregate({
      where: {
        year,
        isActive: true,
      },
      _sum: {
        count: true,
      },
    });

    return result._sum.count || 0;
  }
}