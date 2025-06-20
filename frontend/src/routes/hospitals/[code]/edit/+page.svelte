<!-- src/routes/hospitals/[code]/edit/+page.svelte -->
<!-- ✅ Hospital edit page with complete type safety -->
<!-- Edit existing hospital information (Superadmin only) -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { hospitalAPI } from '$lib/api/hospital.api';
  import { userStore } from '$lib/stores/user.store';
  import HospitalForm from '$lib/components/hospitals/HospitalForm.svelte';
  import type { 
    HospitalInfo,
    HospitalDetailResponse,
    CreateHospitalRequest,
    UpdateHospitalRequest,
    HospitalDropdownOptions 
  } from '$lib/types/hospital.types';
  import type { UserInfo } from '$lib/types/auth.types';

  // ============================================
  // PAGE STATE
  // ============================================
  
  let hospital: HospitalInfo | null = null;
  let loading = false;
  let loadingUpdate = false;
  let error: string | null = null;
  let errors: Record<string, string> = {};
  let hospitalCode: string;

  // User state
  let currentUser: UserInfo | null = null;
  let userState: { user: UserInfo | null; isAuthenticated: boolean } = { 
    user: null, 
    isAuthenticated: false 
  };

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
  
  // Get hospital code from URL
  $: hospitalCode = $page.params.code;

  // Subscribe to user store
  $: userStore.subscribe((state) => {
    userState = state;
    currentUser = state.user;
  });

  // Check permissions
  $: isSuperadmin = currentUser?.userRoleId === 1;
  $: canEdit = isSuperadmin; // Only superadmin can edit hospitals

  // Auto-load when hospitalCode changes
  $: if (hospitalCode) {
    loadHospital();
  }

  // Redirect if not authorized
  $: if (currentUser && !canEdit) {
    goto(`/hospitals/${hospitalCode}`, { replaceState: true });
  }

  // ============================================
  // DATA LOADING
  // ============================================
  
  async function loadHospital(): Promise<void> {
    if (!hospitalCode || loading) return;
    
    try {
      loading = true;
      error = null;

      const response: HospitalDetailResponse = await hospitalAPI.getByCode(hospitalCode);
      
      if (response.success && response.data?.hospital) {
        hospital = response.data.hospital;
      } else {
        throw new Error(response.message || 'ไม่พบข้อมูลโรงพยาบาล');
      }

    } catch (err) {
      console.error('Failed to load hospital:', err);
      
      if (err instanceof Error) {
        error = err.message;
      } else {
        error = 'เกิดข้อผิดพลาดในการโหลดข้อมูลโรงพยาบาล';
      }
      
      hospital = null;
    } finally {
      loading = false;
    }
  }

  async function loadDropdownOptions(): Promise<void> {
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
  
  async function handleSubmit(event: CustomEvent<CreateHospitalRequest | UpdateHospitalRequest>): Promise<void> {
    if (!hospital || !canEdit) return;
    
    const hospitalData = event.detail;
    
    try {
      loadingUpdate = true;
      errors = {};

      // Validate required permissions
      if (!canEdit) {
        throw new Error('คุณไม่มีสิทธิ์แก้ไขโรงพยาบาล');
      }

      // Submit to API (cast to UpdateHospitalRequest since this is edit page)
      const response = await hospitalAPI.update(hospital.id, hospitalData as UpdateHospitalRequest);
      
      if (response.success) {
        // Success - redirect to hospital detail page
        const updatedHospital = response.data.hospital;
        goto(`/hospitals/${updatedHospital.hospitalCode9eDigit}`, { 
          replaceState: true 
        });
      } else {
        throw new Error(response.message || 'เกิดข้อผิดพลาดในการแก้ไขโรงพยาบาล');
      }

    } catch (err) {
      console.error('Hospital update error:', err);
      
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
      loadingUpdate = false;
    }
  }

  function handleCancel(): void {
    if (hospital) {
      goto(`/hospitals/${hospital.hospitalCode9eDigit}`);
    } else {
      goto('/hospitals');
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(async () => {
    // Load dropdown options
    await loadDropdownOptions();
    // Hospital will auto-load via reactive statement
  });
</script>

<!-- ============================================ -->
<!-- PAGE HEAD -->
<!-- ============================================ -->

<svelte:head>
  {#if hospital}
    <title>แก้ไข {hospital.hospitalName} - ระบบรายงานโรค</title>
    <meta name="description" content="แก้ไขข้อมูลโรงพยาบาล {hospital.hospitalName}" />
  {:else}
    <title>แก้ไขโรงพยาบาล - ระบบรายงานโรค</title>
  {/if}
</svelte:head>

<!-- ============================================ -->
<!-- MAIN CONTENT -->
<!-- ============================================ -->

<div class="min-h-screen bg-gray-50">
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    
    <!-- Breadcrumb -->
    <nav class="flex mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <a href="/hospitals" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
            <svg class="w-3 h-3 mr-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            จัดการโรงพยาบาล
          </a>
        </li>
        {#if hospital}
          <li>
            <div class="flex items-center">
              <svg class="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <a href="/hospitals/{hospital.hospitalCode9eDigit}" class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                {hospital.hospitalName}
              </a>
            </div>
          </li>
        {/if}
        <li>
          <div class="flex items-center">
            <svg class="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">แก้ไข</span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Loading State -->
    {#if loading}
      <div class="flex h-64 items-center justify-center">
        <div class="flex items-center space-x-3">
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span class="text-lg text-gray-600">กำลังโหลดข้อมูลโรงพยาบาล...</span>
        </div>
      </div>

    <!-- Error State -->
    {:else if error}
      <div class="rounded-md bg-red-50 p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
            <p class="mt-1 text-sm text-red-700">{error}</p>
            <div class="mt-4 space-x-3">
              <button
                type="button"
                on:click={loadHospital}
                class="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ลองใหม่
              </button>
              <button
                type="button"
                on:click={handleCancel}
                class="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                กลับ
              </button>
            </div>
          </div>
        </div>
      </div>

    <!-- Edit Form Content -->
    {:else if hospital}
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">แก้ไขข้อมูลโรงพยาบาล</h1>
            <p class="mt-2 text-sm text-gray-700">
              แก้ไขข้อมูล: <span class="font-medium">{hospital.hospitalName}</span>
            </p>
          </div>

          <!-- Back Button -->
          <button
            type="button"
            on:click={handleCancel}
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading || loadingUpdate}
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับ
          </button>
        </div>
      </div>

      <!-- Permission Check -->
      {#if currentUser && !canEdit}
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
                คุณไม่มีสิทธิ์แก้ไขข้อมูลโรงพยาบาล กรุณาติดต่อผู้ดูแลระบบ
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
              <h3 class="text-sm font-medium text-blue-800">คำแนะนำการแก้ไข</h3>
              <div class="mt-2 text-sm text-blue-700">
                <ul class="list-disc list-inside space-y-1">
                  <li>ข้อมูลที่แก้ไขจะส่งผลต่อการรายงานและค้นหา</li>
                  <li>ตรวจสอบความถูกต้องของรหัสโรงพยาบาลก่อนบันทึก</li>
                  <li>หากเปลี่ยนรหัสโรงพยาบาล URL อาจเปลี่ยนแปลง</li>
                  <li>การปิดใช้งานโรงพยาบาลจะทำให้ไม่แสดงในรายงาน</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Hospital Edit Form -->
        <HospitalForm
          {hospital}
          loading={loadingUpdate}
          {errors}
          {dropdownOptions}
          on:submit={handleSubmit}
          on:cancel={handleCancel}
        />
      {/if}

    <!-- No Hospital Found -->
    {:else}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่พบโรงพยาบาล</h3>
        <p class="mt-1 text-sm text-gray-500">ไม่พบข้อมูลโรงพยาบาลที่ต้องการแก้ไข</p>
        <div class="mt-6">
          <button
            type="button"
            on:click={handleCancel}
            class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            กลับไปรายการโรงพยาบาล
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>