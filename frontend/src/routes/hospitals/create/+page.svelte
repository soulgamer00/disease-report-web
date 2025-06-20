<!-- src/routes/hospitals/create/+page.svelte -->
<!-- ✅ Hospital creation page -->
<!-- Client-side form for creating new hospitals (Superadmin only) -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { hospitalAPI } from '$lib/api/hospital.api';
  import HospitalForm from '$lib/components/hospitals/HospitalForm.svelte';
  import type { 
    CreateHospitalRequest,
    UpdateHospitalRequest, 
    HospitalDropdownOptions 
  } from '$lib/types/hospital.types';

  // ============================================
  // PAGE STATE
  // ============================================
  
  let loading = false;
  let errors: Record<string, string> = {};
  let currentUser: any = null; // Will get from auth store

  // Dropdown options for form
  let dropdownOptions: HospitalDropdownOptions = {
    organizationTypes: [],
    healthServiceTypes: [],
    affiliations: [],
    provinces: []
  };

  // ============================================
  // REACTIVE STATEMENTS
  // ============================================
  
  // Check permissions
  $: isSuperadmin = currentUser?.userRoleId === 1;
  $: canCreate = isSuperadmin;

  // Redirect if not authorized
  $: if (currentUser && !canCreate) {
    goto('/hospitals', { replaceState: true });
  }

  // ============================================
  // DATA LOADING
  // ============================================
  
  async function loadDropdownOptions() {
    try {
      // Mock dropdown options - in real app, these would come from API
      dropdownOptions = {
        organizationTypes: [
          { value: 'government', label: 'หน่วยงานรัฐ' },
          { value: 'private', label: 'เอกชน' },
          { value: 'foundation', label: 'มูลนิธิ' },
          { value: 'university', label: 'มหาวิทยาลัย' },
          { value: 'military', label: 'ทหาร' },
          { value: 'police', label: 'ตำรวจ' }
        ],
        healthServiceTypes: [
          { value: 'general_hospital', label: 'โรงพยาบาลทั่วไป' },
          { value: 'specialized_hospital', label: 'โรงพยาบาลเฉพาะทาง' },
          { value: 'community_hospital', label: 'โรงพยาบาลชุมชน' },
          { value: 'district_hospital', label: 'โรงพยาบาลอำเภอ' },
          { value: 'provincial_hospital', label: 'โรงพยาบาลจังหวัด' },
          { value: 'regional_hospital', label: 'โรงพยาบาลภูมิภาค' },
          { value: 'university_hospital', label: 'โรงพยาบาลมหาวิทยาลัย' },
          { value: 'private_hospital', label: 'โรงพยาบาลเอกชน' },
          { value: 'clinic', label: 'คลินิก' },
          { value: 'health_center', label: 'ศูนย์สุขภาพชุมชน' }
        ],
        affiliations: [
          { value: 'moph', label: 'กระทรวงสาธารณสุข' },
          { value: 'university_affairs', label: 'กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม' },
          { value: 'defense', label: 'กระทรวงกลาโหม' },
          { value: 'interior', label: 'กระทรวงมหาดไทย' },
          { value: 'transport', label: 'กระทรวงคมนาคม' },
          { value: 'royal_police', label: 'สำนักงานตำรวจแห่งชาติ' },
          { value: 'private_sector', label: 'เอกชน' },
          { value: 'foundation', label: 'มูลนิธิ' },
          { value: 'red_cross', label: 'สภากาชาดไทย' },
          { value: 'other_ministry', label: 'กระทรวงอื่นๆ' }
        ],
        provinces: [
          { value: 'กรุงเทพมหานคร', label: 'กรุงเทพมหานคร' },
          { value: 'เชียงใหม่', label: 'เชียงใหม่' },
          { value: 'เชียงราย', label: 'เชียงราย' },
          { value: 'ขอนแก่น', label: 'ขอนแก่น' },
          { value: 'อุดรธานี', label: 'อุดรธานี' },
          { value: 'นครราชสีมา', label: 'นครราชสีมา' },
          { value: 'สงขลา', label: 'สงขลา' },
          { value: 'ภูเก็ต', label: 'ภูเก็ต' },
          { value: 'นนทบุรี', label: 'นนทบุรี' },
          { value: 'ปทุมธานี', label: 'ปทุมธานี' },
          { value: 'พิษณุโลก', label: 'พิษณุโลก' },
          { value: 'สุโขทัย', label: 'สุโขทัย' },
          { value: 'นครสวรรค์', label: 'นครสวรรค์' },
          { value: 'อุตรดิตถ์', label: 'อุตรดิตถ์' },
          { value: 'ตาก', label: 'ตาก' }
        ]
      };
    } catch (err) {
      console.error('Failed to load dropdown options:', err);
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  async function handleSubmit(event: CustomEvent<CreateHospitalRequest | UpdateHospitalRequest>) {
    const hospitalData = event.detail;
    
    try {
      loading = true;
      errors = {};

      // Validate required permissions
      if (!canCreate) {
        throw new Error('คุณไม่มีสิทธิ์สร้างโรงพยาบาลใหม่');
      }

      // Submit to API (cast to CreateHospitalRequest since this is create page)
      const response = await hospitalAPI.create(hospitalData as CreateHospitalRequest);
      
      if (response.success) {
        // Success - redirect to hospital detail page
        const newHospital = response.data.hospital;
        goto(`/hospitals/${newHospital.hospitalCode9eDigit}`, { 
          replaceState: true 
        });
      } else {
        throw new Error(response.message || 'เกิดข้อผิดพลาดในการสร้างโรงพยาบาล');
      }

    } catch (err) {
      console.error('Hospital creation error:', err);
      
      // Handle validation errors from backend
      if (err instanceof Error) {
        // Try to parse backend validation errors
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.details && typeof errorData.details === 'object') {
            errors = errorData.details;
          } else {
            errors = { general: err.message };
          }
        } catch {
          // If not JSON, treat as general error
          errors = { general: err.message };
        }
      } else {
        errors = { general: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ' };
      }
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto('/hospitals');
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(async () => {
    // Load current user from auth store
    // currentUser = get(authStore).user;
    
    // Mock current user as superadmin for testing
    currentUser = { userRoleId: 1, hospitalCode9eDigit: null };
    
    // Load dropdown options
    await loadDropdownOptions();
  });
</script>

<!-- ============================================ -->
<!-- PAGE HEAD -->
<!-- ============================================ -->

<svelte:head>
  <title>เพิ่มโรงพยาบาลใหม่ - ระบบรายงานโรค</title>
  <meta name="description" content="เพิ่มโรงพยาบาลใหม่เข้าสู่ระบบรายงานโรค" />
</svelte:head>

<!-- ============================================ -->
<!-- MAIN CONTENT -->
<!-- ============================================ -->

<div class="min-h-screen bg-gray-50">
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    
    <!-- Page Header -->
    <div class="mb-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-4" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <a href="/hospitals" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
              <svg class="w-3 h-3 mr-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              จัดการโรงพยาบาล
            </a>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">เพิ่มโรงพยาบาล</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Page Title -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">เพิ่มโรงพยาบาลใหม่</h1>
          <p class="mt-2 text-sm text-gray-700">
            กรอกข้อมูลโรงพยาบาลใหม่ที่ต้องการเพิ่มเข้าสู่ระบบ
          </p>
        </div>

        <!-- Back Button -->
        <button
          type="button"
          on:click={handleCancel}
          class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          กลับ
        </button>
      </div>
    </div>

    <!-- Permission Check -->
    {#if currentUser && !canCreate}
      <div class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">ไม่มีสิทธิ์เข้าถึง</h3>
            <p class="mt-1 text-sm text-red-700">
              คุณไม่มีสิทธิ์สร้างโรงพยาบาลใหม่ กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>
      </div>
    {:else}
      <!-- General Error -->
      {#if errors.general}
        <div class="mb-6 rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
              <p class="mt-1 text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Instructions -->
      <div class="mb-6 rounded-md bg-blue-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">คำแนะนำการกรอกข้อมูล</h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc list-inside space-y-1">
                <li><strong>ชื่อโรงพยาบาล</strong> และ <strong>รหัสโรงพยาบาล (9 หลักใหม่)</strong> เป็นข้อมูลที่จำเป็นต้องกรอก</li>
                <li><strong>รหัสโรงพยาบาล (9 หลักใหม่)</strong> ต้องเป็นรูปแบบ XX1234567 (2 ตัวอักษร + 7 ตัวเลข)</li>
                <li>กรอกข้อมูลให้ครบถ้วนเพื่อความสะดวกในการค้นหาและรายงาน</li>
                <li>ตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Hospital Form -->
      <HospitalForm
        hospital={null}
        {loading}
        {errors}
        {dropdownOptions}
        on:submit={handleSubmit}
        on:cancel={handleCancel}
      />
    {/if}
  </div>
</div>