// backend/src/utils/export.utils.ts

import { Response } from 'express';
import * as ExcelJS from 'exceljs';
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

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('รายงานข้อมูลผู้ป่วย');

      // Set worksheet properties
      worksheet.properties.defaultRowHeight = 20;
      worksheet.views = [{ showGridLines: true }];

      // Define columns with Thai headers
      const columns = [
        { header: 'ลำดับ', key: 'no', width: 8 },
        { header: 'เลขบัตรประจำตัว', key: 'idCardCode', width: 15 },
        { header: 'คำนำหน้า', key: 'namePrefix', width: 10 },
        { header: 'ชื่อ', key: 'fname', width: 15 },
        { header: 'นามสกุล', key: 'lname', width: 15 },
        { header: 'เพศ', key: 'gender', width: 8 },
        { header: 'วันเกิด', key: 'birthday', width: 12 },
        { header: 'อายุเมื่อป่วย', key: 'ageAtIllness', width: 12 },
        { header: 'สัญชาติ', key: 'nationality', width: 10 },
        { header: 'สถานภาพ', key: 'maritalStatus', width: 12 },
        { header: 'อาชีพ', key: 'occupation', width: 15 },
        { header: 'เบอร์โทร', key: 'phoneNumber', width: 12 },
        { header: 'จังหวัดที่อยู่', key: 'currentProvince', width: 15 },
        { header: 'อำเภอที่อยู่', key: 'currentDistrict', width: 15 },
        { header: 'ตำบลที่อยู่', key: 'currentSubDistrict', width: 15 },
        { header: 'จังหวัดที่ป่วย', key: 'addressSickProvince', width: 15 },
        { header: 'อำเภอที่ป่วย', key: 'addressSickDistrict', width: 15 },
        { header: 'ตำบลที่ป่วย', key: 'addressSickSubDistrict', width: 15 },
        { header: 'โรค', key: 'diseaseThaiName', width: 20 },
        { header: 'อาการของโรค', key: 'symptomsOfDisease', width: 25 },
        { header: 'พื้นที่รักษา', key: 'treatmentArea', width: 12 },
        { header: 'โรงพยาบาลที่รักษา', key: 'treatmentHospital', width: 20 },
        { header: 'วันที่ป่วย', key: 'illnessDate', width: 12 },
        { header: 'วันที่รักษา', key: 'treatmentDate', width: 12 },
        { header: 'วันที่วินิจฉัย', key: 'diagnosisDate', width: 12 },
        { header: 'การวินิจฉัย 1', key: 'diagnosis1', width: 20 },
        { header: 'การวินิจฉัย 2', key: 'diagnosis2', width: 20 },
        { header: 'ประเภทผู้ป่วย', key: 'patientType', width: 12 },
        { header: 'สภาพผู้ป่วย', key: 'patientCondition', width: 12 },
        { header: 'วันที่เสียชีวิต', key: 'deathDate', width: 12 },
        { header: 'สาเหตุการเสียชีวิต', key: 'causeOfDeath', width: 20 },
        { header: 'จังหวัดรับผิดชอบ', key: 'receivingProvince', width: 15 },
        { header: 'รหัสโรงพยาบาล', key: 'hospitalCode9eDigit', width: 12 },
        { header: 'ชื่อผู้รายงาน', key: 'reportName', width: 15 },
        { header: 'หมายเหตุ', key: 'remarks', width: 25 },
      ];

      worksheet.columns = columns;

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' } // Light blue background
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Add data rows
      patientVisits.forEach((visit, index) => {
        const rowData = {
          no: index + 1,
          idCardCode: visit.idCardCode,
          namePrefix: namePrefixMapping[visit.namePrefix] || visit.namePrefix,
          fname: visit.fname,
          lname: visit.lname,
          gender: genderMapping[visit.gender] || visit.gender,
          birthday: this.formatDate(visit.birthday),
          ageAtIllness: visit.ageAtIllness,
          nationality: visit.nationality,
          maritalStatus: maritalStatusMapping[visit.maritalStatus] || visit.maritalStatus,
          occupation: occupationMapping[visit.occupation] || visit.occupation,
          phoneNumber: visit.phoneNumber || '-',
          currentProvince: visit.currentProvince || '-',
          currentDistrict: visit.currentDistrict || '-',
          currentSubDistrict: visit.currentSubDistrict || '-',
          addressSickProvince: visit.addressSickProvince,
          addressSickDistrict: visit.addressSickDistrict || '-',
          addressSickSubDistrict: visit.addressSickSubDistrict || '-',
          diseaseThaiName: visit.disease?.thaiName || '-',
          symptomsOfDisease: visit.symptomsOfDisease || '-',
          treatmentArea: treatmentAreaMapping[visit.treatmentArea] || visit.treatmentArea,
          treatmentHospital: visit.treatmentHospital || visit.hospital?.hospitalName || '-',
          illnessDate: this.formatDate(visit.illnessDate),
          treatmentDate: this.formatDate(visit.treatmentDate),
          diagnosisDate: this.formatDate(visit.diagnosisDate),
          diagnosis1: visit.diagnosis1 || '-',
          diagnosis2: visit.diagnosis2 || '-',
          patientType: patientTypeMapping[visit.patientType] || visit.patientType,
          patientCondition: patientConditionMapping[visit.patientCondition] || visit.patientCondition,
          deathDate: visit.deathDate ? this.formatDate(visit.deathDate) : '-',
          causeOfDeath: visit.causeOfDeath || '-',
          receivingProvince: visit.receivingProvince,
          hospitalCode9eDigit: visit.hospitalCode9eDigit,
          reportName: visit.reportName || '-',
          remarks: visit.remarks || '-',
        };

        const row = worksheet.addRow(rowData);
        
        // Style data rows
        row.alignment = { vertical: 'middle', wrapText: true };
        row.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Alternate row colors for better readability
        if (index % 2 === 1) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F8F8' } // Very light gray
          };
        }
      });

      // Add title row at the top (insert before headers)
      worksheet.insertRow(1, []);
      const titleRow = worksheet.getRow(1);
      const titleText = hospitalName 
        ? `รายงานข้อมูลผู้ป่วย - ${hospitalName}` 
        : 'รายงานข้อมูลผู้ป่วย';
      
      titleRow.getCell(1).value = titleText;
      titleRow.getCell(1).font = { bold: true, size: 16 };
      titleRow.getCell(1).alignment = { horizontal: 'center' };
      
      // Merge title across all columns
      worksheet.mergeCells(1, 1, 1, columns.length);

      // Add summary row
      worksheet.insertRow(2, []);
      const summaryRow = worksheet.getRow(2);
      summaryRow.getCell(1).value = `รวมทั้งหมด: ${patientVisits.length} รายการ | วันที่ส่งออก: ${new Date().toLocaleDateString('th-TH')}`;
      summaryRow.getCell(1).font = { size: 12 };
      summaryRow.getCell(1).alignment = { horizontal: 'center' };
      worksheet.mergeCells(2, 1, 2, columns.length);

      // Add empty row before headers
      worksheet.insertRow(3, []);

      // Auto-fit columns (approximate)
      worksheet.columns.forEach(column => {
        if (column.width && column.width < 10) {
          column.width = 10;
        }
      });

      // Set response headers for Excel download
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      response.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(exportFilename)}"`);
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Pragma', 'no-cache');

      // Write Excel file to response
      await workbook.xlsx.write(response);
      response.end();

    } catch (error) {
      console.error('Export patient visits to Excel error:', error);
      throw new Error('เกิดข้อผิดพลาดในการส่งออกข้อมูลเป็น Excel');
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Format Date to Thai format (DD/MM/YYYY)
   * @param date - Date object or string
   * @returns Formatted date string
   */
  private static formatDate(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '-';
      
      return dateObj.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: config.constants.timezone
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '-';
    }
  }

  /**
   * Export statistics data to Excel
   * @param statisticsData - Statistics data object
   * @param response - Express response object
   * @param filename - Optional filename
   */
  static async exportStatisticsToExcel(
    statisticsData: any,
    response: Response,
    filename?: string
  ): Promise<void> {
    try {
      const defaultFilename = `patient-statistics-${new Date().toISOString().split('T')[0]}.xlsx`;
      const exportFilename = filename || defaultFilename;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('สถิติข้อมูลผู้ป่วย');

      // Add title
      worksheet.mergeCells('A1:D1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'รายงานสถิติข้อมูลผู้ป่วย';
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: 'center' };

      // Add statistics sections
      let currentRow = 3;

      // Gender distribution
      if (statisticsData.byGender) {
        worksheet.getCell(`A${currentRow}`).value = 'การแจกแจงตามเพศ';
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = `ชาย: ${statisticsData.byGender.male || 0} คน`;
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = `หญิง: ${statisticsData.byGender.female || 0} คน`;
        currentRow += 2;
      }

      // Disease distribution
      if (statisticsData.byDisease && Array.isArray(statisticsData.byDisease)) {
        worksheet.getCell(`A${currentRow}`).value = 'การแจกแจงตามโรค';
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        currentRow++;

        statisticsData.byDisease.forEach((disease: any) => {
          worksheet.getCell(`A${currentRow}`).value = `${disease.thaiName}: ${disease.count} ราย`;
          currentRow++;
        });
      }

      // Set response headers
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      response.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(exportFilename)}"`);
      
      await workbook.xlsx.write(response);
      response.end();

    } catch (error) {
      console.error('Export statistics to Excel error:', error);
      throw new Error('เกิดข้อผิดพลาดในการส่งออกสถิติเป็น Excel');
    }
  }
}