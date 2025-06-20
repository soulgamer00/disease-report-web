// src/lib/utils/hospital.utils.ts
// ✅ Hospital utility functions with complete type safety
// Helper functions for hospital data processing and validation

import type { 
  HospitalInfo, 
  HospitalFilters,
  HospitalTableRow,
  HospitalFormData,
  CreateHospitalRequest,
  UpdateHospitalRequest 
} from '$lib/types/hospital.types';

// ============================================
// HOSPITAL CODE VALIDATION
// ============================================

/**
 * Validate hospital code format (9 digits new format)
 * Format: XX1234567 (2 letters + 7 digits)
 */
export function validateHospitalCodeNew(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z]{2}\d{7}$/.test(code.trim());
}

/**
 * Validate hospital code format (9 digits old format)
 * Format: 123456789 (9 digits only)
 */
export function validateHospitalCodeOld(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return /^\d{9}$/.test(code.trim());
}

/**
 * Validate hospital code format (5 digits format)
 * Format: 12345 (5 digits only)
 */
export function validateHospitalCode5Digit(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return /^\d{5}$/.test(code.trim());
}

/**
 * Format hospital code for display
 */
export function formatHospitalCode(code: string): string {
  if (!code) return 'N/A';
  
  const cleanCode = code.trim();
  
  // Format new 9-digit code (XX1234567 -> XX-1234567)
  if (validateHospitalCodeNew(cleanCode)) {
    return `${cleanCode.slice(0, 2)}-${cleanCode.slice(2)}`;
  }
  
  // Format old 9-digit code (123456789 -> 123-456-789)
  if (validateHospitalCodeOld(cleanCode)) {
    return `${cleanCode.slice(0, 3)}-${cleanCode.slice(3, 6)}-${cleanCode.slice(6)}`;
  }
  
  // Format 5-digit code (12345 -> 12-345)
  if (validateHospitalCode5Digit(cleanCode)) {
    return `${cleanCode.slice(0, 2)}-${cleanCode.slice(2)}`;
  }
  
  return cleanCode;
}

/**
 * Get primary hospital code for display
 */
export function getPrimaryHospitalCode(hospital: HospitalInfo): string {
  return hospital.hospitalCode9eDigit || hospital.hospitalCode9Digit || hospital.hospitalCode5Digit || 'N/A';
}

/**
 * Get all available hospital codes
 */
export function getAllHospitalCodes(hospital: HospitalInfo): Array<{ type: string; code: string; formatted: string }> {
  const codes: Array<{ type: string; code: string; formatted: string }> = [];
  
  if (hospital.hospitalCode9eDigit) {
    codes.push({
      type: '9 หลักใหม่',
      code: hospital.hospitalCode9eDigit,
      formatted: formatHospitalCode(hospital.hospitalCode9eDigit)
    });
  }
  
  if (hospital.hospitalCode9Digit) {
    codes.push({
      type: '9 หลักเก่า',
      code: hospital.hospitalCode9Digit,
      formatted: formatHospitalCode(hospital.hospitalCode9Digit)
    });
  }
  
  if (hospital.hospitalCode5Digit) {
    codes.push({
      type: '5 หลัก',
      code: hospital.hospitalCode5Digit,
      formatted: formatHospitalCode(hospital.hospitalCode5Digit)
    });
  }
  
  return codes;
}

// ============================================
// HOSPITAL LOCATION & ADDRESS
// ============================================

/**
 * Get formatted hospital location string
 */
export function getHospitalLocation(hospital: HospitalInfo): string {
  const locationParts: string[] = [];
  
  if (hospital.address) locationParts.push(hospital.address);
  if (hospital.subdistrict) locationParts.push(`ต.${hospital.subdistrict}`);
  if (hospital.district) locationParts.push(`อ.${hospital.district}`);
  if (hospital.province) locationParts.push(`จ.${hospital.province}`);
  if (hospital.postalCode) locationParts.push(hospital.postalCode);
  
  return locationParts.length > 0 ? locationParts.join(' ') : 'ไม่ระบุที่อยู่';
}

/**
 * Get short location (district, province only)
 */
export function getShortLocation(hospital: HospitalInfo): string {
  const parts: string[] = [];
  
  if (hospital.district) parts.push(hospital.district);
  if (hospital.province) parts.push(hospital.province);
  
  return parts.length > 0 ? parts.join(', ') : 'ไม่ระบุ';
}

/**
 * Check if hospital has complete address
 */
export function hasCompleteAddress(hospital: HospitalInfo): boolean {
  return !!(
    hospital.address &&
    hospital.subdistrict &&
    hospital.district &&
    hospital.province
  );
}

// ============================================
// HOSPITAL STATUS & DISPLAY
// ============================================

/**
 * Get hospital status display information
 */
export function getHospitalStatusDisplay(isActive: boolean): { text: string; class: string; color: string } {
  if (isActive) {
    return {
      text: 'เปิดใช้งาน',
      class: 'text-green-800 bg-green-100 border-green-200',
      color: 'green'
    };
  } else {
    return {
      text: 'ปิดใช้งาน',
      class: 'text-red-800 bg-red-100 border-red-200',
      color: 'red'
    };
  }
}

/**
 * Get hospital type badge info
 */
export function getHospitalTypeBadge(hospital: HospitalInfo): { text: string; class: string } {
  const orgType = hospital.organizationType?.toLowerCase() || '';
  
  if (orgType.includes('government') || orgType.includes('รัฐ')) {
    return {
      text: 'รัฐบาล',
      class: 'text-blue-800 bg-blue-100'
    };
  } else if (orgType.includes('private') || orgType.includes('เอกชน')) {
    return {
      text: 'เอกชน',
      class: 'text-purple-800 bg-purple-100'
    };
  } else if (orgType.includes('university') || orgType.includes('มหาวิทยาลัย')) {
    return {
      text: 'มหาวิทยาลัย',
      class: 'text-indigo-800 bg-indigo-100'
    };
  } else {
    return {
      text: hospital.organizationType || 'ไม่ระบุ',
      class: 'text-gray-800 bg-gray-100'
    };
  }
}

// ============================================
// HOSPITAL CONTACT INFORMATION
// ============================================

/**
 * Get formatted contact information
 */
export function getContactInfo(hospital: HospitalInfo): Array<{
  type: 'phone' | 'fax' | 'email' | 'website';
  label: string;
  value: string;
  formatted: string;
  href: string;
  icon: string;
}> {
  const contacts: Array<{
    type: 'phone' | 'fax' | 'email' | 'website';
    label: string;
    value: string;
    formatted: string;
    href: string;
    icon: string;
  }> = [];
  
  if (hospital.phoneNumber) {
    contacts.push({
      type: 'phone',
      label: 'โทรศัพท์',
      value: hospital.phoneNumber,
      formatted: formatPhoneNumber(hospital.phoneNumber),
      href: `tel:${hospital.phoneNumber}`,
      icon: 'phone'
    });
  }
  
  if (hospital.faxNumber) {
    contacts.push({
      type: 'fax',
      label: 'แฟกซ์',
      value: hospital.faxNumber,
      formatted: formatPhoneNumber(hospital.faxNumber),
      href: `tel:${hospital.faxNumber}`,
      icon: 'fax'
    });
  }
  
  if (hospital.email) {
    contacts.push({
      type: 'email',
      label: 'อีเมล',
      value: hospital.email,
      formatted: hospital.email,
      href: `mailto:${hospital.email}`,
      icon: 'mail'
    });
  }
  
  if (hospital.website) {
    contacts.push({
      type: 'website',
      label: 'เว็บไซต์',
      value: hospital.website,
      formatted: formatWebsiteUrl(hospital.website),
      href: hospital.website,
      icon: 'globe'
    });
  }
  
  return contacts;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // Thai mobile format (10 digits): 081-234-5678
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Bangkok landline (9 digits): 02-123-4567
  if (cleaned.length === 9 && cleaned.startsWith('02')) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  
  // Provincial landline (9 digits): 055-123-456
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone; // Return original if no pattern matches
}

/**
 * Format website URL for display
 */
export function formatWebsiteUrl(url: string): string {
  if (!url) return '';
  
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate website URL format
 */
export function validateWebsiteUrl(url: string): boolean {
  if (!url) return true; // Optional field
  return /^https?:\/\/.+\..+/.test(url);
}

// ============================================
// HOSPITAL DATA TRANSFORMATION
// ============================================

/**
 * Transform HospitalInfo to HospitalTableRow for display
 */
export function transformToTableRow(hospital: HospitalInfo): HospitalTableRow {
  return {
    ...hospital,
    displayCode: getPrimaryHospitalCode(hospital),
    displayStatus: getHospitalStatusDisplay(hospital.isActive).text,
    displayLocation: getShortLocation(hospital)
  };
}

/**
 * Transform HospitalInfo to form data for editing
 */
export function transformToFormData(hospital: HospitalInfo): HospitalFormData {
  return {
    hospitalName: hospital.hospitalName,
    hospitalCode9eDigit: hospital.hospitalCode9eDigit,
    hospitalCode9Digit: hospital.hospitalCode9Digit || '',
    hospitalCode5Digit: hospital.hospitalCode5Digit || '',
    organizationType: hospital.organizationType || '',
    healthServiceType: hospital.healthServiceType || '',
    affiliation: hospital.affiliation || '',
    departmentDivision: hospital.departmentDivision || '',
    subDepartment: hospital.subDepartment || '',
    province: hospital.province || '',
    district: hospital.district || '',
    subdistrict: hospital.subdistrict || '',
    address: hospital.address || '',
    postalCode: hospital.postalCode || '',
    phoneNumber: hospital.phoneNumber || '',
    faxNumber: hospital.faxNumber || '',
    email: hospital.email || '',
    website: hospital.website || '',
    directorName: hospital.directorName || '',
    isActive: hospital.isActive
  };
}

/**
 * Clean form data for API submission
 */
export function cleanFormData(formData: HospitalFormData): CreateHospitalRequest | UpdateHospitalRequest {
  const cleaned: Record<string, string | boolean> = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        cleaned[key] = trimmed;
      }
    } else if (typeof value === 'boolean') {
      cleaned[key] = value;
    }
  });
  
  return cleaned as CreateHospitalRequest | UpdateHospitalRequest;
}

// ============================================
// HOSPITAL FILTERING & SEARCHING
// ============================================

/**
 * Check if hospital matches search filters
 */
export function matchesFilters(hospital: HospitalInfo, filters: HospitalFilters): boolean {
  // Search text matching
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    const searchableText = [
      hospital.hospitalName,
      hospital.hospitalCode9eDigit,
      hospital.hospitalCode9Digit,
      hospital.hospitalCode5Digit,
      hospital.province,
      hospital.district,
      hospital.organizationType,
      hospital.affiliation
    ].filter(Boolean).join(' ').toLowerCase();
    
    if (!searchableText.includes(searchTerm)) {
      return false;
    }
  }
  
  // Organization type filter
  if (filters.organizationType && hospital.organizationType !== filters.organizationType) {
    return false;
  }
  
  // Health service type filter
  if (filters.healthServiceType && hospital.healthServiceType !== filters.healthServiceType) {
    return false;
  }
  
  // Affiliation filter
  if (filters.affiliation && hospital.affiliation !== filters.affiliation) {
    return false;
  }
  
  // Province filter
  if (filters.province && hospital.province !== filters.province) {
    return false;
  }
  
  // Active status filter
  if (filters.isActive !== null && hospital.isActive !== filters.isActive) {
    return false;
  }
  
  return true;
}

/**
 * Get search suggestions based on input
 */
export function getSearchSuggestions(hospitals: HospitalInfo[], query: string, limit = 5): string[] {
  if (!query || query.length < 2) return [];
  
  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();
  
  hospitals.forEach(hospital => {
    // Add hospital name if it matches
    if (hospital.hospitalName.toLowerCase().includes(queryLower)) {
      suggestions.add(hospital.hospitalName);
    }
    
    // Add province if it matches
    if (hospital.province?.toLowerCase().includes(queryLower)) {
      suggestions.add(hospital.province);
    }
    
    // Add organization type if it matches
    if (hospital.organizationType?.toLowerCase().includes(queryLower)) {
      suggestions.add(hospital.organizationType);
    }
  });
  
  return Array.from(suggestions).slice(0, limit);
}

// ============================================
// HOSPITAL SORTING
// ============================================

/**
 * Sort hospitals by specified field and direction
 */
export function sortHospitals(
  hospitals: HospitalInfo[], 
  field: keyof HospitalInfo, 
  direction: 'asc' | 'desc'
): HospitalInfo[] {
  return [...hospitals].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;
    
    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, 'th');
      return direction === 'asc' ? comparison : -comparison;
    }
    
    // Boolean comparison
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      const aNum = aValue ? 1 : 0;
      const bNum = bValue ? 1 : 0;
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    // Date comparison
    if (field === 'createdAt' || field === 'updatedAt') {
      const aTime = new Date(aValue as string).getTime();
      const bTime = new Date(bValue as string).getTime();
      return direction === 'asc' ? aTime - bTime : bTime - aTime;
    }
    
    // Default string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr, 'th');
    return direction === 'asc' ? comparison : -comparison;
  });
}

// ============================================
// HOSPITAL STATISTICS
// ============================================

/**
 * Calculate hospital statistics
 */
export function calculateHospitalStats(hospitals: HospitalInfo[]): {
  total: number;
  active: number;
  inactive: number;
  byOrganizationType: Record<string, number>;
  byProvince: Record<string, number>;
  byAffiliation: Record<string, number>;
} {
  const stats = {
    total: hospitals.length,
    active: 0,
    inactive: 0,
    byOrganizationType: {} as Record<string, number>,
    byProvince: {} as Record<string, number>,
    byAffiliation: {} as Record<string, number>
  };
  
  hospitals.forEach(hospital => {
    // Count active/inactive
    if (hospital.isActive) {
      stats.active++;
    } else {
      stats.inactive++;
    }
    
    // Count by organization type
    const orgType = hospital.organizationType || 'ไม่ระบุ';
    stats.byOrganizationType[orgType] = (stats.byOrganizationType[orgType] || 0) + 1;
    
    // Count by province
    const province = hospital.province || 'ไม่ระบุ';
    stats.byProvince[province] = (stats.byProvince[province] || 0) + 1;
    
    // Count by affiliation
    const affiliation = hospital.affiliation || 'ไม่ระบุ';
    stats.byAffiliation[affiliation] = (stats.byAffiliation[affiliation] || 0) + 1;
  });
  
  return stats;
}