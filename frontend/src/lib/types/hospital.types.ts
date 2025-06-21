// frontend/src/lib/types/hospital.types.ts
// ✅ Hospital TypeScript types - Re-export from backend + Frontend-specific types
// Used in Dashboard > การจัดการระบบ > จัดการโรงพยาบาล

import type { BaseResponse, PaginationMeta } from './common.types';

// ============================================
// RE-EXPORT BACKEND TYPES (Exact match with backend)
// ============================================

/**
 * Core Hospital Entity (from backend schema)
 */
export interface HospitalInfo {
  id: string;                          // UUID
  hospitalName: string;                // ชื่อโรงพยาบาล
  hospitalCode9eDigit: string;         // รหัส 9 หลัก (primary key)
  hospitalCode9Digit?: string | null;  // รหัสเก่า 9 หลัก
  hospitalCode5Digit?: string | null;  // รหัส 5 หลัก
  organizationType?: string | null;    // ประเภทองค์กร
  healthServiceType?: string | null;   // ประเภทการให้บริการ
  affiliation?: string | null;         // สังกัด
  departmentDivision?: string | null;  // กรม/กอง
  subDepartment?: string | null;       // แผนก/ฝ่าย
  province?: string | null;            // จังหวัด
  district?: string | null;            // อำเภอ
  subdistrict?: string | null;         // ตำบล
  address?: string | null;             // ที่อยู่
  postalCode?: string | null;          // รหัสไปรษณีย์
  phoneNumber?: string | null;         // เบอร์โทรศัพท์
  faxNumber?: string | null;           // เบอร์แฟกซ์
  email?: string | null;               // อีเมล
  website?: string | null;             // เว็บไซต์
  directorName?: string | null;        // ชื่อผู้อำนวยการ
  isActive: boolean;                   // สถานะการใช้งาน
  createdAt: string;                   // วันที่สร้าง (ISO string)
  updatedAt: string;                   // วันที่แก้ไขล่าสุด (ISO string)
  
  // Optional count relations (from backend)
  _count?: {
    patientVisits: number;             // จำนวนผู้ป่วย
    populations: number;               // จำนวนข้อมูลประชากร
    users: number;                     // จำนวนผู้ใช้งาน
  };
  
  // Optional population data (from backend)
  populations?: Array<{
    id: string;
    year: number;
    count: number;
  }>;
}

/**
 * Create Hospital Request (from backend schema)
 */
export interface CreateHospitalRequest {
  hospitalName: string;                // ✅ Required
  hospitalCode9eDigit: string;         // ✅ Required (unique)
  hospitalCode9Digit?: string;         // Optional
  hospitalCode5Digit?: string;         // Optional
  organizationType?: string;           // Optional
  healthServiceType?: string;          // Optional
  affiliation?: string;                // Optional
  departmentDivision?: string;         // Optional
  subDepartment?: string;              // Optional
  province?: string;                   // Optional
  district?: string;                   // Optional
  subdistrict?: string;                // Optional
  address?: string;                    // Optional
  postalCode?: string;                 // Optional
  phoneNumber?: string;                // Optional
  faxNumber?: string;                  // Optional
  email?: string;                      // Optional
  website?: string;                    // Optional
  directorName?: string;               // Optional
  isActive?: boolean;                  // Optional (default: true)
}

/**
 * Update Hospital Request (from backend schema)
 */
export interface UpdateHospitalRequest {
  hospitalName?: string;
  hospitalCode9eDigit?: string;
  hospitalCode9Digit?: string;
  hospitalCode5Digit?: string;
  organizationType?: string;
  healthServiceType?: string;
  affiliation?: string;
  departmentDivision?: string;
  subDepartment?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  address?: string;
  postalCode?: string;
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  directorName?: string;
  isActive?: boolean;
}

/**
 * Hospital Query Parameters (from backend schema)
 */
export interface HospitalQueryParams {
  page?: number;                       // หน้าที่ต้องการ
  limit?: number;                      // จำนวนต่อหน้า
  search?: string;                     // ค้นหาชื่อหรือรหัส
  organizationType?: string;           // กรองตามประเภทองค์กร
  healthServiceType?: string;          // กรองตามประเภทบริการ
  affiliation?: string;                // กรองตามสังกัด
  province?: string;                   // กรองตามจังหวัด
  sortBy?: string;                     // เรียงตามฟิลด์
  sortOrder?: 'asc' | 'desc';         // ลำดับการเรียง
  isActive?: boolean;                  // กรองตามสถานะ
}

/**
 * Hospital Parameter (for routes)
 */
export interface HospitalParam {
  id: string;                          // UUID for /hospitals/:id
}

/**
 * Hospital Code Parameter (for routes)
 */
export interface HospitalCodeParam {
  code: string;                        // Hospital code for /hospitals/code/:code
}

// ============================================
// BACKEND API RESPONSE TYPES
// ============================================

/**
 * Hospital List Response (from backend)
 */
export interface HospitalListResponse extends BaseResponse<{
  hospitals: HospitalInfo[];
  pagination: PaginationMeta;
}> {}

/**
 * Hospital Detail Response (from backend)
 */
export interface HospitalDetailResponse extends BaseResponse<{
  hospital: HospitalInfo;
  includePopulations?: boolean;
}> {}

/**
 * Hospital Create/Update Response (from backend)
 */
export interface HospitalCreateUpdateResponse extends BaseResponse<{
  hospital: HospitalInfo;
}> {}

/**
 * Hospital Delete Response (from backend)
 */
export interface HospitalDeleteResponse extends BaseResponse<{
  deletedId: string;
  deletedAt: string;
}> {}

/**
 * Hospital Statistics Response (from backend)
 */
export interface HospitalStatisticsResponse extends BaseResponse<{
  statistics: {
    totalHospitals: number;
    byOrganizationType: Array<{
      organizationType: string;
      count: number;
    }>;
    byHealthServiceType: Array<{
      healthServiceType: string;
      count: number;
    }>;
    byAffiliation: Array<{
      affiliation: string;
      count: number;
    }>;
    timestamp: string;
  };
}> {}

/**
 * Hospital Error Response (from backend)
 */
export interface HospitalErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================
// FRONTEND-SPECIFIC TYPES (for UI/Components)
// ============================================

/**
 * Hospital Table Column Definition
 */
export interface HospitalTableColumn {
  key: keyof HospitalInfo | 'actions';
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'badge' | 'link' | 'actions';
}

/**
 * Hospital Filter Options for UI
 */
export interface HospitalFilterOptions {
  organizationTypes: Array<{ value: string; label: string; }>;
  healthServiceTypes: Array<{ value: string; label: string; }>;
  affiliations: Array<{ value: string; label: string; }>;
  provinces: Array<{ value: string; label: string; }>;
}

/**
 * Hospital Form State (for create/edit forms)
 */
export interface HospitalFormState {
  data: CreateHospitalRequest | UpdateHospitalRequest;
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

/**
 * Hospital Action Menu Item
 */
export interface HospitalActionItem {
  id: string;
  label: string;
  icon: string;
  action: 'view' | 'edit' | 'delete' | 'toggle-status';
  variant?: 'default' | 'danger';
  requiredRole?: number;
  permission?: string;
}

/**
 * Hospital Search/Filter State
 */
export interface HospitalSearchState {
  query: string;
  filters: {
    organizationType?: string;
    healthServiceType?: string;
    affiliation?: string;
    province?: string;
    isActive?: boolean;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isAdvancedOpen: boolean;
}

/**
 * Hospital UI Status Badge
 */
export interface HospitalStatusBadge {
  status: 'active' | 'inactive';
  label: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  color: string;
}

/**
 * Hospital Breadcrumb Item
 */
export interface HospitalBreadcrumb {
  id: string;
  label: string;
  href?: string;
  current?: boolean;
}

// ============================================
// UTILITY & HELPER TYPES
// ============================================

/**
 * Hospital Field Validation Result
 */
export interface HospitalFieldValidation {
  isValid: boolean;
  message?: string;
}

/**
 * Hospital Code Mapping (for dropdowns)
 */
export interface HospitalCodeMapping {
  [code: string]: {
    name: string;
    province?: string;
    organizationType?: string;
  };
}

/**
 * Hospital Item for Reports/Dropdowns
 */
export interface HospitalDropdownItem {
  id: string;
  hospitalName: string;
  hospitalCode9eDigit: string;
  province?: string;
  isActive: boolean;
}

// ============================================
// TYPE UNIONS & EXPORTS
// ============================================

/**
 * All Hospital Request Types
 */
export type HospitalRequestTypes = 
  | CreateHospitalRequest 
  | UpdateHospitalRequest 
  | HospitalQueryParams;

/**
 * All Hospital Response Types
 */
export type HospitalResponseTypes = 
  | HospitalListResponse 
  | HospitalDetailResponse 
  | HospitalCreateUpdateResponse 
  | HospitalDeleteResponse 
  | HospitalStatisticsResponse 
  | HospitalErrorResponse;

/**
 * Hospital CRUD Operations
 */
export type HospitalCrudAction = 'create' | 'read' | 'update' | 'delete';

/**
 * Hospital Form Mode
 */
export type HospitalFormMode = 'create' | 'edit' | 'view';

/**
 * Hospital Sort Fields
 */
export type HospitalSortField = 
  | 'hospitalName' 
  | 'hospitalCode9eDigit' 
  | 'province' 
  | 'organizationType' 
  | 'createdAt' 
  | 'updatedAt';

// ============================================
// DEFAULT VALUES & CONSTANTS
// ============================================

/**
 * Default Hospital Query Parameters
 */
export const DEFAULT_HOSPITAL_QUERY: Required<Pick<HospitalQueryParams, 'page' | 'limit' | 'sortBy' | 'sortOrder'>> = {
  page: 1,
  limit: 20,
  sortBy: 'hospitalName',
  sortOrder: 'asc',
} as const;

/**
 * Hospital Table Columns Configuration
 */
export const HOSPITAL_TABLE_COLUMNS: HospitalTableColumn[] = [
  { key: 'hospitalName', label: 'ชื่อโรงพยาบาล', sortable: true, width: '300px' },
  { key: 'hospitalCode9eDigit', label: 'รหัสโรงพยาบาล', sortable: true, width: '140px', type: 'text' },
  { key: 'province', label: 'จังหวัด', sortable: true, width: '120px' },
  { key: 'organizationType', label: 'ประเภท', sortable: true, width: '120px', type: 'badge' },
  { key: 'isActive', label: 'สถานะ', sortable: true, width: '80px', type: 'badge', align: 'center' },
  { key: 'updatedAt', label: 'แก้ไขล่าสุด', sortable: true, width: '130px' },
  { key: 'actions', label: 'จัดการ', sortable: false, width: '100px', align: 'center', type: 'actions' },
] as const;