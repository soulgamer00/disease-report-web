// backend/src/services/patientVisit.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CalculationService } from './calculation.service';
import { DiseaseService } from './disease.service';
import { HospitalService } from './hospital.service';
import {
  CreatePatientVisitRequest,
  UpdatePatientVisitRequest,
  PatientVisitQueryParams,
  PatientVisitInfo,
} from '../schemas/patientVisit.schema';

// ============================================
// PATIENT VISIT SERVICE CLASS
// ============================================

export class PatientVisitService {

  // ============================================
  // GET PATIENT VISITS LIST WITH PAGINATION
  // ============================================

  static async getPatientVisits(queryParams: PatientVisitQueryParams): Promise<{
    patientVisits: PatientVisitInfo[];
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
      diseaseId, 
      hospitalCode9eDigit, 
      gender, 
      patientType, 
      patientCondition,
      startDate, 
      endDate, 
      ageMin, 
      ageMax, 
      sortBy, 
      sortOrder, 
      isActive 
    } = queryParams;

    // Build search conditions
    const searchConditions: Prisma.PatientVisitWhereInput = {
      isActive: isActive !== undefined ? isActive : true, // Default to active only
    };

    // Add disease filter
    if (diseaseId) {
      searchConditions.diseaseId = diseaseId;
    }

    // Add hospital filter
    if (hospitalCode9eDigit) {
      searchConditions.hospitalCode9eDigit = hospitalCode9eDigit;
    }

    // Add gender filter
    if (gender) {
      searchConditions.gender = gender;
    }

    // Add patient type filter
    if (patientType) {
      searchConditions.patientType = patientType;
    }

    // Add patient condition filter
    if (patientCondition) {
      searchConditions.patientCondition = patientCondition;
    }

    // Add date range filter
    if (startDate || endDate) {
      searchConditions.illnessDate = {};
      if (startDate) {
        searchConditions.illnessDate.gte = startDate;
      }
      if (endDate) {
        searchConditions.illnessDate.lte = endDate;
      }
    }

    // Add age range filter
    if (ageMin || ageMax) {
      searchConditions.ageAtIllness = {};
      if (ageMin) {
        searchConditions.ageAtIllness.gte = ageMin;
      }
      if (ageMax) {
        searchConditions.ageAtIllness.lte = ageMax;
      }
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      searchConditions.OR = [
        { fname: { contains: search, mode: 'insensitive' } },
        { lname: { contains: search, mode: 'insensitive' } },
        { idCardCode: { contains: search, mode: 'insensitive' } },
        { hospitalCode9eDigit: { contains: search, mode: 'insensitive' } },
        { disease: { thaiName: { contains: search, mode: 'insensitive' } } },
        { disease: { engName: { contains: search, mode: 'insensitive' } } },
        { hospital: { hospitalName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: Prisma.PatientVisitOrderByWithRelationInput = {};
    if (sortBy === 'fname' || sortBy === 'lname') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    try {
      // Execute queries in parallel
      const [patientVisits, totalCount] = await Promise.all([
        prisma.patientVisit.findMany({
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
        prisma.patientVisit.count({
          where: searchConditions,
        }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Transform data to match response schema
      const transformedPatientVisits: PatientVisitInfo[] = patientVisits.map(visit => ({
        id: visit.id,
        idCardCode: visit.idCardCode,
        namePrefix: visit.namePrefix,
        fname: visit.fname,
        lname: visit.lname,
        gender: visit.gender,
        birthday: visit.birthday,
        ageAtIllness: visit.ageAtIllness,
        nationality: visit.nationality,
        maritalStatus: visit.maritalStatus,
        occupation: visit.occupation,
        phoneNumber: visit.phoneNumber,
        currentHouseNumber: visit.currentHouseNumber,
        currentVillageNumber: visit.currentVillageNumber,
        currentRoadName: visit.currentRoadName,
        currentProvince: visit.currentProvince,
        currentDistrict: visit.currentDistrict,
        currentSubDistrict: visit.currentSubDistrict,
        addressSickHouseNumber: visit.addressSickHouseNumber,
        addressSickVillageNumber: visit.addressSickVillageNumber,
        addressSickRoadName: visit.addressSickRoadName,
        addressSickProvince: visit.addressSickProvince,
        addressSickDistrict: visit.addressSickDistrict,
        addressSickSubDistrict: visit.addressSickSubDistrict,
        diseaseId: visit.diseaseId,
        symptomsOfDisease: visit.symptomsOfDisease,
        treatmentArea: visit.treatmentArea,
        treatmentHospital: visit.treatmentHospital,
        illnessDate: visit.illnessDate,
        treatmentDate: visit.treatmentDate,
        diagnosisDate: visit.diagnosisDate,
        diagnosis1: visit.diagnosis1,
        diagnosis2: visit.diagnosis2,
        patientType: visit.patientType,
        patientCondition: visit.patientCondition,
        deathDate: visit.deathDate,
        causeOfDeath: visit.causeOfDeath,
        receivingProvince: visit.receivingProvince,
        hospitalCode9eDigit: visit.hospitalCode9eDigit,
        reportName: visit.reportName,
        remarks: visit.remarks,
        createdBy: visit.createdBy,
        isActive: visit.isActive,
        createdAt: visit.createdAt,
        updatedAt: visit.updatedAt,
        disease: visit.disease,
        hospital: visit.hospital,
      }));

      return {
        patientVisits: transformedPatientVisits,
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
      console.error('Patient visit list service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลรายการผู้ป่วย');
    }
  }

  // ============================================
  // GET PATIENT VISIT BY ID
  // ============================================

  static async getPatientVisitById(patientVisitId: string): Promise<PatientVisitInfo> {
    try {
      const patientVisit = await prisma.patientVisit.findFirst({
        where: {
          id: patientVisitId,
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

      if (!patientVisit) {
        throw new Error('ไม่พบข้อมูลผู้ป่วยที่ระบุ');
      }

      // Transform data to match response schema
      const transformedPatientVisit: PatientVisitInfo = {
        id: patientVisit.id,
        idCardCode: patientVisit.idCardCode,
        namePrefix: patientVisit.namePrefix,
        fname: patientVisit.fname,
        lname: patientVisit.lname,
        gender: patientVisit.gender,
        birthday: patientVisit.birthday,
        ageAtIllness: patientVisit.ageAtIllness,
        nationality: patientVisit.nationality,
        maritalStatus: patientVisit.maritalStatus,
        occupation: patientVisit.occupation,
        phoneNumber: patientVisit.phoneNumber,
        currentHouseNumber: patientVisit.currentHouseNumber,
        currentVillageNumber: patientVisit.currentVillageNumber,
        currentRoadName: patientVisit.currentRoadName,
        currentProvince: patientVisit.currentProvince,
        currentDistrict: patientVisit.currentDistrict,
        currentSubDistrict: patientVisit.currentSubDistrict,
        addressSickHouseNumber: patientVisit.addressSickHouseNumber,
        addressSickVillageNumber: patientVisit.addressSickVillageNumber,
        addressSickRoadName: patientVisit.addressSickRoadName,
        addressSickProvince: patientVisit.addressSickProvince,
        addressSickDistrict: patientVisit.addressSickDistrict,
        addressSickSubDistrict: patientVisit.addressSickSubDistrict,
        diseaseId: patientVisit.diseaseId,
        symptomsOfDisease: patientVisit.symptomsOfDisease,
        treatmentArea: patientVisit.treatmentArea,
        treatmentHospital: patientVisit.treatmentHospital,
        illnessDate: patientVisit.illnessDate,
        treatmentDate: patientVisit.treatmentDate,
        diagnosisDate: patientVisit.diagnosisDate,
        diagnosis1: patientVisit.diagnosis1,
        diagnosis2: patientVisit.diagnosis2,
        patientType: patientVisit.patientType,
        patientCondition: patientVisit.patientCondition,
        deathDate: patientVisit.deathDate,
        causeOfDeath: patientVisit.causeOfDeath,
        receivingProvince: patientVisit.receivingProvince,
        hospitalCode9eDigit: patientVisit.hospitalCode9eDigit,
        reportName: patientVisit.reportName,
        remarks: patientVisit.remarks,
        createdBy: patientVisit.createdBy,
        isActive: patientVisit.isActive,
        createdAt: patientVisit.createdAt,
        updatedAt: patientVisit.updatedAt,
        disease: patientVisit.disease,
        hospital: patientVisit.hospital,
      };

      return transformedPatientVisit;
    } catch (error) {
      console.error('Get patient visit by ID service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย');
    }
  }

  // ============================================
  // CREATE NEW PATIENT VISIT
  // ============================================

  static async createPatientVisit(
    patientVisitData: CreatePatientVisitRequest,
    createdBy: string
  ): Promise<PatientVisitInfo> {
    try {
      // Validate disease exists
      const diseaseExists = await DiseaseService.validateDiseaseExists(patientVisitData.diseaseId);
      if (!diseaseExists) {
        throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
      }

      // Validate hospital exists
      const hospitalExists = await HospitalService.validateHospitalCodeExists(patientVisitData.hospitalCode9eDigit);
      if (!hospitalExists) {
        throw new Error('ไม่พบข้อมูลโรงพยาบาลที่ระบุ');
      }

      // Calculate age at illness
      const ageAtIllness = CalculationService.calculateAgeAtIllness(
        patientVisitData.birthday,
        patientVisitData.illnessDate
      );

      // Create new patient visit
      const newPatientVisit = await prisma.patientVisit.create({
        data: {
          idCardCode: patientVisitData.idCardCode,
          namePrefix: patientVisitData.namePrefix,
          fname: patientVisitData.fname,
          lname: patientVisitData.lname,
          gender: patientVisitData.gender,
          birthday: patientVisitData.birthday,
          ageAtIllness, // Auto-calculated
          nationality: patientVisitData.nationality,
          maritalStatus: patientVisitData.maritalStatus,
          occupation: patientVisitData.occupation,
          phoneNumber: patientVisitData.phoneNumber || null,
          currentHouseNumber: patientVisitData.currentHouseNumber || null,
          currentVillageNumber: patientVisitData.currentVillageNumber || null,
          currentRoadName: patientVisitData.currentRoadName || null,
          currentProvince: patientVisitData.currentProvince || null,
          currentDistrict: patientVisitData.currentDistrict || null,
          currentSubDistrict: patientVisitData.currentSubDistrict || null,
          addressSickHouseNumber: patientVisitData.addressSickHouseNumber || null,
          addressSickVillageNumber: patientVisitData.addressSickVillageNumber || null,
          addressSickRoadName: patientVisitData.addressSickRoadName || null,
          addressSickProvince: patientVisitData.addressSickProvince,
          addressSickDistrict: patientVisitData.addressSickDistrict || null,
          addressSickSubDistrict: patientVisitData.addressSickSubDistrict || null,
          diseaseId: patientVisitData.diseaseId,
          symptomsOfDisease: patientVisitData.symptomsOfDisease || null,
          treatmentArea: patientVisitData.treatmentArea,
          treatmentHospital: patientVisitData.treatmentHospital || null,
          illnessDate: patientVisitData.illnessDate,
          treatmentDate: patientVisitData.treatmentDate,
          diagnosisDate: patientVisitData.diagnosisDate,
          diagnosis1: patientVisitData.diagnosis1 || null,
          diagnosis2: patientVisitData.diagnosis2 || null,
          patientType: patientVisitData.patientType,
          patientCondition: patientVisitData.patientCondition,
          deathDate: patientVisitData.deathDate || null,
          causeOfDeath: patientVisitData.causeOfDeath || null,
          receivingProvince: patientVisitData.receivingProvince,
          hospitalCode9eDigit: patientVisitData.hospitalCode9eDigit,
          reportName: patientVisitData.reportName || null,
          remarks: patientVisitData.remarks || null,
          createdBy,
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
      const transformedPatientVisit: PatientVisitInfo = {
        id: newPatientVisit.id,
        idCardCode: newPatientVisit.idCardCode,
        namePrefix: newPatientVisit.namePrefix,
        fname: newPatientVisit.fname,
        lname: newPatientVisit.lname,
        gender: newPatientVisit.gender,
        birthday: newPatientVisit.birthday,
        ageAtIllness: newPatientVisit.ageAtIllness,
        nationality: newPatientVisit.nationality,
        maritalStatus: newPatientVisit.maritalStatus,
        occupation: newPatientVisit.occupation,
        phoneNumber: newPatientVisit.phoneNumber,
        currentHouseNumber: newPatientVisit.currentHouseNumber,
        currentVillageNumber: newPatientVisit.currentVillageNumber,
        currentRoadName: newPatientVisit.currentRoadName,
        currentProvince: newPatientVisit.currentProvince,
        currentDistrict: newPatientVisit.currentDistrict,
        currentSubDistrict: newPatientVisit.currentSubDistrict,
        addressSickHouseNumber: newPatientVisit.addressSickHouseNumber,
        addressSickVillageNumber: newPatientVisit.addressSickVillageNumber,
        addressSickRoadName: newPatientVisit.addressSickRoadName,
        addressSickProvince: newPatientVisit.addressSickProvince,
        addressSickDistrict: newPatientVisit.addressSickDistrict,
        addressSickSubDistrict: newPatientVisit.addressSickSubDistrict,
        diseaseId: newPatientVisit.diseaseId,
        symptomsOfDisease: newPatientVisit.symptomsOfDisease,
        treatmentArea: newPatientVisit.treatmentArea,
        treatmentHospital: newPatientVisit.treatmentHospital,
        illnessDate: newPatientVisit.illnessDate,
        treatmentDate: newPatientVisit.treatmentDate,
        diagnosisDate: newPatientVisit.diagnosisDate,
        diagnosis1: newPatientVisit.diagnosis1,
        diagnosis2: newPatientVisit.diagnosis2,
        patientType: newPatientVisit.patientType,
        patientCondition: newPatientVisit.patientCondition,
        deathDate: newPatientVisit.deathDate,
        causeOfDeath: newPatientVisit.causeOfDeath,
        receivingProvince: newPatientVisit.receivingProvince,
        hospitalCode9eDigit: newPatientVisit.hospitalCode9eDigit,
        reportName: newPatientVisit.reportName,
        remarks: newPatientVisit.remarks,
        createdBy: newPatientVisit.createdBy,
        isActive: newPatientVisit.isActive,
        createdAt: newPatientVisit.createdAt,
        updatedAt: newPatientVisit.updatedAt,
        disease: newPatientVisit.disease,
        hospital: newPatientVisit.hospital,
      };

      return transformedPatientVisit;
    } catch (error) {
      console.error('Create patient visit service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการสร้างข้อมูลผู้ป่วย');
    }
  }

  // ============================================
  // UPDATE PATIENT VISIT
  // ============================================

  static async updatePatientVisit(
    patientVisitId: string,
    updateData: UpdatePatientVisitRequest
  ): Promise<PatientVisitInfo> {
    try {
      // Check if patient visit exists and is active
      const existingPatientVisit = await prisma.patientVisit.findFirst({
        where: {
          id: patientVisitId,
          isActive: true,
        },
      });

      if (!existingPatientVisit) {
        throw new Error('ไม่พบข้อมูลผู้ป่วยที่ต้องการแก้ไข');
      }

      // Validate disease if updating
      if (updateData.diseaseId) {
        const diseaseExists = await DiseaseService.validateDiseaseExists(updateData.diseaseId);
        if (!diseaseExists) {
          throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
        }
      }

      // Validate hospital if updating
      if (updateData.hospitalCode9eDigit) {
        const hospitalExists = await HospitalService.validateHospitalCodeExists(updateData.hospitalCode9eDigit);
        if (!hospitalExists) {
          throw new Error('ไม่พบข้อมูลโรงพยาบาลที่ระบุ');
        }
      }

      // Prepare update data
      const updatePayload: Prisma.PatientVisitUpdateInput = {};

      // Personal information
      if (updateData.idCardCode !== undefined) updatePayload.idCardCode = updateData.idCardCode;
      if (updateData.namePrefix !== undefined) updatePayload.namePrefix = updateData.namePrefix;
      if (updateData.fname !== undefined) updatePayload.fname = updateData.fname;
      if (updateData.lname !== undefined) updatePayload.lname = updateData.lname;
      if (updateData.gender !== undefined) updatePayload.gender = updateData.gender;
      if (updateData.nationality !== undefined) updatePayload.nationality = updateData.nationality;
      if (updateData.maritalStatus !== undefined) updatePayload.maritalStatus = updateData.maritalStatus;
      if (updateData.occupation !== undefined) updatePayload.occupation = updateData.occupation;
      if (updateData.phoneNumber !== undefined) updatePayload.phoneNumber = updateData.phoneNumber;

      // Recalculate age if birthday or illness date is updated
      if (updateData.birthday !== undefined || updateData.illnessDate !== undefined) {
        const birthday = updateData.birthday || existingPatientVisit.birthday;
        const illnessDate = updateData.illnessDate || existingPatientVisit.illnessDate;
        updatePayload.ageAtIllness = CalculationService.calculateAgeAtIllness(birthday, illnessDate);
      }

      if (updateData.birthday !== undefined) updatePayload.birthday = updateData.birthday;

      // Current address
      if (updateData.currentHouseNumber !== undefined) updatePayload.currentHouseNumber = updateData.currentHouseNumber;
      if (updateData.currentVillageNumber !== undefined) updatePayload.currentVillageNumber = updateData.currentVillageNumber;
      if (updateData.currentRoadName !== undefined) updatePayload.currentRoadName = updateData.currentRoadName;
      if (updateData.currentProvince !== undefined) updatePayload.currentProvince = updateData.currentProvince;
      if (updateData.currentDistrict !== undefined) updatePayload.currentDistrict = updateData.currentDistrict;
      if (updateData.currentSubDistrict !== undefined) updatePayload.currentSubDistrict = updateData.currentSubDistrict;

      // Sick address
      if (updateData.addressSickHouseNumber !== undefined) updatePayload.addressSickHouseNumber = updateData.addressSickHouseNumber;
      if (updateData.addressSickVillageNumber !== undefined) updatePayload.addressSickVillageNumber = updateData.addressSickVillageNumber;
      if (updateData.addressSickRoadName !== undefined) updatePayload.addressSickRoadName = updateData.addressSickRoadName;
      if (updateData.addressSickProvince !== undefined) updatePayload.addressSickProvince = updateData.addressSickProvince;
      if (updateData.addressSickDistrict !== undefined) updatePayload.addressSickDistrict = updateData.addressSickDistrict;
      if (updateData.addressSickSubDistrict !== undefined) updatePayload.addressSickSubDistrict = updateData.addressSickSubDistrict;

      // Disease information
      if (updateData.diseaseId !== undefined) {
        updatePayload.disease = {
          connect: { id: updateData.diseaseId }
        };
      }
      if (updateData.symptomsOfDisease !== undefined) updatePayload.symptomsOfDisease = updateData.symptomsOfDisease;

      // Treatment information
      if (updateData.treatmentArea !== undefined) updatePayload.treatmentArea = updateData.treatmentArea;
      if (updateData.treatmentHospital !== undefined) updatePayload.treatmentHospital = updateData.treatmentHospital;

      // Dates
      if (updateData.illnessDate !== undefined) updatePayload.illnessDate = updateData.illnessDate;
      if (updateData.treatmentDate !== undefined) updatePayload.treatmentDate = updateData.treatmentDate;
      if (updateData.diagnosisDate !== undefined) updatePayload.diagnosisDate = updateData.diagnosisDate;

      // Diagnosis
      if (updateData.diagnosis1 !== undefined) updatePayload.diagnosis1 = updateData.diagnosis1;
      if (updateData.diagnosis2 !== undefined) updatePayload.diagnosis2 = updateData.diagnosis2;

      // Patient type & condition
      if (updateData.patientType !== undefined) updatePayload.patientType = updateData.patientType;
      if (updateData.patientCondition !== undefined) updatePayload.patientCondition = updateData.patientCondition;
      if (updateData.deathDate !== undefined) updatePayload.deathDate = updateData.deathDate;
      if (updateData.causeOfDeath !== undefined) updatePayload.causeOfDeath = updateData.causeOfDeath;

      // Hospital & reporting
      if (updateData.receivingProvince !== undefined) updatePayload.receivingProvince = updateData.receivingProvince;
      if (updateData.hospitalCode9eDigit !== undefined) {
        updatePayload.hospital = {
          connect: { hospitalCode9eDigit: updateData.hospitalCode9eDigit }
        };
      }
      if (updateData.reportName !== undefined) updatePayload.reportName = updateData.reportName;
      if (updateData.remarks !== undefined) updatePayload.remarks = updateData.remarks;

      // Update patient visit
      const updatedPatientVisit = await prisma.patientVisit.update({
        where: { id: patientVisitId },
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
      const transformedPatientVisit: PatientVisitInfo = {
        id: updatedPatientVisit.id,
        idCardCode: updatedPatientVisit.idCardCode,
        namePrefix: updatedPatientVisit.namePrefix,
        fname: updatedPatientVisit.fname,
        lname: updatedPatientVisit.lname,
        gender: updatedPatientVisit.gender,
        birthday: updatedPatientVisit.birthday,
        ageAtIllness: updatedPatientVisit.ageAtIllness,
        nationality: updatedPatientVisit.nationality,
        maritalStatus: updatedPatientVisit.maritalStatus,
        occupation: updatedPatientVisit.occupation,
        phoneNumber: updatedPatientVisit.phoneNumber,
        currentHouseNumber: updatedPatientVisit.currentHouseNumber,
        currentVillageNumber: updatedPatientVisit.currentVillageNumber,
        currentRoadName: updatedPatientVisit.currentRoadName,
        currentProvince: updatedPatientVisit.currentProvince,
        currentDistrict: updatedPatientVisit.currentDistrict,
        currentSubDistrict: updatedPatientVisit.currentSubDistrict,
        addressSickHouseNumber: updatedPatientVisit.addressSickHouseNumber,
        addressSickVillageNumber: updatedPatientVisit.addressSickVillageNumber,
        addressSickRoadName: updatedPatientVisit.addressSickRoadName,
        addressSickProvince: updatedPatientVisit.addressSickProvince,
        addressSickDistrict: updatedPatientVisit.addressSickDistrict,
        addressSickSubDistrict: updatedPatientVisit.addressSickSubDistrict,
        diseaseId: updatedPatientVisit.diseaseId,
        symptomsOfDisease: updatedPatientVisit.symptomsOfDisease,
        treatmentArea: updatedPatientVisit.treatmentArea,
        treatmentHospital: updatedPatientVisit.treatmentHospital,
        illnessDate: updatedPatientVisit.illnessDate,
        treatmentDate: updatedPatientVisit.treatmentDate,
        diagnosisDate: updatedPatientVisit.diagnosisDate,
        diagnosis1: updatedPatientVisit.diagnosis1,
        diagnosis2: updatedPatientVisit.diagnosis2,
        patientType: updatedPatientVisit.patientType,
        patientCondition: updatedPatientVisit.patientCondition,
        deathDate: updatedPatientVisit.deathDate,
        causeOfDeath: updatedPatientVisit.causeOfDeath,
        receivingProvince: updatedPatientVisit.receivingProvince,
        hospitalCode9eDigit: updatedPatientVisit.hospitalCode9eDigit,
        reportName: updatedPatientVisit.reportName,
        remarks: updatedPatientVisit.remarks,
        createdBy: updatedPatientVisit.createdBy,
        isActive: updatedPatientVisit.isActive,
        createdAt: updatedPatientVisit.createdAt,
        updatedAt: updatedPatientVisit.updatedAt,
        disease: updatedPatientVisit.disease,
        hospital: updatedPatientVisit.hospital,
      };

      return transformedPatientVisit;
    } catch (error) {
      console.error('Update patient visit service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ป่วย');
    }
  }

  // ============================================
  // SOFT DELETE PATIENT VISIT
  // ============================================

  static async deletePatientVisit(patientVisitId: string): Promise<{ deletedAt: Date }> {
    try {
      // Check if patient visit exists and is active
      const existingPatientVisit = await prisma.patientVisit.findFirst({
        where: {
          id: patientVisitId,
          isActive: true,
        },
      });

      if (!existingPatientVisit) {
        throw new Error('ไม่พบข้อมูลผู้ป่วยที่ต้องการลบ');
      }

      // Soft delete patient visit
      const updatedPatientVisit = await prisma.patientVisit.update({
        where: { id: patientVisitId },
        data: { isActive: false },
      });

      return {
        deletedAt: updatedPatientVisit.updatedAt,
      };
    } catch (error) {
      console.error('Delete patient visit service error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('เกิดข้อผิดพลาดในการลบข้อมูลผู้ป่วย');
    }
  }

  // ============================================
  // GET PATIENT VISIT STATISTICS
  // ============================================

  static async getPatientVisitStatistics(
    hospitalCode9eDigit?: string,
    year?: number,
    diseaseId?: string
  ): Promise<{
    totalPatients: number;
    byGender: {
      male: number;
      female: number;
      malePercentage: number;
      femalePercentage: number;
    };
    byPatientType: Array<{
      patientType: string;
      count: number;
      percentage: number;
    }>;
    byPatientCondition: Array<{
      patientCondition: string;
      count: number;
      percentage: number;
    }>;
    byDisease: Array<{
      diseaseId: string;
      diseaseName: string;
      count: number;
      percentage: number;
    }>;
  }> {
    try {
      // Build where condition
      const whereCondition: Prisma.PatientVisitWhereInput = {
        isActive: true,
      };

      if (hospitalCode9eDigit) {
        whereCondition.hospitalCode9eDigit = hospitalCode9eDigit;
      }

      if (year) {
        whereCondition.illnessDate = {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        };
      }

      if (diseaseId) {
        whereCondition.diseaseId = diseaseId;
      }

      // Get total count
      const totalPatients = await prisma.patientVisit.count({
        where: whereCondition,
      });

      if (totalPatients === 0) {
        return {
          totalPatients: 0,
          byGender: { male: 0, female: 0, malePercentage: 0, femalePercentage: 0 },
          byPatientType: [],
          byPatientCondition: [],
          byDisease: [],
        };
      }

      // Get statistics in parallel
      const [
        genderStats,
        patientTypeStats,
        patientConditionStats,
        diseaseStats,
      ] = await Promise.all([
        // Gender statistics
        prisma.patientVisit.groupBy({
          by: ['gender'],
          where: whereCondition,
          _count: { id: true },
        }),

        // Patient type statistics
        prisma.patientVisit.groupBy({
          by: ['patientType'],
          where: whereCondition,
          _count: { id: true },
        }),

        // Patient condition statistics
        prisma.patientVisit.groupBy({
          by: ['patientCondition'],
          where: whereCondition,
          _count: { id: true },
        }),

        // Disease statistics
        prisma.patientVisit.groupBy({
          by: ['diseaseId'],
          where: whereCondition,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10, // Top 10 diseases
        }),
      ]);

      // Process gender statistics
      const maleCount = genderStats.find(g => g.gender === 'MALE')?._count.id || 0;
      const femaleCount = genderStats.find(g => g.gender === 'FEMALE')?._count.id || 0;

      const byGender = {
        male: maleCount,
        female: femaleCount,
        malePercentage: CalculationService.calculatePercentage(maleCount, totalPatients),
        femalePercentage: CalculationService.calculatePercentage(femaleCount, totalPatients),
      };

      // Process patient type statistics
      const byPatientType = patientTypeStats.map(stat => ({
        patientType: stat.patientType,
        count: stat._count.id,
        percentage: CalculationService.calculatePercentage(stat._count.id, totalPatients),
      }));

      // Process patient condition statistics
      const byPatientCondition = patientConditionStats.map(stat => ({
        patientCondition: stat.patientCondition,
        count: stat._count.id,
        percentage: CalculationService.calculatePercentage(stat._count.id, totalPatients),
      }));

      // Process disease statistics with disease names
      const diseaseIds = diseaseStats.map(stat => stat.diseaseId);
      const diseases = await prisma.disease.findMany({
        where: {
          id: { in: diseaseIds },
          isActive: true,
        },
        select: {
          id: true,
          thaiName: true,
        },
      });

      const byDisease = diseaseStats.map(stat => {
        const disease = diseases.find(d => d.id === stat.diseaseId);
        return {
          diseaseId: stat.diseaseId,
          diseaseName: disease?.thaiName || 'ไม่ทราบ',
          count: stat._count.id,
          percentage: CalculationService.calculatePercentage(stat._count.id, totalPatients),
        };
      });

      return {
        totalPatients,
        byGender,
        byPatientType,
        byPatientCondition,
        byDisease,
      };
    } catch (error) {
      console.error('Get patient visit statistics service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลสถิติผู้ป่วย');
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  static async validatePatientVisitExists(patientVisitId: string): Promise<boolean> {
    const patientVisit = await prisma.patientVisit.findFirst({
      where: {
        id: patientVisitId,
        isActive: true,
      },
    });
    return !!patientVisit;
  }

  static async getPatientVisitCount(
    hospitalCode9eDigit?: string,
    year?: number,
    diseaseId?: string
  ): Promise<number> {
    const whereCondition: Prisma.PatientVisitWhereInput = { isActive: true };
    
    if (hospitalCode9eDigit) {
      whereCondition.hospitalCode9eDigit = hospitalCode9eDigit;
    }

    if (year) {
      whereCondition.illnessDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }

    if (diseaseId) {
      whereCondition.diseaseId = diseaseId;
    }

    return await prisma.patientVisit.count({
      where: whereCondition,
    });
  }

  static async getPatientVisitsByIdCardCode(idCardCode: string): Promise<PatientVisitInfo[]> {
    try {
      const patientVisits = await prisma.patientVisit.findMany({
        where: {
          idCardCode,
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
        orderBy: { illnessDate: 'desc' },
      });

      // Transform data to match response schema
      return patientVisits.map(visit => ({
        id: visit.id,
        idCardCode: visit.idCardCode,
        namePrefix: visit.namePrefix,
        fname: visit.fname,
        lname: visit.lname,
        gender: visit.gender,
        birthday: visit.birthday,
        ageAtIllness: visit.ageAtIllness,
        nationality: visit.nationality,
        maritalStatus: visit.maritalStatus,
        occupation: visit.occupation,
        phoneNumber: visit.phoneNumber,
        currentHouseNumber: visit.currentHouseNumber,
        currentVillageNumber: visit.currentVillageNumber,
        currentRoadName: visit.currentRoadName,
        currentProvince: visit.currentProvince,
        currentDistrict: visit.currentDistrict,
        currentSubDistrict: visit.currentSubDistrict,
        addressSickHouseNumber: visit.addressSickHouseNumber,
        addressSickVillageNumber: visit.addressSickVillageNumber,
        addressSickRoadName: visit.addressSickRoadName,
        addressSickProvince: visit.addressSickProvince,
        addressSickDistrict: visit.addressSickDistrict,
        addressSickSubDistrict: visit.addressSickSubDistrict,
        diseaseId: visit.diseaseId,
        symptomsOfDisease: visit.symptomsOfDisease,
        treatmentArea: visit.treatmentArea,
        treatmentHospital: visit.treatmentHospital,
        illnessDate: visit.illnessDate,
        treatmentDate: visit.treatmentDate,
        diagnosisDate: visit.diagnosisDate,
        diagnosis1: visit.diagnosis1,
        diagnosis2: visit.diagnosis2,
        patientType: visit.patientType,
        patientCondition: visit.patientCondition,
        deathDate: visit.deathDate,
        causeOfDeath: visit.causeOfDeath,
        receivingProvince: visit.receivingProvince,
        hospitalCode9eDigit: visit.hospitalCode9eDigit,
        reportName: visit.reportName,
        remarks: visit.remarks,
        createdBy: visit.createdBy,
        isActive: visit.isActive,
        createdAt: visit.createdAt,
        updatedAt: visit.updatedAt,
        disease: visit.disease,
        hospital: visit.hospital,
      }));
    } catch (error) {
      console.error('Get patient visits by ID card service error:', error);
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลประวัติผู้ป่วย');
    }
  }
}