// backend/src/services/hospital.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  CreateHospitalRequest,
  UpdateHospitalRequest,
  HospitalQueryParams,
  HospitalInfo,
} from '../schemas/hospital.schema';

// ============================================
// HOSPITAL SERVICE CLASS
// ============================================

export class HospitalService {

  // ============================================
  // GET HOSPITALS LIST WITH PAGINATION
  // ============================================

  static async getHospitals(queryParams: HospitalQueryParams): Promise<{
    hospitals: HospitalInfo[];
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
      organizationType, 
      healthServiceType, 
      affiliation, 
      sortBy, 
      sortOrder, 
      isActive 
    } = queryParams;

    // Build search conditions
    const searchConditions: Prisma.HospitalWhereInput = {
      isActive: isActive !== undefined ? isActive : true, // Default to active only
    };

    // Add filter conditions
    if (organizationType && organizationType.trim() !== '') {
      searchConditions.organizationType = { contains: organizationType, mode: 'insensitive' };
    }

    if (healthServiceType && healthServiceType.trim() !== '') {
      searchConditions.healthServiceType = { contains: healthServiceType, mode: 'insensitive' };
    }

    if (affiliation && affiliation.trim() !== '') {
      searchConditions.affiliation = { contains: affiliation, mode: 'insensitive' };
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      searchConditions.OR = [
        { hospitalName: { contains: search, mode: 'insensitive' } },
        { hospitalCode9eDigit: { contains: search, mode: 'insensitive' } },
        { hospitalCode9Digit: { contains: search, mode: 'insensitive' } },
        { hospitalCode5Digit: { contains: search, mode: 'insensitive' } },
        { organizationType: { contains: search, mode: 'insensitive' } },
        { healthServiceType: { contains: search, mode: 'insensitive' } },
        { affiliation: { contains: search, mode: 'insensitive' } },
        { departmentDivision: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: Prisma.HospitalOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    try {
      // Execute queries in parallel
      const [hospitals, totalCount] = await Promise.all([
        prisma.hospital.findMany({
          where: searchConditions,
          orderBy,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                patientVisits: {
                  where: { isActive: true },
                },
                populations: {
                  where: { isActive: true },
                },
                users: {
                  where: { isActive: true },
                },
              },
            },
          },
        }),
        prisma.hospital.count({
          where: searchConditions,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Transform data to match response schema
      const transformedHospitals: HospitalInfo[] = hospitals.map(hospital => ({
        id: hospital.id,
        hospitalName: hospital.hospitalName,
        hospitalCode9eDigit: hospital.hospitalCode9eDigit,
        hospitalCode9Digit: hospital.hospitalCode9Digit,
        hospitalCode5Digit: hospital.hospitalCode5Digit,
        organizationType: hospital.organizationType,
        healthServiceType: hospital.healthServiceType,
        affiliation: hospital.affiliation,
        departmentDivision: hospital.departmentDivision,
        isActive: hospital.isActive,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt,
        _count: {
          patientVisits: hospital._count.patientVisits,
          populations: hospital._count.populations,
          users: hospital._count.users,
        },
      }));

      return {
        hospitals: transformedHospitals,
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
      console.error('Hospital list service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการโรงพยาบาล');
    }
  }

  // ============================================
  // GET HOSPITAL BY ID
  // ============================================

  static async getHospitalById(hospitalId: string, includePopulations: boolean = false): Promise<HospitalInfo> {
    try {
      const hospital = await prisma.hospital.findFirst({
        where: {
          id: hospitalId,
          isActive: true,
        },
        include: {
          _count: {
            select: {
              patientVisits: {
                where: { isActive: true },
              },
              populations: {
                where: { isActive: true },
              },
              users: {
                where: { isActive: true },
              },
            },
          },
          populations: includePopulations ? {
            where: { isActive: true },
            select: {
              id: true,
              year: true,
              count: true,
            },
            orderBy: { year: 'desc' },
          } : false,
        },
      });

      if (!hospital) {
        throw new Error('ไม่พบข้อมูลโรงพยาบาลที่ระบุ');
      }

      // Transform data to match response schema
      const transformedHospital: HospitalInfo = {
        id: hospital.id,
        hospitalName: hospital.hospitalName,
        hospitalCode9eDigit: hospital.hospitalCode9eDigit,
        hospitalCode9Digit: hospital.hospitalCode9Digit,
        hospitalCode5Digit: hospital.hospitalCode5Digit,
        organizationType: hospital.organizationType,
        healthServiceType: hospital.healthServiceType,
        affiliation: hospital.affiliation,
        departmentDivision: hospital.departmentDivision,
        isActive: hospital.isActive,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt,
        _count: {
          patientVisits: hospital._count.patientVisits,
          populations: hospital._count.populations,
          users: hospital._count.users,
        },
        ...(includePopulations && hospital.populations && {
          populations: hospital.populations,
        }),
      };

      return transformedHospital;
    } catch (error) {
      console.error('Get hospital by ID service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล');
    }
  }

  // ============================================
  // GET HOSPITAL BY CODE
  // ============================================

  static async getHospitalByCode(hospitalCode: string): Promise<HospitalInfo> {
    try {
      const hospital = await prisma.hospital.findFirst({
        where: {
          hospitalCode9eDigit: hospitalCode,
          isActive: true,
        },
        include: {
          _count: {
            select: {
              patientVisits: {
                where: { isActive: true },
              },
              populations: {
                where: { isActive: true },
              },
              users: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      if (!hospital) {
        throw new Error('ไม่พบข้อมูลโรงพยาบาลที่มีรหัส ' + hospitalCode);
      }

      // Transform data to match response schema
      const transformedHospital: HospitalInfo = {
        id: hospital.id,
        hospitalName: hospital.hospitalName,
        hospitalCode9eDigit: hospital.hospitalCode9eDigit,
        hospitalCode9Digit: hospital.hospitalCode9Digit,
        hospitalCode5Digit: hospital.hospitalCode5Digit,
        organizationType: hospital.organizationType,
        healthServiceType: hospital.healthServiceType,
        affiliation: hospital.affiliation,
        departmentDivision: hospital.departmentDivision,
        isActive: hospital.isActive,
        createdAt: hospital.createdAt,
        updatedAt: hospital.updatedAt,
        _count: {
          patientVisits: hospital._count.patientVisits,
          populations: hospital._count.populations,
          users: hospital._count.users,
        },
      };

      return transformedHospital;
    } catch (error) {
      console.error('Get hospital by code service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล');
    }
  }

  // ============================================
  // CREATE NEW HOSPITAL
  // ============================================

  static async createHospital(hospitalData: CreateHospitalRequest): Promise<HospitalInfo> {
    const { hospitalCode9eDigit, hospitalCode9Digit, hospitalCode5Digit, ...otherData } = hospitalData;

    try {
      // Check for duplicate hospital codes
      const existingHospital = await prisma.hospital.findFirst({
        where: {
          OR: [
            { hospitalCode9eDigit: hospitalCode9eDigit },
            ...(hospitalCode9Digit ? [{ hospitalCode9Digit: hospitalCode9Digit }] : []),
            ...(hospitalCode5Digit ? [{ hospitalCode5Digit: hospitalCode5Digit }] : []),
          ],
          isActive: true,
        },
      });

      if (existingHospital) {
        if (existingHospital.hospitalCode9eDigit === hospitalCode9eDigit) {
          throw new Error(`รหัสโรงพยาบาล 9 หลักใหม่ "${hospitalCode9eDigit}" มีอยู่ในระบบแล้ว`);
        }
        if (hospitalCode9Digit && existingHospital.hospitalCode9Digit === hospitalCode9Digit) {
          throw new Error(`รหัสโรงพยาบาล 9 หลักเก่า "${hospitalCode9Digit}" มีอยู่ในระบบแล้ว`);
        }
        if (hospitalCode5Digit && existingHospital.hospitalCode5Digit === hospitalCode5Digit) {
          throw new Error(`รหัสโรงพยาบาล 5 หลัก "${hospitalCode5Digit}" มีอยู่ในระบบแล้ว`);
        }
      }

      // Create new hospital
      const newHospital = await prisma.hospital.create({
        data: {
          hospitalCode9eDigit,
          hospitalCode9Digit: hospitalCode9Digit || null,
          hospitalCode5Digit: hospitalCode5Digit || null,
          hospitalName: otherData.hospitalName.trim(),
          organizationType: otherData.organizationType?.trim() || null,
          healthServiceType: otherData.healthServiceType?.trim() || null,
          affiliation: otherData.affiliation?.trim() || null,
          departmentDivision: otherData.departmentDivision?.trim() || null,
        },
        include: {
          _count: {
            select: {
              patientVisits: {
                where: { isActive: true },
              },
              populations: {
                where: { isActive: true },
              },
              users: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      // Transform data to match response schema
      const transformedHospital: HospitalInfo = {
        id: newHospital.id,
        hospitalName: newHospital.hospitalName,
        hospitalCode9eDigit: newHospital.hospitalCode9eDigit,
        hospitalCode9Digit: newHospital.hospitalCode9Digit,
        hospitalCode5Digit: newHospital.hospitalCode5Digit,
        organizationType: newHospital.organizationType,
        healthServiceType: newHospital.healthServiceType,
        affiliation: newHospital.affiliation,
        departmentDivision: newHospital.departmentDivision,
        isActive: newHospital.isActive,
        createdAt: newHospital.createdAt,
        updatedAt: newHospital.updatedAt,
        _count: {
          patientVisits: newHospital._count.patientVisits,
          populations: newHospital._count.populations,
          users: newHospital._count.users,
        },
      };

      return transformedHospital;
    } catch (error) {
      console.error('Create hospital service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลโรงพยาบาล');
    }
  }

  // ============================================
  // UPDATE HOSPITAL
  // ============================================

  static async updateHospital(hospitalId: string, updateData: UpdateHospitalRequest): Promise<HospitalInfo> {
    try {
      // Check if hospital exists and is active
      const existingHospital = await prisma.hospital.findFirst({
        where: {
          id: hospitalId,
          isActive: true,
        },
      });

      if (!existingHospital) {
        throw new Error('ไม่พบข้อมูลโรงพยาบาลที่ต้องการแก้ไข');
      }

      // Check for duplicate hospital codes if updating codes
      if (updateData.hospitalCode9eDigit || updateData.hospitalCode9Digit || updateData.hospitalCode5Digit) {
        const duplicateConditions: Prisma.HospitalWhereInput[] = [];

        if (updateData.hospitalCode9eDigit) {
          duplicateConditions.push({
            hospitalCode9eDigit: updateData.hospitalCode9eDigit,
          });
        }
        if (updateData.hospitalCode9Digit) {
          duplicateConditions.push({
            hospitalCode9Digit: updateData.hospitalCode9Digit,
          });
        }
        if (updateData.hospitalCode5Digit) {
          duplicateConditions.push({
            hospitalCode5Digit: updateData.hospitalCode5Digit,
          });
        }

        const duplicateHospital = await prisma.hospital.findFirst({
          where: {
            OR: duplicateConditions,
            isActive: true,
            id: { not: hospitalId }, // Exclude current hospital
          },
        });

        if (duplicateHospital) {
          if (updateData.hospitalCode9eDigit && duplicateHospital.hospitalCode9eDigit === updateData.hospitalCode9eDigit) {
            throw new Error(`รหัสโรงพยาบาล 9 หลักใหม่ "${updateData.hospitalCode9eDigit}" มีอยู่ในระบบแล้ว`);
          }
          if (updateData.hospitalCode9Digit && duplicateHospital.hospitalCode9Digit === updateData.hospitalCode9Digit) {
            throw new Error(`รหัสโรงพยาบาล 9 หลักเก่า "${updateData.hospitalCode9Digit}" มีอยู่ในระบบแล้ว`);
          }
          if (updateData.hospitalCode5Digit && duplicateHospital.hospitalCode5Digit === updateData.hospitalCode5Digit) {
            throw new Error(`รหัสโรงพยาบาล 5 หลัก "${updateData.hospitalCode5Digit}" มีอยู่ในระบบแล้ว`);
          }
        }
      }

      // Prepare update data
      const updatePayload: Prisma.HospitalUpdateInput = {};
      
      if (updateData.hospitalName !== undefined) {
        updatePayload.hospitalName = updateData.hospitalName.trim();
      }
      if (updateData.hospitalCode9eDigit !== undefined) {
        updatePayload.hospitalCode9eDigit = updateData.hospitalCode9eDigit;
      }
      if (updateData.hospitalCode9Digit !== undefined) {
        updatePayload.hospitalCode9Digit = updateData.hospitalCode9Digit || null;
      }
      if (updateData.hospitalCode5Digit !== undefined) {
        updatePayload.hospitalCode5Digit = updateData.hospitalCode5Digit || null;
      }
      if (updateData.organizationType !== undefined) {
        updatePayload.organizationType = updateData.organizationType?.trim() || null;
      }
      if (updateData.healthServiceType !== undefined) {
        updatePayload.healthServiceType = updateData.healthServiceType?.trim() || null;
      }
      if (updateData.affiliation !== undefined) {
        updatePayload.affiliation = updateData.affiliation?.trim() || null;
      }
      if (updateData.departmentDivision !== undefined) {
        updatePayload.departmentDivision = updateData.departmentDivision?.trim() || null;
      }

      // Update hospital
      const updatedHospital = await prisma.hospital.update({
        where: { id: hospitalId },
        data: updatePayload,
        include: {
          _count: {
            select: {
              patientVisits: {
                where: { isActive: true },
              },
              populations: {
                where: { isActive: true },
              },
              users: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      // Transform data to match response schema
      const transformedHospital: HospitalInfo = {
        id: updatedHospital.id,
        hospitalName: updatedHospital.hospitalName,
        hospitalCode9eDigit: updatedHospital.hospitalCode9eDigit,
        hospitalCode9Digit: updatedHospital.hospitalCode9Digit,
        hospitalCode5Digit: updatedHospital.hospitalCode5Digit,
        organizationType: updatedHospital.organizationType,
        healthServiceType: updatedHospital.healthServiceType,
        affiliation: updatedHospital.affiliation,
        departmentDivision: updatedHospital.departmentDivision,
        isActive: updatedHospital.isActive,
        createdAt: updatedHospital.createdAt,
        updatedAt: updatedHospital.updatedAt,
        _count: {
          patientVisits: updatedHospital._count.patientVisits,
          populations: updatedHospital._count.populations,
          users: updatedHospital._count.users,
        },
      };

      return transformedHospital;
    } catch (error) {
      console.error('Update hospital service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลโรงพยาบาล');
    }
  }

  // ============================================
  // SOFT DELETE HOSPITAL
  // ============================================

  static async deleteHospital(hospitalId: string): Promise<{ deletedAt: Date }> {
    try {
      // Check if hospital exists and is active
      const existingHospital = await prisma.hospital.findFirst({
        where: {
          id: hospitalId,
          isActive: true,
        },
      });

      if (!existingHospital) {
        throw new Error('ไม่พบข้อมูลโรงพยาบาลที่ต้องการลบ');
      }

      // Check if hospital is being used in patient visits
      const patientVisitCount = await prisma.patientVisit.count({
        where: {
          hospitalCode9eDigit: existingHospital.hospitalCode9eDigit,
          isActive: true,
        },
      });

      if (patientVisitCount > 0) {
        throw new Error(`ไม่สามารถลบโรงพยาบาลนี้ได้ เนื่องจากมีข้อมูลผู้ป่วย ${patientVisitCount} รายการที่เชื่อมโยงกับโรงพยาบาลนี้`);
      }

      // Check if hospital has users assigned
      const userCount = await prisma.user.count({
        where: {
          hospitalCode9eDigit: existingHospital.hospitalCode9eDigit,
          isActive: true,
        },
      });

      if (userCount > 0) {
        throw new Error(`ไม่สามารถลบโรงพยาบาลนี้ได้ เนื่องจากมีผู้ใช้งาน ${userCount} คนที่ยังมอบสิทธิ์ให้โรงพยาบาลนี้`);
      }

      // Soft delete hospital and related populations
      const [updatedHospital] = await prisma.$transaction([
        // Soft delete hospital
        prisma.hospital.update({
          where: { id: hospitalId },
          data: { isActive: false },
        }),
        // Soft delete all related populations
        prisma.population.updateMany({
          where: {
            hospitalCode9eDigit: existingHospital.hospitalCode9eDigit,
            isActive: true,
          },
          data: { isActive: false },
        }),
      ]);

      return {
        deletedAt: updatedHospital.updatedAt,
      };
    } catch (error) {
      console.error('Delete hospital service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการลบข้อมูลโรงพยาบาล');
    }
  }

  // ============================================
  // GET HOSPITAL STATISTICS
  // ============================================

  static async getHospitalStatistics(): Promise<{
    totalHospitals: number;
    byOrganizationType: Array<{ organizationType: string; count: number }>;
    byHealthServiceType: Array<{ healthServiceType: string; count: number }>;
    byAffiliation: Array<{ affiliation: string; count: number }>;
  }> {
    try {
      const [
        totalHospitals,
        byOrganizationType,
        byHealthServiceType,
        byAffiliation,
      ] = await Promise.all([
        // Total hospitals count
        prisma.hospital.count({
          where: { isActive: true },
        }),

        // Group by organization type
        prisma.hospital.groupBy({
          by: ['organizationType'],
          where: { 
            isActive: true,
            organizationType: { not: null },
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        // Group by health service type
        prisma.hospital.groupBy({
          by: ['healthServiceType'],
          where: { 
            isActive: true,
            healthServiceType: { not: null },
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),

        // Group by affiliation
        prisma.hospital.groupBy({
          by: ['affiliation'],
          where: { 
            isActive: true,
            affiliation: { not: null },
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
      ]);

      return {
        totalHospitals,
        byOrganizationType: byOrganizationType.map(item => ({
          organizationType: item.organizationType || 'ไม่ระบุ',
          count: item._count.id,
        })),
        byHealthServiceType: byHealthServiceType.map(item => ({
          healthServiceType: item.healthServiceType || 'ไม่ระบุ',
          count: item._count.id,
        })),
        byAffiliation: byAffiliation.map(item => ({
          affiliation: item.affiliation || 'ไม่ระบุ',
          count: item._count.id,
        })),
      };
    } catch (error) {
      console.error('Get hospital statistics service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสถิติโรงพยาบาล');
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  static async validateHospitalExists(hospitalId: string): Promise<boolean> {
    const hospital = await prisma.hospital.findFirst({
      where: {
        id: hospitalId,
        isActive: true,
      },
    });
    return !!hospital;
  }

  static async validateHospitalCodeExists(hospitalCode: string): Promise<boolean> {
    const hospital = await prisma.hospital.findFirst({
      where: {
        hospitalCode9eDigit: hospitalCode,
        isActive: true,
      },
    });
    return !!hospital;
  }

  static async getHospitalCount(): Promise<number> {
    return await prisma.hospital.count({
      where: { isActive: true },
    });
  }

  static async getHospitalCodesMap(): Promise<Record<string, string>> {
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      select: {
        hospitalCode9eDigit: true,
        hospitalName: true,
      },
    });

    return hospitals.reduce((acc, hospital) => {
      acc[hospital.hospitalCode9eDigit] = hospital.hospitalName;
      return acc;
    }, {} as Record<string, string>);
  }
}