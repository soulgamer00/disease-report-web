<!-- src/routes/hospitals/[code]/+page.svelte -->
<!-- ✅ Hospital detail page with complete type safety -->
<!-- Display hospital information with edit/delete actions -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { hospitalAPI, getHospitalLocation, getHospitalStatusDisplay } from '$lib/api/hospital.api';
  import { userStore } from '$lib/stores/user.store';
  import dayjs from 'dayjs';
  import type { 
    HospitalInfo,
    HospitalDetailResponse 
  } from '$lib/types/hospital.types';
  import type { UserInfo } from '$lib/types/auth.types';

  // ============================================
  // PAGE STATE
  // ============================================
  
  let hospital: HospitalInfo | null = null;
  let loading = false;
  let error: string | null = null;
  let hospitalCode: string;

  // User state
  let currentUser: UserInfo | null = null;
  let userState: { user: UserInfo | null; isAuthenticated: boolean } = { 
    user: null, 
    isAuthenticated: false 
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
  $: isAdmin = currentUser?.userRoleId === 2;
  $: canEdit = isSuperadmin; // Only superadmin can edit hospitals
  $: canDelete = isSuperadmin; // Only superadmin can delete hospitals

  // Auto-load when hospitalCode changes
  $: if (hospitalCode) {
    loadHospital();
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

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  function handleEdit(): void {
    if (hospital && canEdit) {
      goto(`/hospitals/${hospital.hospitalCode9eDigit}/edit`);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!hospital || !canDelete) {
      return;
    }

    const confirmMessage = `คุณแน่ใจหรือไม่ที่จะลบโรงพยาบาล "${hospital.hospitalName}"?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      loading = true;
      await hospitalAPI.delete(hospital.id);
      
      // Success - redirect to hospital list
      goto('/hospitals', { replaceState: true });
      
    } catch (err) {
      console.error('Failed to delete hospital:', err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'เกิดข้อผิดพลาดในการลบโรงพยาบาล';
        
      alert(errorMessage);
    } finally {
      loading = false;
    }
  }

  function handleBack(): void {
    goto('/hospitals');
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  function formatDate(dateString: string): string {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  }

  function getDisplayCode(hospital: HospitalInfo): string {
    return hospital.hospitalCode9eDigit || hospital.hospitalCode9Digit || 'N/A';
  }

  function getContactInfo(hospital: HospitalInfo): Array<{ label: string; value: string; type?: string }> {
    const contacts: Array<{ label: string; value: string; type?: string }> = [];
    
    if (hospital.phoneNumber) {
      contacts.push({ 
        label: 'โทรศัพท์', 
        value: hospital.phoneNumber, 
        type: 'tel' 
      });
    }
    
    if (hospital.faxNumber) {
      contacts.push({ 
        label: 'แฟกซ์', 
        value: hospital.faxNumber, 
        type: 'tel' 
      });
    }
    
    if (hospital.email) {
      contacts.push({ 
        label: 'อีเมล', 
        value: hospital.email, 
        type: 'email' 
      });
    }
    
    if (hospital.website) {
      contacts.push({ 
        label: 'เว็บไซต์', 
        value: hospital.website, 
        type: 'url' 
      });
    }
    
    return contacts;
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(() => {
    // Hospital will auto-load via reactive statement
  });
</script>

<!-- ============================================ -->
<!-- PAGE HEAD -->
<!-- ============================================ -->

<svelte:head>
  {#if hospital}
    <title>{hospital.hospitalName} - ระบบรายงานโรค</title>
    <meta name="description" content="ข้อมูลโรงพยาบาล {hospital.hospitalName} รหัส {getDisplayCode(hospital)}" />
  {:else}
    <title>รายละเอียดโรงพยาบาล - ระบบรายงานโรค</title>
  {/if}
</svelte:head>

<!-- ============================================ -->
<!-- MAIN CONTENT -->
<!-- ============================================ -->

<div class="min-h-screen bg-gray-50">
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    
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
        <li>
          <div class="flex items-center">
            <svg class="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">
              {hospital?.hospitalName || hospitalCode}
            </span>
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
            <div class="mt-4">
              <button
                type="button"
                on:click={loadHospital}
                class="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        </div>
      </div>

    <!-- Hospital Content -->
    {:else if hospital}
      <!-- Page Header -->
      <div class="mb-8">
        <div class="sm:flex sm:items-start sm:justify-between">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl font-bold text-gray-900">
              {hospital.hospitalName}
            </h1>
            <div class="mt-2 flex items-center space-x-4">
              <span class="text-sm text-gray-500 font-mono">
                รหัส: {getDisplayCode(hospital)}
              </span>
              {#snippet statusSnippet(isActive: boolean)}
                {@const status = getHospitalStatusDisplay(isActive)}
                <span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {status.class}">
                  {status.text}
                </span>
              {/snippet}
              {@render statusSnippet(hospital.isActive)}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex space-x-3 sm:mt-0">
            <button
              type="button"
              on:click={handleBack}
              class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับ
            </button>

            {#if canEdit}
              <button
                type="button"
                on:click={handleEdit}
                class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                แก้ไข
              </button>
            {/if}

            {#if canDelete}
              <button
                type="button"
                on:click={handleDelete}
                class="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                disabled={loading}
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ลบ
              </button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Hospital Information Grid -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        <!-- Basic Information Card -->
        <div class="lg:col-span-2">
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลพื้นฐาน</h3>
            
            <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Hospital Name -->
              <div>
                <dt class="text-sm font-medium text-gray-500">ชื่อโรงพยาบาล</dt>
                <dd class="mt-1 text-sm text-gray-900">{hospital.hospitalName}</dd>
              </div>

              <!-- Hospital Codes -->
              <div>
                <dt class="text-sm font-medium text-gray-500">รหัสโรงพยาบาล (9 หลักใหม่)</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{hospital.hospitalCode9eDigit}</dd>
              </div>

              {#if hospital.hospitalCode9Digit}
                <div>
                  <dt class="text-sm font-medium text-gray-500">รหัสโรงพยาบาล (9 หลักเก่า)</dt>
                  <dd class="mt-1 text-sm text-gray-900 font-mono">{hospital.hospitalCode9Digit}</dd>
                </div>
              {/if}

              {#if hospital.hospitalCode5Digit}
                <div>
                  <dt class="text-sm font-medium text-gray-500">รหัสโรงพยาบาล (5 หลัก)</dt>
                  <dd class="mt-1 text-sm text-gray-900 font-mono">{hospital.hospitalCode5Digit}</dd>
                </div>
              {/if}

              <!-- Organization Details -->
              {#if hospital.organizationType}
                <div>
                  <dt class="text-sm font-medium text-gray-500">ประเภทองค์กร</dt>
                  <dd class="mt-1 text-sm text-gray-900">{hospital.organizationType}</dd>
                </div>
              {/if}

              {#if hospital.healthServiceType}
                <div>
                  <dt class="text-sm font-medium text-gray-500">ประเภทบริการสุขภาพ</dt>
                  <dd class="mt-1 text-sm text-gray-900">{hospital.healthServiceType}</dd>
                </div>
              {/if}

              {#if hospital.affiliation}
                <div>
                  <dt class="text-sm font-medium text-gray-500">สังกัด</dt>
                  <dd class="mt-1 text-sm text-gray-900">{hospital.affiliation}</dd>
                </div>
              {/if}

              {#if hospital.departmentDivision}
                <div>
                  <dt class="text-sm font-medium text-gray-500">กรม/กอง</dt>
                  <dd class="mt-1 text-sm text-gray-900">{hospital.departmentDivision}</dd>
                </div>
              {/if}

              {#if hospital.subDepartment}
                <div>
                  <dt class="text-sm font-medium text-gray-500">แผนก/หน่วยงานย่อย</dt>
                  <dd class="mt-1 text-sm text-gray-900">{hospital.subDepartment}</dd>
                </div>
              {/if}

              {#if hospital.directorName}
                <div>
                  <dt class="text-sm font-medium text-gray-500">ผู้อำนวยการ</dt>
                  <dd class="mt-1 text-sm text-gray-900">{hospital.directorName}</dd>
                </div>
              {/if}
            </dl>
          </div>
        </div>

        <!-- Contact & Location Card -->
        <div class="space-y-6">
          <!-- Contact Information -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลติดต่อ</h3>
            
            {#if getContactInfo(hospital).length > 0}
              <dl class="space-y-3">
                {#each getContactInfo(hospital) as contact}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">{contact.label}</dt>
                    <dd class="mt-1">
                      {#if contact.type === 'email'}
                        <a href="mailto:{contact.value}" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                          {contact.value}
                        </a>
                      {:else if contact.type === 'url'}
                        <a href={contact.value} target="_blank" rel="noopener noreferrer" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                          {contact.value}
                        </a>
                      {:else if contact.type === 'tel'}
                        <a href="tel:{contact.value}" class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                          {contact.value}
                        </a>
                      {:else}
                        <span class="text-sm text-gray-900">{contact.value}</span>
                      {/if}
                    </dd>
                  </div>
                {/each}
              </dl>
            {:else}
              <p class="text-sm text-gray-500">ไม่มีข้อมูลการติดต่อ</p>
            {/if}
          </div>

          <!-- Location Information -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-medium text-gray-900 mb-4">ที่อยู่</h3>
            
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">ที่อยู่เต็ม</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {getHospitalLocation(hospital)}
                </dd>
              </div>

              {#if hospital.postalCode}
                <div>
                  <dt class="text-sm font-medium text-gray-500">รหัสไปรษณีย์</dt>
                  <dd class="mt-1 text-sm text-gray-900 font-mono">{hospital.postalCode}</dd>
                </div>
              {/if}
            </dl>
          </div>

          <!-- System Information -->
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลระบบ</h3>
            
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">วันที่สร้าง</dt>
                <dd class="mt-1 text-sm text-gray-900">{formatDate(hospital.createdAt)}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">อัปเดตล่าสุด</dt>
                <dd class="mt-1 text-sm text-gray-900">{formatDate(hospital.updatedAt)}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">รหัสระบบ</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{hospital.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

    <!-- No Hospital Found -->
    {:else}
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่พบโรงพยาบาล</h3>
        <p class="mt-1 text-sm text-gray-500">ไม่พบข้อมูลโรงพยาบาลที่ระบุ</p>
        <div class="mt-6">
          <button
            type="button"
            on:click={handleBack}
            class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            กลับไปรายการโรงพยาบาล
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>