// backend/src/services/symptom.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
  CreateSymptomRequest,
  UpdateSymptomRequest,
  SymptomQueryParams,
  SymptomInfo,
} from '../schemas/symptom.schema';

// ============================================
// SYMPTOM SERVICE CLASS
// ============================================

export class SymptomService {

  // ============================================
  // GET SYMPTOMS LIST WITH PAGINATION
  // ============================================

  static async getSymptoms(queryParams: SymptomQueryParams): Promise<{
    symptoms: SymptomInfo[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page, limit, search, diseaseId, sortBy, sortOrder, isActive } = queryParams;

    // Build search conditions
    const searchConditions: Prisma.SymptomWhereInput = {
      isActive: isActive !== undefined ? isActive : true, // Default to active only
    };

    // Add disease filter if provided
    if (diseaseId) {
      searchConditions.diseaseId = diseaseId;
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      searchConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { disease: { thaiName: { contains: search, mode: 'insensitive' } } },
        { disease: { engName: { contains: search, mode: 'insensitive' } } },
        { disease: { shortName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: Prisma.SymptomOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    try {
      // Execute queries in parallel
      const [symptoms, totalCount] = await Promise.all([
        prisma.symptom.findMany({
          where: searchConditions,
          orderBy,
          skip,
          take: limit,
          include: {
            disease: {
              select: {
                id: true,
                engName: true,
                thaiName: true,
                shortName: true,
              },
            },
          },
        }),
        prisma.symptom.count({
          where: searchConditions,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Transform data to match response schema
      const transformedSymptoms: SymptomInfo[] = symptoms.map(symptom => ({
        id: symptom.id,
        diseaseId: symptom.diseaseId,
        name: symptom.name,
        isActive: symptom.isActive,
        createdAt: symptom.createdAt,
        updatedAt: symptom.updatedAt,
        disease: symptom.disease,
      }));

      return {
        symptoms: transformedSymptoms,
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
      console.error('Symptom list service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการอาการ');
    }
  }

  // ============================================
  // GET SYMPTOM BY ID
  // ============================================

  static async getSymptomById(symptomId: string): Promise<SymptomInfo> {
    try {
      const symptom = await prisma.symptom.findFirst({
        where: {
          id: symptomId,
          isActive: true,
        },
        include: {
          disease: {
            select: {
              id: true,
              engName: true,
              thaiName: true,
              shortName: true,
            },
          },
        },
      });

      if (!symptom) {
        throw new Error('ไม่พบข้อมูลอาการที่ระบุ');
      }

      // Transform data to match response schema
      const transformedSymptom: SymptomInfo = {
        id: symptom.id,
        diseaseId: symptom.diseaseId,
        name: symptom.name,
        isActive: symptom.isActive,
        createdAt: symptom.createdAt,
        updatedAt: symptom.updatedAt,
        disease: symptom.disease,
      };

      return transformedSymptom;
    } catch (error) {
      console.error('Get symptom by ID service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลอาการ');
    }
  }

  // ============================================
  // GET SYMPTOMS BY DISEASE ID
  // ============================================

  static async getSymptomsByDiseaseId(diseaseId: string): Promise<{
    diseaseId: string;
    diseaseName: string;
    symptoms: Array<{
      id: string;
      name: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
  }> {
    try {
      // Check if disease exists and is active
      const disease = await prisma.disease.findFirst({
        where: {
          id: diseaseId,
          isActive: true,
        },
      });

      if (!disease) {
        throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
      }

      // Get symptoms for the disease
      const symptoms = await prisma.symptom.findMany({
        where: {
          diseaseId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { name: 'asc' },
      });

      return {
        diseaseId: disease.id,
        diseaseName: disease.thaiName,
        symptoms,
        total: symptoms.length,
      };
    } catch (error) {
      console.error('Get symptoms by disease ID service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลอาการของโรค');
    }
  }

  // ============================================
  // CREATE NEW SYMPTOM
  // ============================================

  static async createSymptom(symptomData: CreateSymptomRequest): Promise<SymptomInfo> {
    const { diseaseId, name } = symptomData;

    try {
      // Check if disease exists and is active
      const disease = await prisma.disease.findFirst({
        where: {
          id: diseaseId,
          isActive: true,
        },
      });

      if (!disease) {
        throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
      }

      // Check for duplicate symptom name within the same disease
      const existingSymptom = await prisma.symptom.findFirst({
        where: {
          diseaseId,
          name: { equals: name.trim(), mode: 'insensitive' },
          isActive: true,
        },
      });

      if (existingSymptom) {
        throw new Error(`อาการ "${name}" มีอยู่ในโรค "${disease.thaiName}" แล้ว`);
      }

      // Create new symptom
      const newSymptom = await prisma.symptom.create({
        data: {
          diseaseId,
          name: name.trim(),
        },
        include: {
          disease: {
            select: {
              id: true,
              engName: true,
              thaiName: true,
              shortName: true,
            },
          },
        },
      });

      // Transform data to match response schema
      const transformedSymptom: SymptomInfo = {
        id: newSymptom.id,
        diseaseId: newSymptom.diseaseId,
        name: newSymptom.name,
        isActive: newSymptom.isActive,
        createdAt: newSymptom.createdAt,
        updatedAt: newSymptom.updatedAt,
        disease: newSymptom.disease,
      };

      return transformedSymptom;
    } catch (error) {
      console.error('Create symptom service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลอาการ');
    }
  }

  // ============================================
  // UPDATE SYMPTOM
  // ============================================

  static async updateSymptom(symptomId: string, updateData: UpdateSymptomRequest): Promise<SymptomInfo> {
    try {
      // Check if symptom exists and is active
      const existingSymptom = await prisma.symptom.findFirst({
        where: {
          id: symptomId,
          isActive: true,
        },
      });

      if (!existingSymptom) {
        throw new Error('ไม่พบข้อมูลอาการที่ต้องการแก้ไข');
      }

      // If updating diseaseId, check if new disease exists
      if (updateData.diseaseId && updateData.diseaseId !== existingSymptom.diseaseId) {
        const newDisease = await prisma.disease.findFirst({
          where: {
            id: updateData.diseaseId,
            isActive: true,
          },
        });

        if (!newDisease) {
          throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
        }
      }

      // Check for duplicate symptom name within the target disease
      if (updateData.name || updateData.diseaseId) {
        const targetDiseaseId = updateData.diseaseId || existingSymptom.diseaseId;
        const targetName = updateData.name || existingSymptom.name;

        const duplicateSymptom = await prisma.symptom.findFirst({
          where: {
            diseaseId: targetDiseaseId,
            name: { equals: targetName.trim(), mode: 'insensitive' },
            isActive: true,
            id: { not: symptomId }, // Exclude current symptom
          },
        });

        if (duplicateSymptom) {
          const disease = await prisma.disease.findFirst({
            where: { id: targetDiseaseId },
            select: { thaiName: true },
          });
          throw new Error(`อาการ "${targetName}" มีอยู่ในโรค "${disease?.thaiName}" แล้ว`);
        }
      }

      // Prepare update data
      const updatePayload: Prisma.SymptomUpdateInput = {};
      
      if (updateData.diseaseId !== undefined) {
        updatePayload.disease = {
          connect: { id: updateData.diseaseId }
        };
      }
      if (updateData.name !== undefined) {
        updatePayload.name = updateData.name.trim();
      }

      // Update symptom
      const updatedSymptom = await prisma.symptom.update({
        where: { id: symptomId },
        data: updatePayload,
        include: {
          disease: {
            select: {
              id: true,
              engName: true,
              thaiName: true,
              shortName: true,
            },
          },
        },
      });

      // Transform data to match response schema
      const transformedSymptom: SymptomInfo = {
        id: updatedSymptom.id,
        diseaseId: updatedSymptom.diseaseId,
        name: updatedSymptom.name,
        isActive: updatedSymptom.isActive,
        createdAt: updatedSymptom.createdAt,
        updatedAt: updatedSymptom.updatedAt,
        disease: updatedSymptom.disease,
      };

      return transformedSymptom;
    } catch (error) {
      console.error('Update symptom service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลอาการ');
    }
  }

  // ============================================
  // SOFT DELETE SYMPTOM
  // ============================================

  static async deleteSymptom(symptomId: string): Promise<{ deletedAt: Date }> {
    try {
      // Check if symptom exists and is active
      const existingSymptom = await prisma.symptom.findFirst({
        where: {
          id: symptomId,
          isActive: true,
        },
      });

      if (!existingSymptom) {
        throw new Error('ไม่พบข้อมูลอาการที่ต้องการลบ');
      }

      // Soft delete symptom
      const updatedSymptom = await prisma.symptom.update({
        where: { id: symptomId },
        data: { isActive: false },
      });

      return {
        deletedAt: updatedSymptom.updatedAt,
      };
    } catch (error) {
      console.error('Delete symptom service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการลบข้อมูลอาการ');
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  static async validateSymptomExists(symptomId: string): Promise<boolean> {
    const symptom = await prisma.symptom.findFirst({
      where: {
        id: symptomId,
        isActive: true,
      },
    });
    return !!symptom;
  }

  static async getSymptomCount(diseaseId?: string): Promise<number> {
    const whereCondition: Prisma.SymptomWhereInput = { isActive: true };
    
    if (diseaseId) {
      whereCondition.diseaseId = diseaseId;
    }

    return await prisma.symptom.count({
      where: whereCondition,
    });
  }

  static async getSymptomCountByDisease(): Promise<Array<{
    diseaseId: string;
    diseaseName: string;
    symptomCount: number;
  }>> {
    try {
      const result = await prisma.symptom.groupBy({
        by: ['diseaseId'],
        where: { isActive: true },
        _count: {
          id: true,
        },
      });

      // Get disease names for each group
      const symptomsWithDiseaseNames = await Promise.all(
        result.map(async (item) => {
          const disease = await prisma.disease.findFirst({
            where: { id: item.diseaseId },
            select: { thaiName: true },
          });

          return {
            diseaseId: item.diseaseId,
            diseaseName: disease?.thaiName || 'ไม่ทราบ',
            symptomCount: item._count.id,
          };
        })
      );

      return symptomsWithDiseaseNames;
    } catch (error) {
      console.error('Get symptom count by disease error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสถิติอาการ');
    }
  }
}