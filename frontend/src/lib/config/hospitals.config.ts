// frontend/src/lib/config/hospitals.config.ts
// ✅ Hospital Configuration & Constants
// Used in Dashboard > การจัดการระบบ > จัดการโรงพยาบาล
// Theme-compatible with existing dark mode system

import type { 
  HospitalTableColumn, 
  HospitalFilterOptions, 
  HospitalActionItem,
  HospitalFormMode,
  HospitalSortField 
} from '$lib/types/hospital.types';

// ============================================
// HOSPITAL TABLE CONFIGURATION
// ============================================

/**
 * Hospital table columns definition
 * Compatible with existing table theme
 */
export const HOSPITAL_TABLE_COLUMNS: HospitalTableColumn[] = [
  {
    key: 'hospitalName',
    label: 'ชื่อโรงพยาบาล',
    sortable: true,
    width: '300px',
    align: 'left',
    type: 'text',
  },
  {
    key: 'hospitalCode9eDigit',
    label: 'รหัสโรงพยาบาล',
    sortable: true,
    width: '140px',
    align: 'center',
    type: 'text',
  },
  {
    key: 'province',
    label: 'จังหวัด',
    sortable: true,
    width: '120px',
    align: 'left',
    type: 'text',
  },
  {
    key: 'organizationType',
    label: 'ประเภทองค์กร',
    sortable: true,
    width: '140px',
    align: 'center',
    type: 'badge',
  },
  {
    key: 'healthServiceType',
    label: 'ประเภทบริการ',
    sortable: true,
    width: '140px',
    align: 'center',
    type: 'badge',
  },
  {
    key: 'isActive',
    label: 'สถานะ',
    sortable: true,
    width: '80px',
    align: 'center',
    type: 'badge',
  },
  {
    key: 'updatedAt',
    label: 'แก้ไขล่าสุด',
    sortable: true,
    width: '130px',
    align: 'center',
    type: 'text',
  },
  {
    key: 'actions',
    label: 'จัดการ',
    sortable: false,
    width: '100px',
    align: 'center',
    type: 'actions',
  },
] as const;

// ============================================
// HOSPITAL ACTION ITEMS (Role-based)
// ============================================

/**
 * Hospital action menu items
 * Role-based visibility with permissions
 */
export const HOSPITAL_ACTION_ITEMS: HospitalActionItem[] = [
  {
    id: 'view',
    label: 'ดูรายละเอียด',
    icon: 'Eye',
    action: 'view',
    variant: 'default',
    requiredRole: 3, // USER and above
  },
  {
    id: 'edit',
    label: 'แก้ไข',
    icon: 'Edit',
    action: 'edit',
    variant: 'default',
    requiredRole: 1, // SUPERADMIN only
  },
  {
    id: 'toggle-status',
    label: 'เปลี่ยนสถานะ',
    icon: 'ToggleLeft',
    action: 'toggle-status',
    variant: 'default',
    requiredRole: 1, // SUPERADMIN only
  },
  {
    id: 'delete',
    label: 'ลบ',
    icon: 'Trash2',
    action: 'delete',
    variant: 'danger',
    requiredRole: 1, // SUPERADMIN only
  },
] as const;

// ============================================
// HOSPITAL FILTER OPTIONS
// ============================================

/**
 * Hospital filter dropdown options
 * Based on common Thai hospital data
 */
export const HOSPITAL_FILTER_OPTIONS: HospitalFilterOptions = {
  organizationTypes: [
    { value: 'government', label: 'หน่วยงานรัฐ' },
    { value: 'private', label: 'เอกชน' },
    { value: 'foundation', label: 'มูลนิธิ' },
    { value: 'university', label: 'มหาวิทยาลัย' },
    { value: 'military', label: 'ทหาร' },
    { value: 'police', label: 'ตำรวจ' },
    { value: 'local_government', label: 'องค์กรปกครองส่วนท้องถิ่น' },
    { value: 'state_enterprise', label: 'รัฐวิสาหกิจ' },
  ],
  
  healthServiceTypes: [
    { value: 'general_hospital', label: 'โรงพยาบาลทั่วไป' },
    { value: 'community_hospital', label: 'โรงพยาบาลชุมชน' },
    { value: 'provincial_hospital', label: 'โรงพยาบาลจังหวัด' },
    { value: 'regional_hospital', label: 'โรงพยาบาลศูนย์' },
    { value: 'tertiary_hospital', label: 'โรงพยาบาลตติยภูมิ' },
    { value: 'specialized_hospital', label: 'โรงพยาบาลเฉพาะทาง' },
    { value: 'psychiatric_hospital', label: 'โรงพยาบาลจิตเวช' },
    { value: 'rehabilitation_hospital', label: 'โรงพยาบาลฟื้นฟู' },
    { value: 'health_promoting_hospital', label: 'โรงพยาบาลส่งเสริมสุขภาพ' },
    { value: 'private_clinic', label: 'คลินิกเอกชน' },
  ],
  
  affiliations: [
    { value: 'moph', label: 'กระทรวงสาธารณสุข' },
    { value: 'defense', label: 'กระทรวงกลาโหม' },
    { value: 'interior', label: 'กระทรวงมหาดไทย' },
    { value: 'education', label: 'กระทรวงศึกษาธิการ' },
    { value: 'transport', label: 'กระทรวงคมนาคม' },
    { value: 'labor', label: 'กระทรวงแรงงาน' },
    { value: 'royal_police', label: 'สำนักงานตำรวจแห่งชาติ' },
    { value: 'bangkok_metro', label: 'กรุงเทพมหานคร' },
    { value: 'private_sector', label: 'ภาคเอกชน' },
    { value: 'foundation', label: 'มูลนิธิ/องค์กรการกุศล' },
  ],
  
  provinces: [], // ✅ จะใช้จาก locationStore แทน
} as const;

// ============================================
// HOSPITAL SORT OPTIONS
// ============================================

/**
 * Hospital sorting options for UI
 */
export const HOSPITAL_SORT_OPTIONS = [
  { value: 'hospitalName', label: 'ชื่อโรงพยาบาล' },
  { value: 'hospitalCode9eDigit', label: 'รหัสโรงพยาบาล' },
  { value: 'province', label: 'จังหวัด' },
  { value: 'organizationType', label: 'ประเภทองค์กร' },
  { value: 'createdAt', label: 'วันที่สร้าง' },
  { value: 'updatedAt', label: 'วันที่แก้ไข' },
] as const;

// ============================================
// HOSPITAL STATUS BADGES (Theme-compatible)
// ============================================

/**
 * Hospital status badge configuration
 * Compatible with existing theme variants
 */
export const HOSPITAL_STATUS_BADGES = {
  active: {
    label: 'ใช้งาน',
    variant: 'success' as const,
    color: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
    icon: 'CheckCircle',
  },
  inactive: {
    label: 'ไม่ใช้งาน',
    variant: 'error' as const,
    color: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
    icon: 'XCircle',
  },
} as const;

/**
 * Organization type badges
 */
export const ORGANIZATION_TYPE_BADGES = {
  government: {
    label: 'รัฐ',
    variant: 'info' as const,
    color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800',
  },
  private: {
    label: 'เอกชน',
    variant: 'warning' as const,
    color: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800',
  },
  foundation: {
    label: 'มูลนิธิ',
    variant: 'secondary' as const,
    color: 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800',
  },
  university: {
    label: 'มหาลัย',
    variant: 'primary' as const,
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800',
  },
} as const;

// ============================================
// HOSPITAL FORM CONFIGURATION
// ============================================

/**
 * Hospital form field groups
 * For organized form layout
 */
export const HOSPITAL_FORM_GROUPS = {
  basic: {
    title: 'ข้อมูลพื้นฐาน',
    description: 'ชื่อและรหัสโรงพยาบาล',
    fields: [
      'hospitalName',
      'hospitalCode9eDigit',
      'hospitalCode9Digit',
      'hospitalCode5Digit',
    ],
  },
  organization: {
    title: 'ข้อมูลองค์กร',
    description: 'ประเภทและสังกัดของโรงพยาบาล',
    fields: [
      'organizationType',
      'healthServiceType',
      'affiliation',
      'departmentDivision',
      'subDepartment',
    ],
  },
  location: {
    title: 'ที่อยู่และการติดต่อ',
    description: 'ข้อมูลสถานที่และการติดต่อ',
    fields: [
      'province',
      'district',
      'subdistrict',
      'address',
      'postalCode',
    ],
  },
  contact: {
    title: 'ข้อมูลการติดต่อ',
    description: 'เบอร์โทร อีเมล และเว็บไซต์',
    fields: [
      'phoneNumber',
      'faxNumber',
      'email',
      'website',
    ],
  },
  management: {
    title: 'ข้อมูลการบริหาร',
    description: 'ผู้บริหารและสถานะ',
    fields: [
      'directorName',
      'isActive',
    ],
  },
} as const;

/**
 * Hospital form validation rules
 */
export const HOSPITAL_FORM_VALIDATION = {
  hospitalName: {
    required: true,
    minLength: 3,
    maxLength: 200,
    pattern: /^[ก-๙a-zA-Z0-9\s\-\(\)\.]+$/,
    message: 'ชื่อโรงพยาบาลต้องมี 3-200 ตัวอักษร',
  },
  hospitalCode9eDigit: {
    required: true,
    pattern: /^[A-Z]{2}\d{7}$/,
    message: 'รหัสโรงพยาบาลต้องเป็นรูปแบบ XX1234567 (ตัวอักษร 2 ตัว + เลข 7 หลัก)',
  },
  hospitalCode9Digit: {
    required: false,
    pattern: /^\d{9}$/,
    message: 'รหัสโรงพยาบาล 9 หลักต้องเป็นตัวเลขเท่านั้น',
  },
  hospitalCode5Digit: {
    required: false,
    pattern: /^\d{5}$/,
    message: 'รหัสโรงพยาบาล 5 หลักต้องเป็นตัวเลขเท่านั้น',
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'รูปแบบอีเมลไม่ถูกต้อง',
  },
  phoneNumber: {
    required: false,
    pattern: /^[0-9\-\(\)\s+]{8,15}$/,
    message: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
  },
  website: {
    required: false,
    pattern: /^https?:\/\/[^\s]+$/,
    message: 'รูปแบบเว็บไซต์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)',
  },
  postalCode: {
    required: false,
    pattern: /^\d{5}$/,
    message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก',
  },
} as const;

// ============================================
// HOSPITAL PAGINATION & LIMITS
// ============================================

/**
 * Default pagination settings
 */
export const HOSPITAL_PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  limitOptions: [10, 20, 50, 100],
  maxLimit: 1000,
} as const;

/**
 * Hospital search settings
 */
export const HOSPITAL_SEARCH = {
  minSearchLength: 2,
  debounceDelay: 300,
  maxSuggestions: 10,
} as const;

// ============================================
// HOSPITAL ROUTE CONFIGURATIONS
// ============================================

/**
 * Hospital route paths
 */
export const HOSPITAL_ROUTES = {
  list: '/hospitals',
  create: '/hospitals/create',
  detail: (code: string) => `/hospitals/${code}`,
  edit: (code: string) => `/hospitals/${code}/edit`,
} as const;

/**
 * Hospital breadcrumb configurations
 */
export const HOSPITAL_BREADCRUMBS = {
  list: [
    { id: 'dashboard', label: 'แดชบอร์ด', href: '/dashboard' },
    { id: 'management', label: 'การจัดการระบบ' },
    { id: 'hospitals', label: 'จัดการโรงพยาบาล', current: true },
  ],
  create: [
    { id: 'dashboard', label: 'แดชบอร์ด', href: '/dashboard' },
    { id: 'management', label: 'การจัดการระบบ' },
    { id: 'hospitals', label: 'จัดการโรงพยาบาล', href: '/hospitals' },
    { id: 'create', label: 'เพิ่มโรงพยาบาล', current: true },
  ],
  detail: (hospitalName: string) => [
    { id: 'dashboard', label: 'แดชบอร์ด', href: '/dashboard' },
    { id: 'management', label: 'การจัดการระบบ' },
    { id: 'hospitals', label: 'จัดการโรงพยาบาล', href: '/hospitals' },
    { id: 'detail', label: hospitalName, current: true },
  ],
  edit: (hospitalName: string) => [
    { id: 'dashboard', label: 'แดชบอร์ด', href: '/dashboard' },
    { id: 'management', label: 'การจัดการระบบ' },
    { id: 'hospitals', label: 'จัดการโรงพยาบาล', href: '/hospitals' },
    { id: 'detail', label: hospitalName, href: `/hospitals/${hospitalName}` },
    { id: 'edit', label: 'แก้ไข', current: true },
  ],
} as const;