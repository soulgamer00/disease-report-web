// backend/src/utils/export.utils.ts

import { Response } from 'express';
import { PatientVisitInfo } from '../schemas/patientVisit.schema';
import { 
  namePrefixMapping, 
  genderMapping, 
  maritalStatusMapping, 
  occupationMapping, 
  treatmentAreaMapping, 
  patientTypeMapping, 
  patientConditionMapping 
} from '../types/enums';
import { config } from '../config';

// ============================================
// EXCEL EXPORT UTILITIES
// ============================================

export class ExportUtils {

  // ============================================
  // PATIENT VISIT EXCEL EXPORT
  // ============================================

  /**
   * Export patient visits to Excel format
   * @param patientVisits - Array of patient visit data
   * @param response - Express response object
   * @param filename - Optional filename (default: auto-generated)
   * @param hospitalName - Optional hospital name for title
   */
  static async exportPatientVisitsToExcel(
    patientVisits: PatientVisitInfo[],
    response: Response,
    filename?: string,
    hospitalName?: string
  ): Promise<void> {
    try {
      // Generate filename if not provided
      const defaultFilename = `patient-visits-${new Date().toISOString().split('T')[0]}.xlsx`;
      const exportFilename = filename || defaultFilename;

      // Prepare Excel data
      const excelData = this.preparePatientVisitExcelData(patientVisits);

      // For now, return CSV format (Excel implementation would require additional library)
      // In production, you would use libraries like 'exceljs' or 'xlsx'
      const csvData = this.convertToCSV(excelData);

      // Set response headers for file download
      response.setHeader('Content-Type', 'text/csv; charset=utf-8');
      response.setHeader('Content-Disposition', `attachment; filename="${exportFilename.replace('.xlsx', '.csv')}"`);
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Pragma', 'no-cache');

      // Add BOM for UTF-8 encoding (for proper Thai character display in Excel)
      const bom = '\uFEFF';
      response.write(bom + csvData);
      response.end();

    } catch (error) {
      console.error('Export patient visits to Excel error:', error);
      throw new Error('เกิดข้อผิดพลาดในการส่งออกข้อมูลเป็น Excel');
    }
  }

  // ============================================
  // DATA PREPARATION
  // ============================================

  /**
   * Prepare patient visit data for Excel export
   * @param patientVisits - Array of patient visit data
   * @returns Formatted data for Excel
   */
  private static preparePatientVisitExcelData(patientVisits: PatientVisitInfo[]): Array<Record<string, string | number | null>> {
    const headers = [
      'ลำดับ',
      'เลขบัตรประจำตัวประชาชน',
      'คำนำหน้าชื่อ',
      'ชื่อ',
      'นามสกุล',
      'เพศ',
      'วันเกิด',
      'อายุ ณ วันที่ป่วย',
      'สัญชาติ',
      'สถานภาพสมรส',
      'อาชีพ',
      'เบอร์โทรศัพท์',
      'ที่อยู่ปัจจุบัน - เลขที่',
      'ที่อยู่ปัจจุบัน - หมู่ที่',
      'ที่อยู่ปัจจุบัน - ถนน',
      'ที่อยู่ปัจจุบัน - จังหวัด',
      'ที่อยู่ปัจจุบัน - อำเภอ',
      'ที่อยู่ปัจจุบัน - ตำบล',
      'ที่อยู่เมื่อป่วย - เลขที่',
      'ที่อยู่เมื่อป่วย - หมู่ที่',
      'ที่อยู่เมื่อป่วย - ถนน',
      'ที่อยู่เมื่อป่วย - จังหวัด',
      'ที่อยู่เมื่อป่วย - อำเภอ',
      'ที่อยู่เมื่อป่วย - ตำบล',
      'โรค (ภาษาไทย)',
      'โรค (ภาษาอังกฤษ)',
      'รหัสโรค',
      'อาการของโรค',
      'พื้นที่การรักษา',
      'โรงพยาบาลที่รักษา',
      'วันที่เริ่มป่วย',
      'วันที่เริ่มรักษา',
      'วันที่วินิจฉัย',
      'การวินิจฉัยหลัก',
      'การวินิจฉัยรอง',
      'ประเภทผู้ป่วย',
      'สภาพผู้ป่วย',
      'วันที่เสียชีวิต',
      'สาเหตุการเสียชีวิต',
      'จังหวัดที่รับการรายงาน',
      'รหัสโรงพยาบาล',
      'ชื่อโรงพยาบาล',
      'ประเภทองค์กร',
      'ประเภทหน่วยบริการสุขภาพ',
      'ชื่อผู้รายงาน',
      'หมายเหตุ',
      'วันที่บันทึกข้อมูล',
      'วันที่แก้ไขล่าสุด'
    ];

    const excelData: Array<Record<string, string | number | null>> = [];

    // Add header row
    const headerRow: Record<string, string | number | null> = {};
    headers.forEach((header, index) => {
      headerRow[`col${index}`] = header;
    });
    excelData.push(headerRow);

    // Add data rows
    patientVisits.forEach((visit, index) => {
      const row: Record<string, string | number | null> = {
        col0: index + 1, // ลำดับ
        col1: visit.idCardCode,
        col2: namePrefixMapping[visit.namePrefix] || visit.namePrefix,
        col3: visit.fname,
        col4: visit.lname,
        col5: genderMapping[visit.gender] || visit.gender,
        col6: this.formatDate(visit.birthday),
        col7: visit.ageAtIllness,
        col8: visit.nationality,
        col9: maritalStatusMapping[visit.maritalStatus] || visit.maritalStatus,
        col10: occupationMapping[visit.occupation] || visit.occupation,
        col11: visit.phoneNumber,
        col12: visit.currentHouseNumber,
        col13: visit.currentVillageNumber,
        col14: visit.currentRoadName,
        col15: visit.currentProvince,
        col16: visit.currentDistrict,
        col17: visit.currentSubDistrict,
        col18: visit.addressSickHouseNumber,
        col19: visit.addressSickVillageNumber,
        col20: visit.addressSickRoadName,
        col21: visit.addressSickProvince,
        col22: visit.addressSickDistrict,
        col23: visit.addressSickSubDistrict,
        col24: visit.disease?.thaiName || 'ไม่ทราบ',
        col25: visit.disease?.engName || 'Unknown',
        col26: visit.disease?.shortName || 'N/A',
        col27: visit.symptomsOfDisease,
        col28: treatmentAreaMapping[visit.treatmentArea] || visit.treatmentArea,
        col29: visit.treatmentHospital,
        col30: this.formatDate(visit.illnessDate),
        col31: this.formatDate(visit.treatmentDate),
        col32: this.formatDate(visit.diagnosisDate),
        col33: visit.diagnosis1,
        col34: visit.diagnosis2,
        col35: patientTypeMapping[visit.patientType] || visit.patientType,
        col36: patientConditionMapping[visit.patientCondition] || visit.patientCondition,
        col37: visit.deathDate ? this.formatDate(visit.deathDate) : null,
        col38: visit.causeOfDeath,
        col39: visit.receivingProvince,
        col40: visit.hospitalCode9eDigit,
        col41: visit.hospital?.hospitalName || 'ไม่ทราบ',
        col42: visit.hospital?.organizationType || 'ไม่ทราบ',
        col43: visit.hospital?.healthServiceType || 'ไม่ทราบ',
        col44: visit.reportName,
        col45: visit.remarks,
        col46: this.formatDateTime(visit.createdAt),
        col47: this.formatDateTime(visit.updatedAt),
      };
      excelData.push(row);
    });

    return excelData;
  }

  // ============================================
  // CSV CONVERSION
  // ============================================

  /**
   * Convert data to CSV format
   * @param data - Array of data objects
   * @returns CSV string
   */
  private static convertToCSV(data: Array<Record<string, string | number | null>>): string {
    if (data.length === 0) return '';

    // Get all column keys from first row
    const firstRow = data[0];
    const columnKeys = Object.keys(firstRow).sort();

    // Create CSV rows
    const csvRows: string[] = [];

    data.forEach(row => {
      const csvRow = columnKeys.map(key => {
        const value = row[key];
        
        // Handle null/undefined values
        if (value === null || value === undefined) {
          return '';
        }

        // Convert to string and escape CSV special characters
        const stringValue = String(value);
        
        // If value contains comma, newline, or quote, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      });
      
      csvRows.push(csvRow.join(','));
    });

    return csvRows.join('\n');
  }

  // ============================================
  // STATISTICS EXPORT
  // ============================================

  /**
   * Export patient visit statistics to CSV
   * @param statistics - Statistics data
   * @param response - Express response object
   * @param filename - Optional filename
   */
  static async exportStatisticsToCSV(
    statistics: {
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
    },
    response: Response,
    filename?: string
  ): Promise<void> {
    try {
      const defaultFilename = `patient-statistics-${new Date().toISOString().split('T')[0]}.csv`;
      const exportFilename = filename || defaultFilename;

      // Prepare statistics data
      const statisticsData = this.prepareStatisticsData(statistics);
      const csvData = this.convertToCSV(statisticsData);

      // Set response headers
      response.setHeader('Content-Type', 'text/csv; charset=utf-8');
      response.setHeader('Content-Disposition', `attachment; filename="${exportFilename}"`);
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Pragma', 'no-cache');

      // Add BOM and send data
      const bom = '\uFEFF';
      response.write(bom + csvData);
      response.end();

    } catch (error) {
      console.error('Export statistics to CSV error:', error);
      throw new Error('เกิดข้อผิดพลาดในการส่งออกข้อมูลสถิติ');
    }
  }

  /**
   * Prepare statistics data for export
   * @param statistics - Statistics object
   * @returns Formatted data for CSV
   */
  private static prepareStatisticsData(statistics: any): Array<Record<string, string | number | null>> {
    const data: Array<Record<string, string | number | null>> = [];

    // Summary section
    data.push({
      col0: 'สรุปภาพรวม',
      col1: '',
      col2: '',
      col3: '',
    });
    data.push({
      col0: 'จำนวนผู้ป่วยทั้งหมด',
      col1: statistics.totalPatients,
      col2: '',
      col3: '',
    });
    data.push({
      col0: '',
      col1: '',
      col2: '',
      col3: '',
    });

    // Gender distribution
    data.push({
      col0: 'การแจกแจงตามเพศ',
      col1: 'จำนวน',
      col2: 'เปอร์เซ็นต์',
      col3: '',
    });
    data.push({
      col0: 'ชาย',
      col1: statistics.byGender.male,
      col2: `${statistics.byGender.malePercentage}%`,
      col3: '',
    });
    data.push({
      col0: 'หญิง',
      col1: statistics.byGender.female,
      col2: `${statistics.byGender.femalePercentage}%`,
      col3: '',
    });
    data.push({
      col0: '',
      col1: '',
      col2: '',
      col3: '',
    });

    // Patient type distribution
    data.push({
      col0: 'การแจกแจงตามประเภทผู้ป่วย',
      col1: 'จำนวน',
      col2: 'เปอร์เซ็นต์',
      col3: '',
    });
    statistics.byPatientType.forEach((item: any) => {
      data.push({
        col0: patientTypeMapping[item.patientType as keyof typeof patientTypeMapping] || item.patientType,
        col1: item.count,
        col2: `${item.percentage}%`,
        col3: '',
      });
    });
    data.push({
      col0: '',
      col1: '',
      col2: '',
      col3: '',
    });

    // Top diseases
    data.push({
      col0: 'โรคที่พบบ่อย (10 อันดับแรก)',
      col1: 'จำนวน',
      col2: 'เปอร์เซ็นต์',
      col3: '',
    });
    statistics.byDisease.forEach((item: any) => {
      data.push({
        col0: item.diseaseName,
        col1: item.count,
        col2: `${item.percentage}%`,
        col3: '',
      });
    });

    return data;
  }

  // ============================================
  // FORMATTING UTILITIES
  // ============================================

  /**
   * Format date to Thai format (DD/MM/YYYY)
   * @param date - Date object
   * @returns Formatted date string
   */
  private static formatDate(date: Date): string {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: config.constants.timezone,
    };
    
    return new Intl.DateTimeFormat('th-TH', options).format(new Date(date));
  }

  /**
   * Format datetime to Thai format (DD/MM/YYYY HH:mm)
   * @param date - Date object
   * @returns Formatted datetime string
   */
  private static formatDateTime(date: Date): string {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: config.constants.timezone,
    };
    
    return new Intl.DateTimeFormat('th-TH', options).format(new Date(date));
  }

  // ============================================
  // VALIDATION UTILITIES
  // ============================================

  /**
   * Validate export parameters
   * @param dataCount - Number of records to export
   * @param userRole - User role ID
   * @returns Validation result
   */
  static validateExportRequest(dataCount: number, userRole: number): {
    isValid: boolean;
    error?: string;
  } {
    // Check maximum export limit
    if (dataCount > config.constants.excel.maxRows) {
      return {
        isValid: false,
        error: `จำนวนข้อมูลเกินกว่าที่อนุญาต (สูงสุด ${config.constants.excel.maxRows.toLocaleString()} รายการ)`,
      };
    }

    // Check user permissions
    if (userRole > 3) {
      return {
        isValid: false,
        error: 'ไม่มีสิทธิ์ในการส่งออกข้อมูล',
      };
    }

    return { isValid: true };
  }

  /**
   * Get export filename with timestamp
   * @param prefix - Filename prefix
   * @param extension - File extension (default: csv)
   * @returns Generated filename
   */
  static generateExportFilename(prefix: string, extension: string = 'csv'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}-${timestamp}.${extension}`;
  }
}