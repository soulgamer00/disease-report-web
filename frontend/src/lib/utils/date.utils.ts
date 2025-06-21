// frontend/src/lib/utils/date.utils.ts
// ✅ Date formatting utilities for Thai locale
// Consistent date formatting across the application

import dayjs from 'dayjs';
import 'dayjs/locale/th';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import duration from 'dayjs/plugin/duration';

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(buddhistEra);
dayjs.extend(duration);
dayjs.locale('th');

// Default timezone for Thailand
const DEFAULT_TIMEZONE = 'Asia/Bangkok';

// ============================================
// DATE FORMATTING FUNCTIONS
// ============================================

/**
 * Format date to Thai format (DD/MM/YYYY)
 */
export function formatDate(date: string | Date | null, useBuddhistEra: boolean = false): string {
  if (!date) return '-';
  
  const d = dayjs(date).tz(DEFAULT_TIMEZONE);
  if (!d.isValid()) return '-';
  
  if (useBuddhistEra) {
    return d.format('DD/MM/BBBB');
  }
  return d.format('DD/MM/YYYY');
}

/**
 * Format datetime to Thai format (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: string | Date | null, useBuddhistEra: boolean = false): string {
  if (!date) return '-';
  
  const d = dayjs(date).tz(DEFAULT_TIMEZONE);
  if (!d.isValid()) return '-';
  
  if (useBuddhistEra) {
    return d.format('DD/MM/BBBB HH:mm');
  }
  return d.format('DD/MM/YYYY HH:mm');
}

/**
 * Format time only (HH:mm)
 */
export function formatTime(date: string | Date | null): string {
  if (!date) return '-';
  
  const d = dayjs(date).tz(DEFAULT_TIMEZONE);
  if (!d.isValid()) return '-';
  
  return d.format('HH:mm');
}

/**
 * Format relative time (เมื่อไหร่)
 */
export function formatRelativeTime(date: string | Date | null): string {
  if (!date) return '-';
  
  const d = dayjs(date).tz(DEFAULT_TIMEZONE);
  if (!d.isValid()) return '-';
  
  return d.fromNow();
}

/**
 * Format date range
 */
export function formatDateRange(startDate: string | Date | null, endDate: string | Date | null): string {
  if (!startDate && !endDate) return '-';
  if (!startDate) return `ถึง ${formatDate(endDate)}`;
  if (!endDate) return `จาก ${formatDate(startDate)}`;
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// ============================================
// DATE VALIDATION FUNCTIONS
// ============================================

/**
 * Check if date is valid
 */
export function isValidDate(date: string | Date | null): boolean {
  if (!date) return false;
  return dayjs(date).isValid();
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: string | Date | null): boolean {
  if (!date) return false;
  return dayjs(date).isAfter(dayjs());
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: string | Date | null): boolean {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
}

// ============================================
// DATE CONVERSION FUNCTIONS
// ============================================

/**
 * Convert to Bangkok timezone
 */
export function toBangkokTime(date: string | Date | null): dayjs.Dayjs | null {
  if (!date) return null;
  return dayjs(date).tz(DEFAULT_TIMEZONE);
}

/**
 * Convert to ISO string in Bangkok timezone
 */
export function toISOString(date: string | Date | null): string | null {
  if (!date) return null;
  const d = dayjs(date).tz(DEFAULT_TIMEZONE);
  return d.isValid() ? d.toISOString() : null;
}

/**
 * Get current date in Bangkok timezone
 */
export function getCurrentDate(): dayjs.Dayjs {
  return dayjs().tz(DEFAULT_TIMEZONE);
}

/**
 * Get current date as formatted string
 */
export function getCurrentDateString(format: string = 'YYYY-MM-DD'): string {
  return getCurrentDate().format(format);
}

// ============================================
// DATE PICKER HELPERS
// ============================================

/**
 * Format date for HTML input[type="date"]
 */
export function formatForDateInput(date: string | Date | null): string {
  if (!date) return '';
  const d = dayjs(date).tz(DEFAULT_TIMEZONE);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
}

/**
 * Format datetime for HTML input[type="datetime-local"]
 */
export function formatForDateTimeInput(date: string | Date | null): string {
  if (!date) return '';
  const d = dayjs(date).tz(DEFAULT_TIMEZONE);
  return d.isValid() ? d.format('YYYY-MM-DDTHH:mm') : '';
}

/**
 * Parse date from HTML input
 */
export function parseFromDateInput(dateString: string): dayjs.Dayjs | null {
  if (!dateString) return null;
  const d = dayjs(dateString).tz(DEFAULT_TIMEZONE);
  return d.isValid() ? d : null;
}

// ============================================
// SPECIALIZED FORMATTING
// ============================================

/**
 * Format age from birth date
 */
export function calculateAge(birthDate: string | Date | null): number {
  if (!birthDate) return 0;
  const birth = dayjs(birthDate);
  const now = getCurrentDate();
  return now.diff(birth, 'year');
}

/**
 * Format duration between two dates
 */
export function formatDuration(startDate: string | Date | null, endDate: string | Date | null): string {
  if (!startDate || !endDate) return '-';
  
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (!start.isValid() || !end.isValid()) return '-';
  
  const diffMs = end.diff(start);
  const durationObj = dayjs.duration(diffMs);
  
  const days = Math.floor(durationObj.asDays());
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();
  
  if (days > 0) {
    return `${days} วัน ${hours} ชั่วโมง`;
  } else if (hours > 0) {
    return `${hours} ชั่วโมง ${minutes} นาที`;
  } else {
    return `${minutes} นาที`;
  }
}

/**
 * Format month/year for reports
 */
export function formatMonthYear(date: string | Date | null, useBuddhistEra: boolean = false): string {
  if (!date) return '-';
  
  const d = dayjs(date).tz(DEFAULT_TIMEZONE);
  if (!d.isValid()) return '-';
  
  if (useBuddhistEra) {
    return d.format('MMMM BBBB');
  }
  return d.format('MMMM YYYY');
}

/**
 * Get Thai month names
 */
export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
] as const;

/**
 * Get Thai day names
 */
export const THAI_DAYS = [
  'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
] as const;