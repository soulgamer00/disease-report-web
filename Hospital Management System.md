# 🏥 Hospital Management System

ระบบจัดการโรงพยาบาลสำหรับ SvelteKit 5 + TypeScript พร้อม Type Safety และ Client-side Implementation

## 📋 สารบัญ

- [🎯 Overview](#-overview)
- [🗂️ File Structure](#️-file-structure)
- [🔧 Features](#-features)
- [⚙️ Installation](#️-installation)
- [💻 Usage](#-usage)
- [🔐 Permissions](#-permissions)
- [🎨 Components](#-components)
- [🔍 API Integration](#-api-integration)
- [✅ Type Safety](#-type-safety)
- [📱 Responsive Design](#-responsive-design)

## 🎯 Overview

Hospital Management System เป็นส่วนหนึ่งของระบบรายงานโรค ที่ให้ผู้ใช้จัดการข้อมูลโรงพยาบาลแบบครบถ้วน ประกอบด้วย:

- **CRUD Operations** - สร้าง อ่าน แก้ไข ลบ โรงพยาบาล
- **Search & Filter** - ค้นหาและกรองข้อมูลโรงพยาบาล
- **Role-based Access** - การเข้าถึงตามสิทธิ์ผู้ใช้
- **Type Safety** - TypeScript strict mode ไม่ใช้ `any`
- **Client-side Only** - ไม่ใช้ SSR เพื่อ SPA performance

## 🗂️ File Structure

```
src/
├── lib/
│   ├── types/
│   │   └── hospital.types.ts           # Hospital TypeScript types
│   ├── api/
│   │   └── hospital.api.ts             # Hospital API client
│   ├── components/hospitals/
│   │   ├── HospitalTable.svelte        # Hospital list table
│   │   ├── HospitalFilters.svelte      # Search & filter component
│   │   └── HospitalForm.svelte         # Create/Edit form
│   └── utils/
│       ├── hospital.utils.ts           # Hospital utility functions
│       └── validation/
│           └── hospital.validation.ts  # Frontend validation
└── routes/hospitals/
    ├── +page.svelte                    # Hospital list page
    ├── create/
    │   └── +page.svelte                # Create hospital page
    └── [code]/
        ├── +page.svelte                # Hospital detail page
        └── edit/
            └── +page.svelte            # Edit hospital page
```

## 🔧 Features

### ✨ Core Features

- **🏥 Hospital CRUD** - เพิ่ม แก้ไข ลบ ดู รายละเอียดโรงพยาบาล
- **🔍 Smart Search** - ค้นหาโดยชื่อ, รหัส, ที่อยู่ พร้อม debouncing
- **🎯 Advanced Filters** - กรองตามประเภท, จังหวัด, สถานะ, สังกัด
- **📄 Pagination** - แบ่งหน้าข้อมูลพร้อม responsive design
- **📊 Sorting** - เรียงลำดับตามคอลัมน์ต่างๆ
- **📱 Responsive** - ใช้งานได้บนมือถือและเดสก์ท็อป

### 🎨 UI/UX Features

- **💫 Loading States** - แสดงสถานะขณะโหลดข้อมูล
- **⚠️ Error Handling** - จัดการ error แบบ user-friendly
- **🏷️ Status Badges** - แสดงสถานะโรงพยาบาลด้วยสี
- **🔗 Smart Links** - ลิงก์โทรศัพท์, อีเมล, เว็บไซต์
- **🧭 Breadcrumbs** - แสดงเส้นทางการนำทาง
- **📋 Form Validation** - ตรวจสอบข้อมูลแบบ real-time

### 🔐 Security Features

- **🛡️ Input Sanitization** - ทำความสะอาดข้อมูลป้องกัน XSS
- **✅ Validation** - ตรวจสอบรูปแบบข้อมูลที่ปลอดภัย
- **🔒 Role-based UI** - แสดงปุ่มตามสิทธิ์ผู้ใช้
- **🚫 Permission Checks** - ตรวจสอบสิทธิ์ก่อนทำงาน

## ⚙️ Installation

### Prerequisites

```bash
# ต้องมี dependencies เหล่านี้
npm install lodash-es dayjs
npm install -D @types/lodash-es

# SvelteKit 5 + TypeScript (ควรมีอยู่แล้ว)
npm install @sveltejs/kit svelte typescript
```

### Setup

1. **Copy ไฟล์ทั้งหมด** ตามโครงสร้างที่กำหนด

2. **ตรวจสอบ Types** - ให้แน่ใจว่า `UserInfo` type ใน `auth.types.ts` ตรงกับที่ใช้

3. **Configure API Base URL** - ตั้งค่า API endpoint ใน `apiClient`

4. **Update Navigation** - เพิ่มลิงก์ไปยัง `/hospitals` ใน nav menu

## 💻 Usage

### 🏥 Hospital List Page (`/hospitals`)

```svelte
<!-- แสดงรายการโรงพยาบาลพร้อมฟีเจอร์ครบ -->
<script>
  import { hospitalAPI } from '$lib/api/hospital.api';
  // Auto-load พร้อม search, filter, pagination
</script>
```

**Features:**
- Search แบบ debounced (300ms delay)
- Filter ตามประเภท, จังหวัด, สถานะ
- Pagination responsive
- Sort ตามคอลัมน์
- URL state persistence

### ➕ Create Hospital (`/hospitals/create`)

```svelte
<!-- สร้างโรงพยาบาลใหม่ (Superadmin เท่านั้น) -->
<script>
  // Permission check + form validation
  // Auto-redirect หลังสร้างสำเร็จ
</script>
```

**Validation Rules:**
- ชื่อโรงพยาบาล: required, 3-200 ตัวอักษร
- รหัส 9 หลักใหม่: required, รูปแบบ `XX1234567`
- รหัส 9/5 หลักเก่า: optional, ตัวเลขเท่านั้น
- อีเมล: optional, รูปแบบ email
- เว็บไซต์: optional, ต้องมี http/https

### 👁️ Hospital Detail (`/hospitals/[code]`)

```svelte
<!-- แสดงรายละเอียดโรงพยาบาล -->
<script>
  // Auto-load จาก hospital code ใน URL
  // แสดงข้อมูลครบถ้วนพร้อม contact links
</script>
```

**Display Sections:**
- ข้อมูลพื้นฐาน (ชื่อ, รหัส, ประเภท)
- ข้อมูลติดต่อ (โทร, อีเมล, เว็บไซต์)
- ที่อยู่ (จังหวัด, อำเภอ, ตำบล)
- ข้อมูลระบบ (วันที่สร้าง, อัปเดต)

### ✏️ Edit Hospital (`/hospitals/[code]/edit`)

```svelte
<!-- แก้ไขโรงพยาบาล (Superadmin เท่านั้น) -->
<script>
  // Pre-fill form with existing data
  // Real-time validation
</script>
```

## 🔐 Permissions

### User Roles

| Role | ID | Permissions |
|------|----| ------------|
| **Superadmin** | 1 | Create, Read, Update, Delete ทุกโรงพยาบาล |
| **Admin** | 2 | Read ทุกโรงพยาบาล |
| **User** | 3 | Read ทุกโรงพยาบาล |

### Permission Checks

```typescript
// ตรวจสอบสิทธิ์ใน component
$: isSuperadmin = currentUser?.userRoleId === 1;
$: canCreate = isSuperadmin;
$: canEdit = isSuperadmin;
$: canDelete = isSuperadmin;
```

## 🎨 Components

### HospitalTable.svelte

```svelte
<HospitalTable
  {hospitals}
  {loading}
  {currentSort}
  showActions={true}
  showDeleteAction={canDelete}
  on:sort={handleSort}
  on:delete={handleDelete}
/>
```

**Props:**
- `hospitals: HospitalInfo[]` - รายการโรงพยาบาล
- `loading: boolean` - สถานะโหลด
- `currentSort` - การเรียงลำดับปัจจุบัน
- `showActions` - แสดงปุ่มดำเนินการ
- `showDeleteAction` - แสดงปุ่มลบ (Superadmin)

**Events:**
- `sort` - เมื่อคลิกเรียงลำดับ
- `delete` - เมื่อคลิกลบ
- `edit` - เมื่อคลิกแก้ไข
- `view` - เมื่อคลิกดู

### HospitalFilters.svelte

```svelte
<HospitalFilters
  bind:filters
  {loading}
  {dropdownOptions}
  on:filter={handleFilter}
  on:reset={handleReset}
/>
```

**Features:**
- Debounced search (300ms)
- Advanced filters toggle
- Active filters display
- Reset functionality

### HospitalForm.svelte

```svelte
<HospitalForm
  {hospital}           <!-- null = create mode -->
  {loading}
  {errors}
  {dropdownOptions}
  on:submit={handleSubmit}
  on:cancel={handleCancel}
/>
```

**Validation:**
- Client-side validation (UX)
- Real-time error display
- Required field highlighting
- Cross-field validation

## 🔍 API Integration

### Hospital API Client

```typescript
import { hospitalAPI } from '$lib/api/hospital.api';

// ดึงรายการโรงพยาบาล
const response = await hospitalAPI.getList({
  page: 1,
  limit: 20,
  search: 'โรงพยาบาล',
  organizationType: 'government'
});

// สร้างโรงพยาบาลใหม่
const newHospital = await hospitalAPI.create({
  hospitalName: 'โรงพยาบาลใหม่',
  hospitalCode9eDigit: 'TH1234567'
});
```

### API Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getList()` | `GET /hospitals` | ดึงรายการโรงพยาบาล |
| `getById()` | `GET /hospitals/:id` | ดึงโรงพยาบาลตาม ID |
| `getByCode()` | `GET /hospitals/code/:code` | ดึงโรงพยาบาลตามรหัส |
| `create()` | `POST /hospitals` | สร้างโรงพยาบาลใหม่ |
| `update()` | `PUT /hospitals/:id` | แก้ไขโรงพยาบาล |
| `delete()` | `DELETE /hospitals/:id` | ลบโรงพยาบาล |
| `getStatistics()` | `GET /hospitals/statistics/summary` | ดึงสถิติ |

### Error Handling

```typescript
try {
  const response = await hospitalAPI.create(data);
} catch (error) {
  if (error instanceof Error) {
    // Handle validation errors from backend
    const errorData = JSON.parse(error.message);
    if (errorData.details) {
      errors = errorData.details; // Field-specific errors
    }
  }
}
```

## ✅ Type Safety

### No `any` Types Policy

```typescript
// ❌ ห้ามใช้ any
function handleData(data: any) { }

// ✅ ใช้ proper types
function handleData(data: HospitalInfo) { }
function handleEvent(event: CustomEvent<HospitalFilters>) { }
```

### Type Imports

```typescript
import type { 
  HospitalInfo,
  HospitalFilters,
  CreateHospitalRequest,
  UpdateHospitalRequest 
} from '$lib/types/hospital.types';

import type { UserInfo } from '$lib/types/auth.types';
```

### Strict Validation

```typescript
// Type-safe validation with proper return types
export function validateField(
  fieldName: string, 
  value: string | boolean
): FieldValidationResult {
  // Implementation with full type safety
}
```

## 📱 Responsive Design

### Breakpoints

- **Mobile:** `< 640px` - Stack layout, full-width cards
- **Tablet:** `640px - 1024px` - 2-column grid
- **Desktop:** `> 1024px` - Multi-column layout

### Mobile Optimizations

```svelte
<!-- Responsive table -->
<div class="overflow-x-auto">
  <table class="min-w-full">
    <!-- Table content -->
  </table>
</div>

<!-- Mobile pagination -->
<div class="flex flex-1 justify-between sm:hidden">
  <button>ก่อนหน้า</button>
  <button>ถัดไป</button>
</div>
```

### Grid Layouts

```svelte
<!-- Responsive form grid -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <!-- Form fields -->
</div>

<!-- Responsive card grid -->
<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <!-- Content cards -->
</div>
```

## 🧪 Testing Considerations

### Unit Testing

```typescript
// Test validation functions
import { validateField } from '$lib/utils/validation/hospital.validation';

test('validates hospital code format', () => {
  const result = validateField('hospitalCode9eDigit', 'TH1234567');
  expect(result.isValid).toBe(true);
});
```

### Component Testing

```typescript
// Test component behavior
import { render, fireEvent } from '@testing-library/svelte';
import HospitalForm from '$lib/components/hospitals/HospitalForm.svelte';

test('shows validation errors', async () => {
  const { getByRole, getByText } = render(HospitalForm);
  // Test form validation
});
```

## 🔧 Customization

### Dropdown Options

```typescript
// Customize dropdown options in create/edit pages
const dropdownOptions: HospitalDropdownOptions = {
  organizationTypes: [
    { value: 'government', label: 'หน่วยงานรัฐ' },
    { value: 'private', label: 'เอกชน' }
  ],
  // Add more options as needed
};
```

### Validation Rules

```typescript
// Extend validation in hospital.validation.ts
const CUSTOM_RULES: ValidationRules = {
  hospitalName: {
    required: true,
    minLength: 5, // Increase minimum length
    custom: (value) => {
      // Add custom validation logic
      return value.includes('โรงพยาบาล') ? '' : 'ต้องมีคำว่า "โรงพยาบาล"';
    }
  }
};
```

### Styling

```css
/* Customize hospital status badges */
.hospital-status-active {
  @apply text-green-800 bg-green-100 border-green-200;
}

.hospital-status-inactive {
  @apply text-red-800 bg-red-100 border-red-200;
}
```

## 🚀 Performance Tips

1. **Debounced Search** - ใช้ lodash debounce เพื่อลด API calls
2. **Pagination** - แบ่งข้อมูลเป็นหน้าๆ ไม่โหลดทั้งหมด
3. **Lazy Loading** - โหลดข้อมูลเมื่อต้องการใช้
4. **Memoization** - cache ผลลัพธ์การคำนวณ
5. **Virtual Scrolling** - สำหรับรายการที่มีข้อมูลเยอะ

## 🐛 Troubleshooting

### Common Issues

**1. Type Errors**
```bash
# ตรวจสอบ TypeScript config
npx tsc --noEmit

# แก้ไข type imports
import type { HospitalInfo } from '$lib/types/hospital.types';
```

**2. API Errors**
```typescript
// ตรวจสอบ network tab ใน browser
console.log('API Response:', response);

// ตรวจสอบ JWT token
const token = localStorage.getItem('authToken');
```

**3. Permission Issues**
```typescript
// ตรวจสอบ user role
console.log('User Role:', currentUser?.userRoleId);

// ตรวจสอบ route guards
if (!isSuperadmin) {
  goto('/hospitals');
}
```

## 📚 Additional Resources

- [SvelteKit 5 Documentation](https://kit.svelte.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lodash Documentation](https://lodash.com/docs/)

---

## 🎯 Summary

Hospital Management System นี้ถูกสร้างขึ้นด้วย:

- ✅ **Type Safety** - ไม่มี `any` types เลย
- ✅ **Client-side Only** - ไม่ใช้ SSR
- ✅ **Role-based Access** - ควบคุมสิทธิ์การเข้าถึง
- ✅ **Responsive Design** - ใช้งานได้ทุกอุปกรณ์
- ✅ **Real-time Validation** - ตรวจสอบข้อมูลทันที
- ✅ **Security First** - ป้องกัน XSS และ injection
- ✅ **Performance Optimized** - debouncing, pagination, caching

พร้อมใช้งานจริงและขยายผลต่อได้! 🚀