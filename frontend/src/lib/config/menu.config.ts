// frontend/src/lib/config/menu.config.ts
// Menu configuration for role-based dashboard
// ✅ Type-safe menu system with role permissions
// ✅ เพิ่ม Hospital Management เข้าไปแล้ว

import type { UserRoleId } from '$lib/types/auth.types';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  description: string;
  requiredRole: UserRoleId;
  isActive: boolean;
  badge?: string;
  children?: MenuItem[];
}

export interface MenuSection {
  id: string;
  title: string;
  order: number;
  items: MenuItem[];
}

// ============================================
// MENU ICONS (Modern Lucide-style icons)
// ============================================

export const MENU_ICONS = {
  // User Management
  users: 'users',
  userProfile: 'user', 
  userAdd: 'user-plus',
  
  // Hospital Management  
  hospitals: 'building-2',
  hospitalData: 'clipboard-list',
  
  // Disease Management
  diseases: 'virus',
  symptoms: 'stethoscope',
  
  // Patient Management
  patients: 'file-text',
  patientList: 'list',
  patientAdd: 'plus-circle',
  patientHistory: 'history',
  
  // Reports & Analytics
  reports: 'bar-chart-3',
  analytics: 'trending-up',
  statistics: 'pie-chart',
  export: 'download',
  
  // System
  settings: 'settings',
  profile: 'user-circle',
  logout: 'log-out',
  
  // Population
  population: 'users-2',
  
  // Dashboard
  dashboard: 'layout-dashboard',
} as const;

// ============================================
// MENU ITEMS FOR EACH ROLE
// ============================================

/**
 * SUPERADMIN Menu Items - Full System Access
 */
export const SUPERADMIN_MENU: MenuSection[] = [
  {
    id: 'overview',
    title: 'ภาพรวมระบบ',
    order: 1,
    items: [
      {
        id: 'dashboard',
        title: 'แดชบอร์ด',
        icon: MENU_ICONS.dashboard,
        route: '/dashboard',
        description: 'ภาพรวมข้อมูลทั้งระบบ',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'system-reports',
        title: 'รายงานระบบ',
        icon: MENU_ICONS.reports,
        route: '/reports/system',
        description: 'รายงานสถิติทุกโรงพยาบาล',
        requiredRole: 1,
        isActive: true,
      },
    ],
  },
  {
    id: 'management',
    title: 'การจัดการระบบ',
    order: 2,
    items: [
      {
        id: 'manage-users',
        title: 'จัดการผู้ใช้งาน',
        icon: MENU_ICONS.users,
        route: '/admin/users',
        description: 'จัดการบัญชีผู้ใช้งาน',
        requiredRole: 1,
        isActive: true,
      },
      // ✅ เพิ่ม Hospital Management ใหม่
      {
        id: 'manage-hospitals',
        title: 'จัดการโรงพยาบาล',
        icon: MENU_ICONS.hospitals,
        route: '/hospitals',
        description: 'จัดการข้อมูลโรงพยาบาล',
        requiredRole: 1, // Superadmin only
        isActive: true,
      },
      {
        id: 'manage-diseases',
        title: 'จัดการโรค',
        icon: MENU_ICONS.diseases,
        route: '/admin/diseases',
        description: 'จัดการประเภทโรคและอาการ',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'manage-populations',
        title: 'จัดการข้อมูลประชากร',
        icon: MENU_ICONS.population,
        route: '/admin/populations',
        description: 'จัดการข้อมูลประชากรตามพื้นที่',
        requiredRole: 1,
        isActive: true,
      },
    ],
  },
  {
    id: 'data-entry',
    title: 'การบันทึกข้อมูล',
    order: 3,
    items: [
      {
        id: 'add-patient',
        title: 'เพิ่มข้อมูลผู้ป่วย',
        icon: MENU_ICONS.patientAdd,
        route: '/patients/add',
        description: 'บันทึกรายงานผู้ป่วยใหม่',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'patient-list',
        title: 'รายการผู้ป่วย',
        icon: MENU_ICONS.patientList,
        route: '/patients',
        description: 'ดูรายการผู้ป่วยทั้งหมด',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'patient-history',
        title: 'ประวัติผู้ป่วย',
        icon: MENU_ICONS.patientHistory,
        route: '/patients/history',
        description: 'ค้นหาประวัติการรักษา',
        requiredRole: 1,
        isActive: true,
      },
    ],
  },
  {
    id: 'reports',
    title: 'รายงานและสถิติ',
    order: 4,
    items: [
      {
        id: 'analytics-dashboard',
        title: 'วิเคราะห์ข้อมูล',
        icon: MENU_ICONS.analytics,
        route: '/reports/analytics',
        description: 'วิเคราะห์แนวโน้มโรค',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'statistics-report',
        title: 'สถิติรายงาน',
        icon: MENU_ICONS.statistics,
        route: '/reports/statistics',
        description: 'สถิติการรายงานโรค',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'export-data',
        title: 'ส่งออกข้อมูล',
        icon: MENU_ICONS.export,
        route: '/reports/export',
        description: 'ส่งออกข้อมูลเป็น Excel',
        requiredRole: 1,
        isActive: true,
      },
    ],
  },
];

/**
 * ADMIN Menu Items - Hospital Management
 */
export const ADMIN_MENU: MenuSection[] = [
  {
    id: 'overview',
    title: 'ภาพรวม',
    order: 1,
    items: [
      {
        id: 'dashboard',
        title: 'แดชบอร์ด',
        icon: MENU_ICONS.dashboard,
        route: '/dashboard',
        description: 'ภาพรวมข้อมูลโรงพยาบาล',
        requiredRole: 2,
        isActive: true,
      },
    ],
  },
  {
    id: 'management',
    title: 'การจัดการ',
    order: 2,
    items: [
      {
        id: 'manage-users-hospital',
        title: 'จัดการผู้ใช้งาน',
        icon: MENU_ICONS.users,
        route: '/admin/users',
        description: 'จัดการผู้ใช้งานในโรงพยาบาล',
        requiredRole: 2,
        isActive: true,
      },
      // ✅ Admin สามารถดู Hospital Management ได้แต่ไม่สามารถแก้ไขได้
      {
        id: 'view-hospitals',
        title: 'ข้อมูลโรงพยาบาล',
        icon: MENU_ICONS.hospitals,
        route: '/hospitals',
        description: 'ดูข้อมูลโรงพยาบาลทั้งหมด',
        requiredRole: 2, // Admin can view
        isActive: true,
      },
    ],
  },
  {
    id: 'data-entry',
    title: 'การบันทึกข้อมูล',
    order: 3,
    items: [
      {
        id: 'add-patient',
        title: 'เพิ่มข้อมูลผู้ป่วย',
        icon: MENU_ICONS.patientAdd,
        route: '/patients/add',
        description: 'บันทึกรายงานผู้ป่วยใหม่',
        requiredRole: 2,
        isActive: true,
      },
      {
        id: 'patient-list',
        title: 'รายการผู้ป่วย',
        icon: MENU_ICONS.patientList,
        route: '/patients',
        description: 'ดูรายการผู้ป่วยในโรงพยาบาล',
        requiredRole: 2,
        isActive: true,
      },
      {
        id: 'patient-history',
        title: 'ประวัติผู้ป่วย',
        icon: MENU_ICONS.patientHistory,
        route: '/patients/history',
        description: 'ค้นหาประวัติการรักษา',
        requiredRole: 2,
        isActive: true,
      },
    ],
  },
  {
    id: 'reports',
    title: 'รายงาน',
    order: 4,
    items: [
      {
        id: 'hospital-reports',
        title: 'รายงานโรงพยาบาล',
        icon: MENU_ICONS.reports,
        route: '/reports/hospital',
        description: 'รายงานสถิติโรงพยาบาล',
        requiredRole: 2,
        isActive: true,
      },
      {
        id: 'export-data',
        title: 'ส่งออกข้อมูล',
        icon: MENU_ICONS.export,
        route: '/reports/export',
        description: 'ส่งออกข้อมูลเป็น Excel',
        requiredRole: 2,
        isActive: true,
      },
    ],
  },
];

/**
 * USER Menu Items - Data Entry Only
 */
export const USER_MENU: MenuSection[] = [
  {
    id: 'overview',
    title: 'ภาพรวม',
    order: 1,
    items: [
      {
        id: 'dashboard',
        title: 'แดชบอร์ด',
        icon: MENU_ICONS.dashboard,
        route: '/dashboard',
        description: 'ภาพรวมข้อมูลการทำงาน',
        requiredRole: 3,
        isActive: true,
      },
    ],
  },
  {
    id: 'data-entry',
    title: 'การบันทึกข้อมูล',
    order: 2,
    items: [
      {
        id: 'add-patient',
        title: 'เพิ่มข้อมูลผู้ป่วย',
        icon: MENU_ICONS.patientAdd,
        route: '/patients/add',
        description: 'บันทึกรายงานผู้ป่วยใหม่',
        requiredRole: 3,
        isActive: true,
      },
      {
        id: 'patient-list',
        title: 'รายการผู้ป่วย',
        icon: MENU_ICONS.patientList,
        route: '/patients',
        description: 'ดูรายการผู้ป่วยของฉัน',
        requiredRole: 3,
        isActive: true,
      },
      {
        id: 'patient-history',
        title: 'ประวัติผู้ป่วย',
        icon: MENU_ICONS.patientHistory,
        route: '/patients/history',
        description: 'ค้นหาประวัติการรักษา',
        requiredRole: 3,
        isActive: true,
      },
    ],
  },
  {
    id: 'reports',
    title: 'รายงาน',
    order: 3,
    items: [
      {
        id: 'my-reports',
        title: 'รายงานของฉัน',
        icon: MENU_ICONS.reports,
        route: '/reports/my',
        description: 'รายงานที่ฉันสร้าง',
        requiredRole: 3,
        isActive: true,
      },
      {
        id: 'export-data',
        title: 'ส่งออกข้อมูล',
        icon: MENU_ICONS.export,
        route: '/reports/export',
        description: 'ส่งออกข้อมูลของฉัน',
        requiredRole: 3,
        isActive: true,
      },
    ],
  },
];

// ============================================
// MENU CONFIGURATION FUNCTIONS
// ============================================

/**
 * Get menu sections based on user role
 */
export function getActiveMenuSections(userRoleId: UserRoleId): MenuSection[] {
  switch (userRoleId) {
    case 1: // Superadmin
      return SUPERADMIN_MENU;
    case 2: // Admin  
      return ADMIN_MENU;
    case 3: // User
      return USER_MENU;
    default:
      return USER_MENU; // Default to most restrictive
  }
}

/**
 * Check if user has access to menu item
 */
export function canAccessMenuItem(item: MenuItem, userRoleId: UserRoleId): boolean {
  return userRoleId <= item.requiredRole;
}

/**
 * Get flattened list of all menu items for a role
 */
export function getFlatMenuItems(userRoleId: UserRoleId): MenuItem[] {
  const sections = getActiveMenuSections(userRoleId);
  return sections.flatMap(section => section.items);
}

/**
 * Find menu item by route
 */
export function findMenuItemByRoute(route: string, userRoleId: UserRoleId): MenuItem | null {
  const items = getFlatMenuItems(userRoleId);
  return items.find(item => item.route === route) || null;
}

/**
 * Get breadcrumb navigation for current route
 */
export function getBreadcrumb(route: string, userRoleId: UserRoleId): Array<{ title: string; route: string }> {
  const sections = getActiveMenuSections(userRoleId);
  
  for (const section of sections) {
    for (const item of section.items) {
      if (route.startsWith(item.route)) {
        return [
          { title: section.title, route: '#' },
          { title: item.title, route: item.route }
        ];
      }
    }
  }
  
  return [{ title: 'หน้าหลัก', route: '/dashboard' }];
}

// ============================================
// MENU VALIDATION
// ============================================

/**
 * Validate menu configuration
 */
export function validateMenuConfig(): boolean {
  const allMenus = [SUPERADMIN_MENU, ADMIN_MENU, USER_MENU];
  
  for (const menu of allMenus) {
    for (const section of menu) {
      for (const item of section.items) {
        // Check required fields
        if (!item.id || !item.title || !item.route || !item.icon) {
          console.error(`Invalid menu item: ${item.id}`);
          return false;
        }
        
        // Check role validity
        if (![1, 2, 3].includes(item.requiredRole)) {
          console.error(`Invalid role for menu item: ${item.id}`);
          return false;
        }
      }
    }
  }
  
  return true;
}

// ============================================
// EXPORT DEFAULT CONFIGURATION
// ============================================

export default {
  SUPERADMIN_MENU,
  ADMIN_MENU,
  USER_MENU,
  getActiveMenuSections,
  canAccessMenuItem,
  getFlatMenuItems,
  findMenuItemByRoute,
  getBreadcrumb,
  validateMenuConfig,
};