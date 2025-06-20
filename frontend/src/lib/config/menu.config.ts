// frontend/src/lib/config/menu.config.ts
// Menu configuration for role-based dashboard
// ✅ Type-safe menu system with role permissions

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
        description: 'จัดการผู้ใช้ทุก Role',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'manage-hospitals',
        title: 'จัดการโรงพยาบาล',
        icon: MENU_ICONS.hospitals,
        route: '/admin/hospitals',
        description: 'จัดการข้อมูลโรงพยาบาล',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'manage-diseases',
        title: 'จัดการโรค',
        icon: MENU_ICONS.diseases,
        route: '/admin/diseases',
        description: 'จัดการโรคและอาการ',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'manage-population',
        title: 'จัดการข้อมูลประชากร',
        icon: MENU_ICONS.population,
        route: '/admin/population',
        description: 'จัดการข้อมูลประชากรทุกโรงพยาบาล',
        requiredRole: 1,
        isActive: true,
      },
    ],
  },
  {
    id: 'patients',
    title: 'การจัดการผู้ป่วย',
    order: 3,
    items: [
      {
        id: 'all-patients',
        title: 'ผู้ป่วยทุกโรงพยาบาล',
        icon: MENU_ICONS.patientList,
        route: '/patients/all',
        description: 'ดูข้อมูลผู้ป่วยทุกโรงพยาบาล',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'patient-analytics',
        title: 'วิเคราะห์ข้อมูลผู้ป่วย',
        icon: MENU_ICONS.analytics,
        route: '/patients/analytics',
        description: 'วิเคราะห์แนวโน้มและสถิติ',
        requiredRole: 1,
        isActive: true,
      },
    ],
  },
  {
    id: 'settings',
    title: 'การตั้งค่า',
    order: 4,
    items: [
      {
        id: 'system-settings',
        title: 'ตั้งค่าระบบ',
        icon: MENU_ICONS.settings,
        route: '/admin/settings',
        description: 'ตั้งค่าระบบทั่วไป',
        requiredRole: 1,
        isActive: true,
      },
      {
        id: 'profile',
        title: 'ข้อมูลส่วนตัว',
        icon: MENU_ICONS.profile,
        route: '/profile',
        description: 'จัดการข้อมูลโปรไฟล์',
        requiredRole: 1,
        isActive: true,
      },
    ],
  },
];

/**
 * ADMIN Menu Items - Hospital Level Management
 */
export const ADMIN_MENU: MenuSection[] = [
  {
    id: 'overview',
    title: 'ภาพรวมโรงพยาบาล',
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
      {
        id: 'hospital-reports',
        title: 'รายงานโรงพยาบาล',
        icon: MENU_ICONS.reports,
        route: '/reports/hospital',
        description: 'รายงานสถิติโรงพยาบาลตัวเอง',
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
        id: 'manage-staff',
        title: 'จัดการเจ้าหน้าที่',
        icon: MENU_ICONS.users,
        route: '/admin/staff',
        description: 'จัดการผู้ใช้ในโรงพยาบาล',
        requiredRole: 2,
        isActive: true,
      },
      {
        id: 'manage-hospital-data',
        title: 'จัดการข้อมูลโรงพยาบาล',
        icon: MENU_ICONS.hospitalData,
        route: '/admin/hospital-data',
        description: 'จัดการข้อมูลโรงพยาบาลตัวเอง',
        requiredRole: 2,
        isActive: true,
      },
      {
        id: 'manage-population-local',
        title: 'จัดการข้อมูลประชากร',
        icon: MENU_ICONS.population,
        route: '/admin/population/local',
        description: 'จัดการข้อมูลประชากรโรงพยาบาลตัวเอง',
        requiredRole: 2,
        isActive: true,
      },
    ],
  },
  {
    id: 'patients',
    title: 'การจัดการผู้ป่วย',
    order: 3,
    items: [
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
        id: 'add-patient',
        title: 'เพิ่มรายงานผู้ป่วย',
        icon: MENU_ICONS.patientAdd,
        route: '/patients/add',
        description: 'บันทึกข้อมูลผู้ป่วยใหม่',
        requiredRole: 2,
        isActive: true,
      },
      {
        id: 'patient-history',
        title: 'ประวัติผู้ป่วย',
        icon: MENU_ICONS.patientHistory,
        route: '/patients/history',
        description: 'ค้นหาประวัติผู้ป่วย',
        requiredRole: 2,
        isActive: true,
      },
    ],
  },
  {
    id: 'profile',
    title: 'ข้อมูลส่วนตัว',
    order: 4,
    items: [
      {
        id: 'profile',
        title: 'ข้อมูลโปรไฟล์',
        icon: MENU_ICONS.profile,
        route: '/profile',
        description: 'จัดการข้อมูลส่วนตัว',
        requiredRole: 2,
        isActive: true,
      },
    ],
  },
];

/**
 * USER Menu Items - Basic Operations
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
        description: 'ภาพรวมข้อมูลพื้นฐาน',
        requiredRole: 3,
        isActive: true,
      },
      {
        id: 'my-reports',
        title: 'รายงานของฉัน',
        icon: MENU_ICONS.reports,
        route: '/reports/my',
        description: 'รายงานที่ฉันสร้าง',
        requiredRole: 3,
        isActive: true,
      },
    ],
  },
  {
    id: 'patients',
    title: 'การจัดการผู้ป่วย',
    order: 2,
    items: [
      {
        id: 'patient-list',
        title: 'รายการผู้ป่วย',
        icon: MENU_ICONS.patientList,
        route: '/patients',
        description: 'ดูรายการผู้ป่วยในโรงพยาบาล',
        requiredRole: 3,
        isActive: true,
      },
      {
        id: 'add-patient',
        title: 'เพิ่มรายงานผู้ป่วย',
        icon: MENU_ICONS.patientAdd,
        route: '/patients/add',
        description: 'บันทึกข้อมูลผู้ป่วยใหม่',
        requiredRole: 3,
        isActive: true,
      },
      {
        id: 'patient-history',
        title: 'ค้นหาประวัติผู้ป่วย',
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
        id: 'export-data',
        title: 'ส่งออกข้อมูล',
        icon: MENU_ICONS.export,
        route: '/reports/export',
        description: 'ส่งออกข้อมูลเป็น Excel',
        requiredRole: 3,
        isActive: true,
      },
    ],
  },
  {
    id: 'profile',
    title: 'ข้อมูลส่วนตัว',
    order: 4,
    items: [
      {
        id: 'profile',
        title: 'ข้อมูลโปรไฟล์',
        icon: MENU_ICONS.profile,
        route: '/profile',
        description: 'จัดการข้อมูลส่วนตัว',
        requiredRole: 3,
        isActive: true,
      },
    ],
  },
];

// ============================================
// MENU UTILITIES
// ============================================

/**
 * Get menu items for specific role
 */
export function getMenuForRole(roleId: UserRoleId): MenuSection[] {
  switch (roleId) {
    case 1:
      return SUPERADMIN_MENU;
    case 2:
      return ADMIN_MENU;
    case 3:
      return USER_MENU;
    default:
      return USER_MENU; // Default to most restrictive
  }
}

/**
 * Get all menu items (flat array) for specific role
 */
export function getMenuItemsForRole(roleId: UserRoleId): MenuItem[] {
  const menuSections = getMenuForRole(roleId);
  return menuSections.flatMap(section => section.items);
}

/**
 * Check if user has access to specific menu item
 */
export function hasMenuAccess(userRoleId: UserRoleId, menuItemId: string): boolean {
  const menuItems = getMenuItemsForRole(userRoleId);
  const menuItem = menuItems.find(item => item.id === menuItemId);
  return !!menuItem && menuItem.isActive && userRoleId <= menuItem.requiredRole;
}

/**
 * Get menu item by ID for specific role
 */
export function getMenuItemById(roleId: UserRoleId, itemId: string): MenuItem | undefined {
  const menuItems = getMenuItemsForRole(roleId);
  return menuItems.find(item => item.id === itemId);
}

/**
 * Get active menu sections for role (only sections with active items)
 */
export function getActiveMenuSections(roleId: UserRoleId): MenuSection[] {
  const menuSections = getMenuForRole(roleId);
  return menuSections
    .map(section => ({
      ...section,
      items: section.items.filter((item: MenuItem) => item.isActive && roleId <= item.requiredRole),
    }))
    .filter(section => section.items.length > 0);
}