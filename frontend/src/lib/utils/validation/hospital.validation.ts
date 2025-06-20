// src/lib/utils/validation/hospital.validation.ts
// ✅ Hospital frontend validation with complete type safety
// Client-side validation for UX (backend is source of truth)

import type { 
  HospitalFormData, 
  CreateHospitalRequest, 
  UpdateHospitalRequest 
} from '$lib/types/hospital.types';

// ============================================
// VALIDATION RESULT TYPES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;
  error: string;
  warning: string;
}

export interface ValidationRule<T = string> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string;
  allowEmpty?: boolean;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

// ============================================
// VALIDATION CONSTANTS
// ============================================

const VALIDATION_PATTERNS = {
  // Hospital codes
  HOSPITAL_CODE_NEW: /^[A-Z]{2}\d{7}$/,
  HOSPITAL_CODE_OLD: /^\d{9}$/,
  HOSPITAL_CODE_5DIGIT: /^\d{5}$/,
  
  // Contact information
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_TH: /^[0-9\-\(\)\+\s]{9,15}$/,
  WEBSITE: /^https?:\/\/.+\..+/,
  
  // Address
  POSTAL_CODE: /^\d{5}$/,
  
  // Thai text (optional - for Thai name validation)
  THAI_TEXT: /^[\u0E00-\u0E7F\s\w\-\.\(\)]+$/,
  
  // General text (no special characters that might break system)
  SAFE_TEXT: /^[^\<\>\"\'\&\;]+$/,
} as const;

const VALIDATION_MESSAGES = {
  REQUIRED: 'ฟิลด์นี้จำเป็นต้องกรอก',
  MIN_LENGTH: (min: number) => `ต้องมีอย่างน้อย ${min} ตัวอักษร`,
  MAX_LENGTH: (max: number) => `ไม่เกิน ${max} ตัวอักษร`,
  INVALID_FORMAT: 'รูปแบบไม่ถูกต้อง',
  INVALID_EMAIL: 'รูปแบบอีเมลไม่ถูกต้อง',
  INVALID_PHONE: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
  INVALID_WEBSITE: 'URL เว็บไซต์ต้องขึ้นต้นด้วย http:// หรือ https://',
  INVALID_POSTAL_CODE: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก',
  INVALID_HOSPITAL_CODE_NEW: 'รหัสโรงพยาบาลต้องเป็นรูปแบบ XX1234567 (2 ตัวอักษร + 7 ตัวเลข)',
  INVALID_HOSPITAL_CODE_OLD: 'รหัสโรงพยาบาลต้องเป็นตัวเลข 9 หลัก',
  INVALID_HOSPITAL_CODE_5DIGIT: 'รหัสโรงพยาบาลต้องเป็นตัวเลข 5 หลัก',
  UNSAFE_CHARACTERS: 'ไม่อนุญาตให้ใช้อักขระพิเศษ < > " \' & ;',
} as const;

// ============================================
// FIELD VALIDATION RULES
// ============================================

const HOSPITAL_VALIDATION_RULES: ValidationRules = {
  // Required fields
  hospitalName: {
    required: true,
    minLength: 3,
    maxLength: 200,
    pattern: VALIDATION_PATTERNS.SAFE_TEXT,
  },
  
  hospitalCode9eDigit: {
    required: true,
    pattern: VALIDATION_PATTERNS.HOSPITAL_CODE_NEW,
  },
  
  // Optional codes
  hospitalCode9Digit: {
    required: false,
    pattern: VALIDATION_PATTERNS.HOSPITAL_CODE_OLD,
    allowEmpty: true,
  },
  
  hospitalCode5Digit: {
    required: false,
    pattern: VALIDATION_PATTERNS.HOSPITAL_CODE_5DIGIT,
    allowEmpty: true,
  },
  
  // Organization information
  organizationType: {
    required: false,
    maxLength: 100,
    allowEmpty: true,
  },
  
  healthServiceType: {
    required: false,
    maxLength: 100,
    allowEmpty: true,
  },
  
  affiliation: {
    required: false,
    maxLength: 100,
    allowEmpty: true,
  },
  
  departmentDivision: {
    required: false,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.SAFE_TEXT,
    allowEmpty: true,
  },
  
  subDepartment: {
    required: false,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.SAFE_TEXT,
    allowEmpty: true,
  },
  
  // Location fields
  province: {
    required: false,
    maxLength: 50,
    allowEmpty: true,
  },
  
  district: {
    required: false,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.SAFE_TEXT,
    allowEmpty: true,
  },
  
  subdistrict: {
    required: false,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.SAFE_TEXT,
    allowEmpty: true,
  },
  
  address: {
    required: false,
    maxLength: 255,
    pattern: VALIDATION_PATTERNS.SAFE_TEXT,
    allowEmpty: true,
  },
  
  postalCode: {
    required: false,
    pattern: VALIDATION_PATTERNS.POSTAL_CODE,
    allowEmpty: true,
  },
  
  // Contact fields
  phoneNumber: {
    required: false,
    pattern: VALIDATION_PATTERNS.PHONE_TH,
    allowEmpty: true,
  },
  
  faxNumber: {
    required: false,
    pattern: VALIDATION_PATTERNS.PHONE_TH,
    allowEmpty: true,
  },
  
  email: {
    required: false,
    pattern: VALIDATION_PATTERNS.EMAIL,
    maxLength: 100,
    allowEmpty: true,
  },
  
  website: {
    required: false,
    pattern: VALIDATION_PATTERNS.WEBSITE,
    maxLength: 200,
    allowEmpty: true,
  },
  
  directorName: {
    required: false,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.SAFE_TEXT,
    allowEmpty: true,
  },
} as const;

// ============================================
// SINGLE FIELD VALIDATION
// ============================================

/**
 * Validate a single field value
 */
export function validateField(fieldName: string, value: string | boolean): FieldValidationResult {
  const result: FieldValidationResult = {
    isValid: true,
    error: '',
    warning: ''
  };
  
  // Skip validation for boolean fields
  if (typeof value === 'boolean') {
    return result;
  }
  
  const rule = HOSPITAL_VALIDATION_RULES[fieldName];
  if (!rule) {
    return result; // No validation rule defined
  }
  
  const stringValue = value as string;
  const trimmedValue = stringValue.trim();
  
  // Required field validation
  if (rule.required && !trimmedValue) {
    result.isValid = false;
    result.error = VALIDATION_MESSAGES.REQUIRED;
    return result;
  }
  
  // Allow empty for optional fields
  if (!trimmedValue && rule.allowEmpty) {
    return result;
  }
  
  // Skip further validation if field is empty and not required
  if (!trimmedValue && !rule.required) {
    return result;
  }
  
  // Length validation
  if (rule.minLength && trimmedValue.length < rule.minLength) {
    result.isValid = false;
    result.error = VALIDATION_MESSAGES.MIN_LENGTH(rule.minLength);
    return result;
  }
  
  if (rule.maxLength && trimmedValue.length > rule.maxLength) {
    result.isValid = false;
    result.error = VALIDATION_MESSAGES.MAX_LENGTH(rule.maxLength);
    return result;
  }
  
  // Pattern validation
  if (rule.pattern && !rule.pattern.test(trimmedValue)) {
    result.isValid = false;
    result.error = getPatternErrorMessage(fieldName, rule.pattern);
    return result;
  }
  
  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(trimmedValue);
    if (customError) {
      result.isValid = false;
      result.error = customError;
      return result;
    }
  }
  
  return result;
}

/**
 * Get appropriate error message for pattern validation
 */
function getPatternErrorMessage(fieldName: string, pattern: RegExp): string {
  switch (pattern) {
    case VALIDATION_PATTERNS.HOSPITAL_CODE_NEW:
      return VALIDATION_MESSAGES.INVALID_HOSPITAL_CODE_NEW;
    case VALIDATION_PATTERNS.HOSPITAL_CODE_OLD:
      return VALIDATION_MESSAGES.INVALID_HOSPITAL_CODE_OLD;
    case VALIDATION_PATTERNS.HOSPITAL_CODE_5DIGIT:
      return VALIDATION_MESSAGES.INVALID_HOSPITAL_CODE_5DIGIT;
    case VALIDATION_PATTERNS.EMAIL:
      return VALIDATION_MESSAGES.INVALID_EMAIL;
    case VALIDATION_PATTERNS.PHONE_TH:
      return VALIDATION_MESSAGES.INVALID_PHONE;
    case VALIDATION_PATTERNS.WEBSITE:
      return VALIDATION_MESSAGES.INVALID_WEBSITE;
    case VALIDATION_PATTERNS.POSTAL_CODE:
      return VALIDATION_MESSAGES.INVALID_POSTAL_CODE;
    case VALIDATION_PATTERNS.SAFE_TEXT:
      return VALIDATION_MESSAGES.UNSAFE_CHARACTERS;
    default:
      return VALIDATION_MESSAGES.INVALID_FORMAT;
  }
}

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Validate entire hospital form
 */
export function validateHospitalForm(formData: HospitalFormData): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: {},
    warnings: {}
  };
  
  // Validate each field
  Object.entries(formData).forEach(([fieldName, value]) => {
    const fieldResult = validateField(fieldName, value);
    
    if (!fieldResult.isValid) {
      result.isValid = false;
      result.errors[fieldName] = fieldResult.error;
    }
    
    if (fieldResult.warning) {
      result.warnings[fieldName] = fieldResult.warning;
    }
  });
  
  // Cross-field validation
  const crossFieldErrors = validateCrossFields(formData);
  Object.assign(result.errors, crossFieldErrors);
  
  if (Object.keys(crossFieldErrors).length > 0) {
    result.isValid = false;
  }
  
  return result;
}

/**
 * Cross-field validation (validate relationships between fields)
 */
function validateCrossFields(formData: HospitalFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  // Hospital code uniqueness validation (would need API call in real app)
  // For now, just check format consistency
  
  // Email domain consistency check
  if (formData.email && formData.website) {
    const emailDomain = extractDomain(formData.email);
    const websiteDomain = extractDomain(formData.website);
    
    if (emailDomain && websiteDomain && emailDomain !== websiteDomain) {
      errors.email = 'โดเมนอีเมลและเว็บไซต์ควรตรงกัน';
    }
  }
  
  // Address completeness check
  if (formData.address || formData.district || formData.subdistrict) {
    if (!formData.province) {
      errors.province = 'กรุณาระบุจังหวัดเมื่อกรอกที่อยู่';
    }
  }
  
  // Phone number format consistency
  if (formData.phoneNumber && formData.faxNumber) {
    const phoneArea = extractAreaCode(formData.phoneNumber);
    const faxArea = extractAreaCode(formData.faxNumber);
    
    if (phoneArea && faxArea && phoneArea !== faxArea) {
      errors.faxNumber = 'รหัสพื้นที่โทรศัพท์และแฟกซ์ควรตรงกัน';
    }
  }
  
  return errors;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Extract domain from email or website
 */
function extractDomain(input: string): string | null {
  try {
    if (input.includes('@')) {
      // Email
      return input.split('@')[1]?.toLowerCase() || null;
    } else {
      // Website URL
      const url = new URL(input.startsWith('http') ? input : `https://${input}`);
      return url.hostname.toLowerCase();
    }
  } catch {
    return null;
  }
}

/**
 * Extract area code from Thai phone number
 */
function extractAreaCode(phone: string): string | null {
  const cleaned = phone.replace(/[^\d]/g, '');
  
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 3);
  }
  
  return null;
}

/**
 * Sanitize input value
 */
export function sanitizeInput(value: string): string {
  return value
    .trim()
    .replace(/[<>"'&;]/g, '') // Remove dangerous characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if hospital code is unique (mock implementation)
 */
export async function isHospitalCodeUnique(
  code: string, 
  excludeId?: string
): Promise<boolean> {
  // In real implementation, this would call the API
  // For now, just return true
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: assume codes starting with 'XX' are taken
      resolve(!code.startsWith('XX'));
    }, 500);
  });
}

// ============================================
// VALIDATION PRESETS
// ============================================

/**
 * Quick validation for required fields only
 */
export function validateRequiredFields(formData: HospitalFormData): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: {},
    warnings: {}
  };
  
  // Check only required fields
  const requiredFields = ['hospitalName', 'hospitalCode9eDigit'] as const;
  
  requiredFields.forEach((fieldName) => {
    const value = formData[fieldName];
    const fieldResult = validateField(fieldName, value);
    
    if (!fieldResult.isValid) {
      result.isValid = false;
      result.errors[fieldName] = fieldResult.error;
    }
  });
  
  return result;
}

/**
 * Validate form data before API submission
 */
export function validateForSubmission(
  formData: HospitalFormData
): ValidationResult & { cleanData: CreateHospitalRequest | UpdateHospitalRequest } {
  const validationResult = validateHospitalForm(formData);
  
  // Clean and prepare data for submission
  const cleanData: Record<string, string | boolean> = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const sanitized = sanitizeInput(value);
      if (sanitized) {
        cleanData[key] = sanitized;
      }
    } else if (typeof value === 'boolean') {
      cleanData[key] = value;
    }
  });
  
  return {
    ...validationResult,
    cleanData: cleanData as CreateHospitalRequest | UpdateHospitalRequest
  };
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Get validation rule for a field
 */
export function getValidationRule(fieldName: string): ValidationRule | null {
  return HOSPITAL_VALIDATION_RULES[fieldName] || null;
}

/**
 * Check if field is required
 */
export function isFieldRequired(fieldName: string): boolean {
  const rule = HOSPITAL_VALIDATION_RULES[fieldName];
  return rule?.required || false;
}

/**
 * Get max length for a field
 */
export function getMaxLength(fieldName: string): number | null {
  const rule = HOSPITAL_VALIDATION_RULES[fieldName];
  return rule?.maxLength || null;
}

/**
 * Get validation patterns
 */
export function getValidationPatterns(): typeof VALIDATION_PATTERNS {
  return VALIDATION_PATTERNS;
}

/**
 * Get validation messages
 */
export function getValidationMessages(): typeof VALIDATION_MESSAGES {
  return VALIDATION_MESSAGES;
}