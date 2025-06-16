// backend/src/utils/report.utils.ts

import { Prisma, OccupationEnum } from '@prisma/client';
import { ReportFilters } from '../schemas/report.schema';

// ============================================
// REPORT UTILITY FUNCTIONS
// ============================================

export class ReportUtils {

  // ============================================
  // FILTER BUILDING
  // ============================================

  /**
   * Build Prisma where conditions from filters
   */
  static buildWhereConditions(filters: ReportFilters): Prisma.PatientVisitWhereInput {
    const where: Prisma.PatientVisitWhereInput = {
      diseaseId: filters.diseaseId,
      isActive: true
    };

    // Year filter
    if (filters.year && filters.year !== 'all') {
      const year = parseInt(filters.year);
      where.illnessDate = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      };
    }
    // Default ปีปัจจุบัน - ถ้าไม่ระบุจะใช้ปีปัจจุบันอัตโนมัติ

    // Hospital filter  
    if (filters.hospitalCode && filters.hospitalCode !== 'all') {
      where.hospitalCode9eDigit = filters.hospitalCode;
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
      where.gender = filters.gender;
    }

    // Age group filter
    if (filters.ageGroup && filters.ageGroup !== 'all') {
      const ageRange = this.parseAgeGroup(filters.ageGroup);
      if (ageRange) {
        where.ageAtIllness = {
          gte: ageRange.min,
          lte: ageRange.max
        };
      }
    }

    // Occupation filter
    if (filters.occupation && filters.occupation !== 'all') {
      // Validate that the occupation is a valid enum value
      if (Object.values(OccupationEnum).includes(filters.occupation as OccupationEnum)) {
        where.occupation = filters.occupation as OccupationEnum;
      }
    }

    return where;
  }

  /**
   * Build population where conditions from filters
   */
  static buildPopulationWhereConditions(filters: ReportFilters): Prisma.PopulationWhereInput {
    const where: Prisma.PopulationWhereInput = { 
      isActive: true 
    };
    
    if (filters.year && filters.year !== 'all') {
      where.year = parseInt(filters.year);
    }
    
    if (filters.hospitalCode && filters.hospitalCode !== 'all') {
      where.hospitalCode9eDigit = filters.hospitalCode;
    }

    return where;
  }

  // ============================================
  // AGE CALCULATIONS
  // ============================================

  /**
   * Parse age group string to min/max values
   */
  static parseAgeGroup(ageGroup: string): { min: number; max: number } | null {
    const ranges: Record<string, { min: number; max: number }> = {
      '0-10': { min: 0, max: 10 },
      '11-20': { min: 11, max: 20 },
      '21-30': { min: 21, max: 30 },
      '31-40': { min: 31, max: 40 },
      '41-50': { min: 41, max: 50 },
      '51+': { min: 51, max: 150 }
    };
    
    return ranges[ageGroup] || null;
  }

  /**
   * Calculate age from birthday and illness date
   */
  static calculateAge(birthday: Date | null, illnessDate: Date | null): number {
    if (!birthday || !illnessDate) return 0;
    
    const birth = new Date(birthday);
    const illness = new Date(illnessDate);
    
    let age = illness.getFullYear() - birth.getFullYear();
    const monthDiff = illness.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && illness.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }

  /**
   * Categorize age into groups
   */
  static getAgeGroup(age: number): string {
    if (age < 1) return '< 1 ปี';
    if (age <= 4) return '1-4 ปี';
    if (age <= 9) return '5-9 ปี';
    if (age <= 14) return '10-14 ปี';
    if (age <= 24) return '15-24 ปี';
    if (age <= 34) return '25-34 ปี';
    if (age <= 44) return '35-44 ปี';
    if (age <= 54) return '45-54 ปี';
    if (age <= 64) return '55-64 ปี';
    return '65+ ปี';
  }

  /**
   * Get age group order for consistent sorting
   */
  static getAgeGroupOrder(): string[] {
    return [
      '< 1 ปี', 
      '1-4 ปี', 
      '5-9 ปี', 
      '10-14 ปี', 
      '15-24 ปี', 
      '25-34 ปี', 
      '35-44 ปี', 
      '45-54 ปี', 
      '55-64 ปี', 
      '65+ ปี'
    ];
  }

  // ============================================
  // RATE CALCULATIONS
  // ============================================

  /**
   * Calculate incidence rate per 100,000 population
   */
  static calculateIncidenceRate(patientCount: number, populationCount: number, per: number = 100000): number {
    if (populationCount === 0) return 0;
    return Math.round((patientCount / populationCount) * per * 100) / 100; // 2 decimal places
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 100 * 100) / 100; // 2 decimal places
  }

  /**
   * Calculate case fatality rate
   */
  static calculateCaseFatalityRate(deaths: number, totalPatients: number): number {
    if (totalPatients === 0) return 0;
    return Math.round((deaths / totalPatients) * 100 * 100) / 100; // 2 decimal places
  }

  // ============================================
  // GENDER PROCESSING
  // ============================================

  /**
   * Process gender data and calculate ratios
   */
  static processGenderData(genderCounts: Array<{ gender: string | null; _count: { gender: number } }>) {
    let genderData = {
      total: 0,
      male: 0,
      female: 0,
      other: 0,
      notSpecified: 0
    };

    genderCounts.forEach(group => {
      const count = group._count.gender;
      genderData.total += count;

      switch (group.gender) {
        case 'MALE':
          genderData.male = count;
          break;
        case 'FEMALE':
          genderData.female = count;
          break;
        case 'OTHER':
          genderData.other = count;
          break;
        default:
          genderData.notSpecified = count;
          break;
      }
    });

    // Calculate ratio
    let ratio = { male: 0, female: 0 };

    if (genderData.male > 0 && genderData.female > 0) {
      const normalizedMale = genderData.male / genderData.female;
      ratio.male = +normalizedMale.toFixed(2);
      ratio.female = 1;
    } else if (genderData.male > 0) {
      ratio.male = 1;
      ratio.female = 0;
    } else if (genderData.female > 0) {
      ratio.male = 0;
      ratio.female = 1;
    }

    // Calculate percentages
    const percentages = {
      male: this.calculatePercentage(genderData.male, genderData.total),
      female: this.calculatePercentage(genderData.female, genderData.total),
      other: this.calculatePercentage(genderData.other, genderData.total),
      notSpecified: this.calculatePercentage(genderData.notSpecified, genderData.total)
    };

    return { genderData, ratio, percentages };
  }

  // ============================================
  // DEATH CONDITIONS
  // ============================================

  /**
   * Get death condition filters
   */
  static getDeathConditions(): Prisma.PatientVisitWhereInput['OR'] {
    return [
      { patientCondition: 'DIED' },
      { deathDate: { not: null } }
    ];
  }

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate disease ID exists
   */
  static async validateDiseaseExists(diseaseId: string): Promise<boolean> {
    // This would be implemented in the service layer with actual database check
    // For now, just validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(diseaseId);
  }

  // ============================================
  // DATE UTILITIES
  // ============================================

  /**
   * Get current year
   */
  static getCurrentYear(): number {
    return new Date().getFullYear();
  }

  /**
   * Get start and end of year
   */
  static getYearRange(year: number): { start: Date; end: Date } {
    return {
      start: new Date(`${year}-01-01`),
      end: new Date(`${year}-12-31`)
    };
  }

  /**
   * Get current month range
   */
  static getCurrentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }

  // ============================================
  // FORMATTING
  // ============================================

  /**
   * Format hospital for dropdown
   */
  static formatHospitalForDropdown(hospital: {
    id: string;
    hospitalName: string;
    hospitalCode9eDigit: string | null;
    hospitalCode5Digit?: string | null;
  }) {
    return {
      value: hospital.hospitalCode9eDigit || hospital.hospitalCode5Digit || hospital.id,
      label: hospital.hospitalName,
      code: hospital.hospitalCode9eDigit || hospital.hospitalCode5Digit || hospital.id
    };
  }

  /**
   * Round to specified decimal places
   */
  static roundToDecimals(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}