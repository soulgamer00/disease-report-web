// backend/src/services/disease.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import {
  CreateDiseaseRequest,
  UpdateDiseaseRequest,
  DiseaseQueryParams,
  DiseaseInfo,
} from '../schemas/disease.schema';

// ============================================
// DISEASE SERVICE CLASS
// ============================================

export class DiseaseService {

  // ============================================
  // GET DISEASES LIST WITH PAGINATION
  // ============================================

  static async getDiseases(queryParams: DiseaseQueryParams): Promise<{
    diseases: DiseaseInfo[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page, limit, search, sortBy, sortOrder, isActive } = queryParams;

    // Build search conditions
    const searchConditions: Prisma.DiseaseWhereInput = {
      isActive: isActive !== undefined ? isActive : true, // Default to active only
    };

    // Add search filter if provided
    if (search && search.trim() !== '') {
      searchConditions.OR = [
        { engName: { contains: search, mode: 'insensitive' } },
        { thaiName: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: Prisma.DiseaseOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    try {
      // Execute queries in parallel
      const [diseases, totalCount] = await Promise.all([
        prisma.disease.findMany({
          where: searchConditions,
          orderBy,
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                symptoms: {
                  where: { isActive: true },
                },
                patientVisits: {
                  where: { isActive: true },
                },
              },
            },
          },
        }),
        prisma.disease.count({
          where: searchConditions,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Transform data to match response schema
      const transformedDiseases: DiseaseInfo[] = diseases.map(disease => ({
        id: disease.id,
        engName: disease.engName,
        thaiName: disease.thaiName,
        shortName: disease.shortName,
        details: disease.details,
        isActive: disease.isActive,
        createdAt: disease.createdAt,
        updatedAt: disease.updatedAt,
        _count: {
          symptoms: disease._count.symptoms,
          patientVisits: disease._count.patientVisits,
        },
      }));

      return {
        diseases: transformedDiseases,
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
      console.error('Disease list service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการโรค');
    }
  }

  // ============================================
  // GET DISEASE BY ID
  // ============================================

  static async getDiseaseById(diseaseId: string, includeSymptoms: boolean = false): Promise<DiseaseInfo> {
    try {
      const disease = await prisma.disease.findFirst({
        where: {
          id: diseaseId,
          isActive: true,
        },
        include: {
          _count: {
            select: {
              symptoms: {
                where: { isActive: true },
              },
              patientVisits: {
                where: { isActive: true },
              },
            },
          },
          symptoms: includeSymptoms ? {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              isActive: true,
            },
            orderBy: { name: 'asc' },
          } : false,
        },
      });

      if (!disease) {
        throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
      }

      // Transform data to match response schema
      const transformedDisease: DiseaseInfo = {
        id: disease.id,
        engName: disease.engName,
        thaiName: disease.thaiName,
        shortName: disease.shortName,
        details: disease.details,
        isActive: disease.isActive,
        createdAt: disease.createdAt,
        updatedAt: disease.updatedAt,
        _count: {
          symptoms: disease._count.symptoms,
          patientVisits: disease._count.patientVisits,
        },
        ...(includeSymptoms && disease.symptoms && {
          symptoms: disease.symptoms,
        }),
      };

      return transformedDisease;
    } catch (error) {
      console.error('Get disease by ID service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลโรค');
    }
  }

  // ============================================
  // CREATE NEW DISEASE
  // ============================================

  static async createDisease(diseaseData: CreateDiseaseRequest): Promise<DiseaseInfo> {
    const { engName, thaiName, shortName, details } = diseaseData;

    try {
      // Check for duplicate names (case-insensitive)
      const existingDisease = await prisma.disease.findFirst({
        where: {
          OR: [
            { engName: { equals: engName, mode: 'insensitive' } },
            { thaiName: { equals: thaiName, mode: 'insensitive' } },
            { shortName: { equals: shortName, mode: 'insensitive' } },
          ],
          isActive: true,
        },
      });

      if (existingDisease) {
        if (existingDisease.engName.toLowerCase() === engName.toLowerCase()) {
          throw new Error(`ชื่อโรคภาษาอังกฤษ "${engName}" มีอยู่ในระบบแล้ว`);
        }
        if (existingDisease.thaiName === thaiName) {
          throw new Error(`ชื่อโรคภาษาไทย "${thaiName}" มีอยู่ในระบบแล้ว`);
        }
        if (existingDisease.shortName.toLowerCase() === shortName.toLowerCase()) {
          throw new Error(`ชื่อย่อโรค "${shortName}" มีอยู่ในระบบแล้ว`);
        }
      }

      // Create new disease
      const newDisease = await prisma.disease.create({
        data: {
          engName: engName.trim(),
          thaiName: thaiName.trim(),
          shortName: shortName.trim().toUpperCase(),
          details: details?.trim() || null,
        },
        include: {
          _count: {
            select: {
              symptoms: {
                where: { isActive: true },
              },
              patientVisits: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      // Transform data to match response schema
      const transformedDisease: DiseaseInfo = {
        id: newDisease.id,
        engName: newDisease.engName,
        thaiName: newDisease.thaiName,
        shortName: newDisease.shortName,
        details: newDisease.details,
        isActive: newDisease.isActive,
        createdAt: newDisease.createdAt,
        updatedAt: newDisease.updatedAt,
        _count: {
          symptoms: newDisease._count.symptoms,
          patientVisits: newDisease._count.patientVisits,
        },
      };

      return transformedDisease;
    } catch (error) {
      console.error('Create disease service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลโรค');
    }
  }

  // ============================================
  // UPDATE DISEASE
  // ============================================

  static async updateDisease(diseaseId: string, updateData: UpdateDiseaseRequest): Promise<DiseaseInfo> {
    try {
      // Check if disease exists and is active
      const existingDisease = await prisma.disease.findFirst({
        where: {
          id: diseaseId,
          isActive: true,
        },
      });

      if (!existingDisease) {
        throw new Error('ไม่พบข้อมูลโรคที่ต้องการแก้ไข');
      }

      // Check for duplicate names if updating names
      if (updateData.engName || updateData.thaiName || updateData.shortName) {
        const duplicateConditions: Prisma.DiseaseWhereInput[] = [];

        if (updateData.engName) {
          duplicateConditions.push({
            engName: { equals: updateData.engName, mode: 'insensitive' },
          });
        }
        if (updateData.thaiName) {
          duplicateConditions.push({
            thaiName: { equals: updateData.thaiName, mode: 'insensitive' },
          });
        }
        if (updateData.shortName) {
          duplicateConditions.push({
            shortName: { equals: updateData.shortName, mode: 'insensitive' },
          });
        }

        const duplicateDisease = await prisma.disease.findFirst({
          where: {
            OR: duplicateConditions,
            isActive: true,
            id: { not: diseaseId }, // Exclude current disease
          },
        });

        if (duplicateDisease) {
          if (updateData.engName && duplicateDisease.engName.toLowerCase() === updateData.engName.toLowerCase()) {
            throw new Error(`ชื่อโรคภาษาอังกฤษ "${updateData.engName}" มีอยู่ในระบบแล้ว`);
          }
          if (updateData.thaiName && duplicateDisease.thaiName === updateData.thaiName) {
            throw new Error(`ชื่อโรคภาษาไทย "${updateData.thaiName}" มีอยู่ในระบบแล้ว`);
          }
          if (updateData.shortName && duplicateDisease.shortName.toLowerCase() === updateData.shortName.toLowerCase()) {
            throw new Error(`ชื่อย่อโรค "${updateData.shortName}" มีอยู่ในระบบแล้ว`);
          }
        }
      }

      // Prepare update data
      const updatePayload: Prisma.DiseaseUpdateInput = {};
      
      if (updateData.engName !== undefined) {
        updatePayload.engName = updateData.engName.trim();
      }
      if (updateData.thaiName !== undefined) {
        updatePayload.thaiName = updateData.thaiName.trim();
      }
      if (updateData.shortName !== undefined) {
        updatePayload.shortName = updateData.shortName.trim().toUpperCase();
      }
      if (updateData.details !== undefined) {
        updatePayload.details = updateData.details?.trim() || null;
      }

      // Update disease
      const updatedDisease = await prisma.disease.update({
        where: { id: diseaseId },
        data: updatePayload,
        include: {
          _count: {
            select: {
              symptoms: {
                where: { isActive: true },
              },
              patientVisits: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      // Transform data to match response schema
      const transformedDisease: DiseaseInfo = {
        id: updatedDisease.id,
        engName: updatedDisease.engName,
        thaiName: updatedDisease.thaiName,
        shortName: updatedDisease.shortName,
        details: updatedDisease.details,
        isActive: updatedDisease.isActive,
        createdAt: updatedDisease.createdAt,
        updatedAt: updatedDisease.updatedAt,
        _count: {
          symptoms: updatedDisease._count.symptoms,
          patientVisits: updatedDisease._count.patientVisits,
        },
      };

      return transformedDisease;
    } catch (error) {
      console.error('Update disease service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลโรค');
    }
  }

  // ============================================
  // SOFT DELETE DISEASE
  // ============================================

  static async deleteDisease(diseaseId: string): Promise<{ deletedAt: Date }> {
    try {
      // Check if disease exists and is active
      const existingDisease = await prisma.disease.findFirst({
        where: {
          id: diseaseId,
          isActive: true,
        },
      });

      if (!existingDisease) {
        throw new Error('ไม่พบข้อมูลโรคที่ต้องการลบ');
      }

      // Check if disease is being used in patient visits
      const patientVisitCount = await prisma.patientVisit.count({
        where: {
          diseaseId,
          isActive: true,
        },
      });

      if (patientVisitCount > 0) {
        throw new Error(`ไม่สามารถลบโรคนี้ได้ เนื่องจากมีข้อมูลผู้ป่วย ${patientVisitCount} รายการที่เชื่อมโยงกับโรคนี้`);
      }

      // Soft delete disease and its symptoms
      const [updatedDisease] = await prisma.$transaction([
        // Soft delete disease
        prisma.disease.update({
          where: { id: diseaseId },
          data: { isActive: false },
        }),
        // Soft delete all related symptoms
        prisma.symptom.updateMany({
          where: {
            diseaseId,
            isActive: true,
          },
          data: { isActive: false },
        }),
      ]);

      return {
        deletedAt: updatedDisease.updatedAt,
      };
    } catch (error) {
      console.error('Delete disease service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการลบข้อมูลโรค');
    }
  }

  // ============================================
  // GET DISEASE SYMPTOMS
  // ============================================

  static async getDiseaseSymptoms(diseaseId: string): Promise<{
    diseaseId: string;
    diseaseName: string;
    symptoms: Array<{
      id: string;
      name: string;
      isActive: boolean;
    }>;
  }> {
    try {
      // Check if disease exists
      const disease = await prisma.disease.findFirst({
        where: {
          id: diseaseId,
          isActive: true,
        },
        include: {
          symptoms: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              isActive: true,
            },
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!disease) {
        throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
      }

      return {
        diseaseId: disease.id,
        diseaseName: disease.thaiName,
        symptoms: disease.symptoms,
      };
    } catch (error) {
      console.error('Get disease symptoms service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลอาการของโรค');
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  static async validateDiseaseExists(diseaseId: string): Promise<boolean> {
    const disease = await prisma.disease.findFirst({
      where: {
        id: diseaseId,
        isActive: true,
      },
    });
    return !!disease;
  }

  static async getDiseaseCount(): Promise<number> {
    return await prisma.disease.count({
      where: { isActive: true },
    });
  }
}