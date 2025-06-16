// backend/src/services/report.service.ts

import { prisma } from '../lib/prisma';
import { ReportUtils } from '../utils/report.utils';
import {
  ReportFilters,
  DiseaseInfo,
  AgeGroupData,
  HospitalStats,
  OccupationData,
  DiseaseItem,
  HospitalItem,
} from '../schemas/report.schema';

// ============================================
// REPORT SERVICE CLASS
// ============================================

export class ReportService {

  // ============================================
  // DISEASE & HOSPITAL UTILITIES
  // ============================================

  /**
   * Get disease information by ID
   */
  static async getDiseaseInfo(diseaseId: string): Promise<DiseaseInfo | null> {
    try {
      const disease = await prisma.disease.findUnique({
        where: { 
          id: diseaseId,
          isActive: true 
        },
        select: {
          id: true,
          thaiName: true,
          engName: true,
          shortName: true
        }
      });
      
      return disease ? {
        id: parseInt(disease.id), // Convert to number for consistency with competitor example
        thaiName: disease.thaiName,
        engName: disease.engName,
        daName: disease.shortName // Using shortName as daName equivalent
      } : null;

    } catch (error) {
      console.error('Error fetching disease info:', error);
      return null;
    }
  }

  /**
   * Get all active diseases for dropdown
   */
  static async getAllDiseases(): Promise<DiseaseItem[]> {
    return await prisma.disease.findMany({
      where: { isActive: true },
      select: {
        id: true,
        engName: true,
        thaiName: true,
        shortName: true,
        details: true,
        createdAt: true,
        updatedAt: true,
        isActive: true
      },
      orderBy: { thaiName: 'asc' }
    });
  }

  /**
   * Get hospitals list for dropdown
   */
  static async getHospitals(): Promise<HospitalItem[]> {
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      select: {
        id: true,
        hospitalName: true,
        hospitalCode9eDigit: true
      },
      orderBy: { hospitalName: 'asc' }
    });
    
    return hospitals.map(ReportUtils.formatHospitalForDropdown);
  }

  /**
   * Get population data for incidence rate calculation
   */
  static async getPopulationData(filters: ReportFilters) {
    try {
      const where = ReportUtils.buildPopulationWhereConditions(filters);

      const populations = await prisma.population.findMany({
        where,
        include: {
          hospital: {
            select: {
              hospitalName: true,
              hospitalCode9eDigit: true
            }
          }
        }
      });

      const totalPopulation = populations.reduce((sum, pop) => sum + pop.count, 0);
      
      return { totalPopulation, populations };
    } catch (error) {
      console.error('Error fetching population data:', error);
      return { totalPopulation: 0, populations: [] };
    }
  }

  /**
   * Get public statistics
   */
  static async getPublicStats() {
    const totalDiseases = await prisma.disease.count({
      where: { isActive: true }
    });
    
    const totalPatients = await prisma.patientVisit.count({
      where: { isActive: true }
    });
    
    const { start: startOfMonth, end: endOfMonth } = ReportUtils.getCurrentMonthRange();
    
    const currentMonthPatients = await prisma.patientVisit.count({
      where: {
        isActive: true,
        illnessDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });
    
    return {
      totalDiseases,
      totalPatients,
      currentMonthPatients
    };
  }

  // ============================================
  // AGE GROUPS REPORT
  // ============================================

  /**
   * Generate age groups report
   */
  static async getAgeGroupsReport(filters: ReportFilters) {
    // Get disease info
    const disease = await this.getDiseaseInfo(filters.diseaseId);
    if (!disease) {
      throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
    }

    // Build where conditions
    const where = ReportUtils.buildWhereConditions(filters);

    // Get patient data
    const patients = await prisma.patientVisit.findMany({
      where,
      select: {
        ageAtIllness: true,
        birthday: true,
        illnessDate: true
      }
    });

    // Calculate age groups
    const ageGroupCounts: Record<string, number> = {};
    const ageOrder = ReportUtils.getAgeGroupOrder();

    // Initialize all age groups to 0
    ageOrder.forEach(group => {
      ageGroupCounts[group] = 0;
    });

    // Count patients in each age group
    patients.forEach(patient => {
      let age = patient.ageAtIllness || 0;
      
      // If age_at_illness is not available, calculate from birthday and illness_date
      if (!age && patient.birthday && patient.illnessDate) {
        age = ReportUtils.calculateAge(patient.birthday, patient.illnessDate);
      }
      
      const ageGroup = ReportUtils.getAgeGroup(age);
      ageGroupCounts[ageGroup] = (ageGroupCounts[ageGroup] || 0) + 1;
    });

    // Get population data for incidence rate calculation
    const { totalPopulation } = await this.getPopulationData(filters);

    // Calculate total patients
    const totalPatients = patients.length;

    // Format response
    const ageGroups: AgeGroupData[] = ageOrder.map(group => ({
      ageGroup: group,
      count: ageGroupCounts[group] || 0,
      percentage: ReportUtils.calculatePercentage(ageGroupCounts[group] || 0, totalPatients),
      incidenceRate: ReportUtils.calculateIncidenceRate(ageGroupCounts[group] || 0, totalPopulation)
    })).filter(group => group.count > 0); // Only include groups with patients

    return {
      disease,
      filters,
      summary: {
        totalPatients,
        totalPopulation,
        hasPopulationData: totalPopulation > 0
      },
      ageGroups
    };
  }

  // ============================================
  // GENDER RATIO REPORT
  // ============================================

  /**
   * Generate gender ratio report
   */
  static async getGenderRatioReport(filters: ReportFilters) {
    const disease = await this.getDiseaseInfo(filters.diseaseId);
    if (!disease) {
      throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
    }

    // Build where conditions (exclude gender from filter for analysis)
    const where = ReportUtils.buildWhereConditions({ ...filters, gender: 'all' });

    // Get gender distribution
    const genderCounts = await prisma.patientVisit.groupBy({
      by: ['gender'],
      where,
      _count: {
        gender: true
      }
    });

    // Process gender data
    const { genderData, ratio, percentages } = ReportUtils.processGenderData(genderCounts);

    // Get population data
    const { totalPopulation } = await this.getPopulationData(filters);

    return {
      disease,
      filters,
      summary: {
        total: genderData.total,
        male: genderData.male,
        female: genderData.female,
        other: genderData.other,
        notSpecified: genderData.notSpecified,
        totalPopulation,
        hasPopulationData: totalPopulation > 0
      },
      ratio,
      percentages
    };
  }

  // ============================================
  // INCIDENCE RATES REPORT
  // ============================================

  /**
   * Generate incidence rates report
   */
  static async getIncidenceRatesReport(filters: ReportFilters) {
    const disease = await this.getDiseaseInfo(filters.diseaseId);
    if (!disease) {
      throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
    }

    const where = ReportUtils.buildWhereConditions(filters);

    // Get total patients
    const totalPatients = await prisma.patientVisit.count({ where });

    // Get deaths (patients who died)
    const deaths = await prisma.patientVisit.count({
      where: {
        ...where,
        OR: ReportUtils.getDeathConditions()
      }
    });

    // Get population data
    const { totalPopulation, populations } = await this.getPopulationData(filters);

    // Calculate overall rates
    const incidenceRate = ReportUtils.calculateIncidenceRate(totalPatients, totalPopulation);
    const mortalityRate = ReportUtils.calculateIncidenceRate(deaths, totalPopulation);
    const caseFatalityRate = ReportUtils.calculateCaseFatalityRate(deaths, totalPatients);

    // Get hospitals data for detailed breakdown
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      select: {
        id: true,
        hospitalName: true,
        hospitalCode9eDigit: true
      }
    });
    
    // Calculate rates by hospital
    const hospitalStats: HospitalStats[] = await Promise.all(
      hospitals.map(async (hospital) => {
        const hospitalCode = hospital.hospitalCode9eDigit;
        const hospitalWhere = {
          ...where,
          hospitalCode9eDigit: hospitalCode
        };

        const hospitalPatients = await prisma.patientVisit.count({ where: hospitalWhere });
        const hospitalDeaths = await prisma.patientVisit.count({
          where: {
            ...hospitalWhere,
            OR: ReportUtils.getDeathConditions()
          }
        });

        // Find population for this hospital
        const hospitalPopulation = populations
          .filter(pop => pop.hospitalCode9eDigit === hospitalCode)
          .reduce((sum, pop) => sum + pop.count, 0);

        const hospitalIncidenceRate = ReportUtils.calculateIncidenceRate(hospitalPatients, hospitalPopulation);
        const hospitalMortalityRate = ReportUtils.calculateIncidenceRate(hospitalDeaths, hospitalPopulation);
        const hospitalCaseFatalityRate = ReportUtils.calculateCaseFatalityRate(hospitalDeaths, hospitalPatients);

        return {
          hospitalCode: hospitalCode || '',
          hospitalName: hospital.hospitalName,
          population: hospitalPopulation,
          patients: hospitalPatients,
          deaths: hospitalDeaths,
          incidenceRate: hospitalIncidenceRate,
          mortalityRate: hospitalMortalityRate,
          caseFatalityRate: hospitalCaseFatalityRate,
          hasPopulationData: hospitalPopulation > 0
        };
      })
    );

    // Filter out hospitals with no patients and sort by patients count
    const activeHospitalStats = hospitalStats
      .filter(stat => stat.patients > 0)
      .sort((a, b) => b.patients - a.patients);

    return {
      disease,
      filters,
      summary: {
        totalPopulation,
        totalPatients,
        deaths,
        incidenceRate,
        mortalityRate,
        caseFatalityRate,
        hasPopulationData: totalPopulation > 0,
        populationNote: totalPopulation === 0 ? 'ไม่มีข้อมูลประชากรสำหรับการคำนวณอัตราป่วย' : undefined
      },
      hospitals: activeHospitalStats,
      populationDetails: {
        totalHospitalsWithData: populations.length,
        yearsCovered: [...new Set(populations.map(p => p.year))].sort(),
        note: 'อัตราป่วยคำนวณจากจำนวนผู้ป่วยต่อประชากร 100,000 คน'
      }
    };
  }

  // ============================================
  // OCCUPATION REPORT
  // ============================================

  /**
   * Generate occupation report
   */
  static async getOccupationReport(filters: ReportFilters) {
    const disease = await this.getDiseaseInfo(filters.diseaseId);
    if (!disease) {
      throw new Error('ไม่พบข้อมูลโรคที่ระบุ');
    }

    // Build where conditions (exclude occupation from filter for analysis)
    const where = ReportUtils.buildWhereConditions({ ...filters, occupation: 'all' });

    // Get occupation distribution
    const occupationCounts = await prisma.patientVisit.groupBy({
      by: ['occupation'],
      where,
      _count: {
        occupation: true
      },
      orderBy: {
        _count: {
          occupation: 'desc'
        }
      }
    });

    // Calculate total patients
    const totalPatients = await prisma.patientVisit.count({ where });

    // Format occupation data
    const occupations: OccupationData[] = occupationCounts.map(group => ({
      occupation: group.occupation || 'ไม่ระบุ',
      count: group._count.occupation,
      percentage: ReportUtils.calculatePercentage(group._count.occupation, totalPatients)
    }));

    return {
      disease,
      filters,
      summary: {
        totalPatients,
        uniqueOccupations: occupations.length
      },
      occupations
    };
  }
}