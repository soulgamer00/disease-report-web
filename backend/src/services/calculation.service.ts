// backend/src/services/calculation.service.ts

// ============================================
// CALCULATION SERVICE CLASS
// ============================================

export class CalculationService {

  // ============================================
  // AGE CALCULATION UTILITIES
  // ============================================

  /**
   * Calculate age at illness from birthday and illness date
   * @param birthday - Patient's birth date
   * @param illnessDate - Date when patient got sick
   * @returns Age in years
   */
  static calculateAgeAtIllness(birthday: Date, illnessDate: Date): number {
    const birthYear = birthday.getFullYear();
    const birthMonth = birthday.getMonth();
    const birthDay = birthday.getDate();

    const illnessYear = illnessDate.getFullYear();
    const illnessMonth = illnessDate.getMonth();
    const illnessDay = illnessDate.getDate();

    let age = illnessYear - birthYear;

    // If illness date hasn't reached birthday this year, subtract 1
    if (illnessMonth < birthMonth || (illnessMonth === birthMonth && illnessDay < birthDay)) {
      age--;
    }

    return Math.max(0, age); // Ensure non-negative age
  }

  // ============================================
  // MATHEMATICAL UTILITIES
  // ============================================

  /**
   * Calculate Greatest Common Divisor (GCD) using Euclidean algorithm
   * Used for simplifying ratios
   * @param a - First number
   * @param b - Second number
   * @returns GCD of a and b
   */
  static calculateGCD(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    
    return a;
  }

  /**
   * Simplify a ratio using GCD
   * @param numerator - Ratio numerator
   * @param denominator - Ratio denominator
   * @returns Simplified ratio as { numerator, denominator, ratio }
   */
  static simplifyRatio(numerator: number, denominator: number): {
    numerator: number;
    denominator: number;
    ratio: string;
    decimal: number;
  } {
    if (numerator === 0 || denominator === 0) {
      return {
        numerator: 0,
        denominator: 0,
        ratio: '0:0',
        decimal: 0,
      };
    }

    const gcd = this.calculateGCD(numerator, denominator);
    const simplifiedNumerator = numerator / gcd;
    const simplifiedDenominator = denominator / gcd;

    return {
      numerator: simplifiedNumerator,
      denominator: simplifiedDenominator,
      ratio: `${simplifiedNumerator}:${simplifiedDenominator}`,
      decimal: Math.round((numerator / denominator) * 100) / 100,
    };
  }

  // ============================================
  // INCIDENCE RATE CALCULATIONS
  // ============================================

  /**
   * Calculate incidence rate per 100,000 population
   * @param cases - Number of cases
   * @param population - Total population
   * @returns Incidence rate per 100,000
   */
  static calculateIncidenceRate(cases: number, population: number): number {
    if (population === 0) return 0;
    return Math.round((cases / population) * 100000 * 100) / 100; // Round to 2 decimal places
  }

  // ============================================
  // PERCENTAGE CALCULATIONS
  // ============================================

  /**
   * Calculate percentage with proper rounding
   * @param part - Part value
   * @param total - Total value
   * @returns Percentage rounded to 2 decimal places
   */
  static calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((part / total) * 10000) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate percentages for multiple parts
   * @param parts - Array of part values
   * @returns Array of percentages that sum to 100
   */
  static calculatePercentages(parts: number[]): number[] {
    const total = parts.reduce((sum, part) => sum + part, 0);
    
    if (total === 0) {
      return parts.map(() => 0);
    }

    // Calculate percentages with rounding
    const percentages = parts.map(part => this.calculatePercentage(part, total));
    
    return percentages;
  }
}