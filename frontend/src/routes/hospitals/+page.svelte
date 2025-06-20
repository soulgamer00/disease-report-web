<!-- src/routes/hospitals/+page.svelte -->
<!-- ✅ Hospital list page with search, filter, and pagination -->
<!-- Pure client-side implementation - no SSR -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { hospitalAPI, getHospitalDropdownOptions } from '$lib/api/hospital.api';
  import HospitalTable from '$lib/components/hospitals/HospitalTable.svelte';
  import HospitalFilters from '$lib/components/hospitals/HospitalFilters.svelte';
  import type { 
    HospitalInfo, 
    HospitalFilters as HospitalFiltersType,
    HospitalDropdownOptions,
    HospitalQueryParams 
  } from '$lib/types/hospital.types';

  // ============================================
  // PAGE STATE
  // ============================================
  
  let hospitals: HospitalInfo[] = [];
  let loading = false;
  let error: string | null = null;
  let currentUser: any = null; // Will get from auth store

  // Pagination state
  let currentPage = 1;
  let totalPages = 1;
  let totalCount = 0;
  let pageSize = 20;
  let hasNextPage = false;
  let hasPrevPage = false;

  // Filter state
  let filters: HospitalFiltersType = {
    search: '',
    organizationType: '',
    healthServiceType: '',
    affiliation: '',
    province: '',
    isActive: null
  };

  // Sort state
  let currentSort: { field: keyof HospitalInfo; direction: 'asc' | 'desc' } = {
    field: 'hospitalName',
    direction: 'asc'
  };

  // Dropdown options for filters
  let dropdownOptions: HospitalDropdownOptions = {
    organizationTypes: [],
    healthServiceTypes: [],
    affiliations: [],
    provinces: []
  };

  // ============================================
  // REACTIVE STATEMENTS
  // ============================================
  
  // Get query params from URL
  $: urlParams = $page.url.searchParams;
  
  // Update filters from URL params on page load
  $: if (urlParams) {
    updateFiltersFromURL();
  }

  // Check user permissions
  $: isSuperadmin = currentUser?.userRoleId === 1;
  $: canDelete = isSuperadmin;
  
  // Debug logging
  $: if (currentUser) {
    console.log('🔍 Current User:', currentUser);
    console.log('🔍 User Role ID:', currentUser.userRoleId);
    console.log('🔍 Is Superadmin:', isSuperadmin);
  }

  // ============================================
  // DATA LOADING
  // ============================================
  
  async function loadHospitals() {
    if (loading) return;
    
    try {
      loading = true;
      error = null;

      const queryParams: HospitalQueryParams = {
        page: currentPage,
        limit: pageSize,
        sortBy: currentSort.field,
        sortOrder: currentSort.direction,
        ...filters,
        // Convert null to undefined for API compatibility
        isActive: filters.isActive === null ? undefined : filters.isActive
      };

      // Remove empty values
      Object.keys(queryParams).forEach(key => {
        const value = queryParams[key as keyof HospitalQueryParams];
        if (value === '' || value === null || value === undefined) {
          delete queryParams[key as keyof HospitalQueryParams];
        }
      });

      const response = await hospitalAPI.getList(queryParams);
      
      if (response.success && response.data) {
        hospitals = response.data.hospitals;
        currentPage = response.data.pagination.currentPage;
        totalPages = response.data.pagination.totalPages;
        totalCount = response.data.pagination.totalCount;
        pageSize = response.data.pagination.pageSize;
        hasNextPage = response.data.pagination.hasNextPage;
        hasPrevPage = response.data.pagination.hasPrevPage;
      } else {
        throw new Error(response.message || 'Failed to load hospitals');
      }

    } catch (err) {
      console.error('Failed to load hospitals:', err);
      error = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลโรงพยาบาล';
      hospitals = [];
    } finally {
      loading = false;
    }
  }

  async function loadDropdownOptions() {
    try {
      // Mock dropdown options - in real app, these would come from API
      dropdownOptions = {
        organizationTypes: [
          { value: 'government', label: 'หน่วยงานรัฐ' },
          { value: 'private', label: 'เอกชน' },
          { value: 'foundation', label: 'มูลนิธิ' },
          { value: 'university', label: 'มหาวิทยาลัย' }
        ],
        healthServiceTypes: [
          { value: 'hospital', label: 'โรงพยาบาล' },
          { value: 'clinic', label: 'คลินิก' },
          { value: 'health_center', label: 'ศูนย์สุขภาพ' },
          { value: 'specialized', label: 'โรงพยาบาลเฉพาะทาง' }
        ],
        affiliations: [
          { value: 'moph', label: 'กระทรวงสาธารณสุข' },
          { value: 'university', label: 'มหาวิทยาลัย' },
          { value: 'military', label: 'กองทัพ' },
          { value: 'police', label: 'ตำรวจ' },
          { value: 'private', label: 'เอกชน' }
        ],
        provinces: [
          { value: 'bangkok', label: 'กรุงเทพมหานคร' },
          { value: 'chiang_mai', label: 'เชียงใหม่' },
          { value: 'khon_kaen', label: 'ขอนแก่น' },
          { value: 'songkhla', label: 'สงขลา' },
          { value: 'phitsanulok', label: 'พิษณุโลก' }
        ]
      };
    } catch (err) {
      console.error('Failed to load dropdown options:', err);
    }
  }

  // ============================================
  // URL MANAGEMENT
  // ============================================
  
  function updateFiltersFromURL() {
    if (!urlParams) return;

    filters = {
      search: urlParams.get('search') || '',
      organizationType: urlParams.get('organizationType') || '',
      healthServiceType: urlParams.get('healthServiceType') || '',
      affiliation: urlParams.get('affiliation') || '',
      province: urlParams.get('province') || '',
      isActive: urlParams.get('isActive') ? urlParams.get('isActive') === 'true' : null
    };

    currentPage = parseInt(urlParams.get('page') || '1');
    const sortBy = urlParams.get('sortBy') as keyof HospitalInfo;
    const sortOrder = urlParams.get('sortOrder') as 'asc' | 'desc';
    
    if (sortBy && sortOrder) {
      currentSort = { field: sortBy, direction: sortOrder };
    }
  }

  function updateURL() {
    const url = new URL($page.url);
    
    // Update search params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null) {
        url.searchParams.set(key, String(value));
      } else {
        url.searchParams.delete(key);
      }
    });

    // Update pagination and sorting
    if (currentPage > 1) {
      url.searchParams.set('page', String(currentPage));
    } else {
      url.searchParams.delete('page');
    }

    url.searchParams.set('sortBy', currentSort.field);
    url.searchParams.set('sortOrder', currentSort.direction);

    // Update URL without triggering navigation
    goto(url.toString(), { replaceState: true });
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  function handleFilter(event: CustomEvent<HospitalFiltersType>) {
    filters = event.detail;
    currentPage = 1; // Reset to first page when filtering
    updateURL();
    loadHospitals();
  }

  function handleResetFilters() {
    filters = {
      search: '',
      organizationType: '',
      healthServiceType: '',
      affiliation: '',
      province: '',
      isActive: null
    };
    currentPage = 1;
    updateURL();
    loadHospitals();
  }

  function handleSort(event: CustomEvent<{ field: keyof HospitalInfo; direction: 'asc' | 'desc' }>) {
    currentSort = event.detail;
    updateURL();
    loadHospitals();
  }

  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
      updateURL();
      loadHospitals();
    }
  }

  async function handleDelete(event: CustomEvent<{ hospital: HospitalInfo }>) {
    const hospital = event.detail.hospital;
    
    if (!canDelete) {
      alert('คุณไม่มีสิทธิ์ลบโรงพยาบาล');
      return;
    }

    try {
      loading = true;
      await hospitalAPI.delete(hospital.id);
      
      // Refresh the list
      await loadHospitals();
      
    } catch (err) {
      console.error('Failed to delete hospital:', err);
      alert('เกิดข้อผิดพลาดในการลบโรงพยาบาล');
    } finally {
      loading = false;
    }
  }

  function handleCreateNew() {
    goto('/hospitals/create');
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  
  onMount(async () => {
    // Load current user from auth store
    // currentUser = get(authStore).user;
    
    await Promise.all([
      loadDropdownOptions(),
      loadHospitals()
    ]);
  });
</script>

<!-- ============================================ -->
<!-- PAGE HEAD -->
<!-- ============================================ -->

<svelte:head>
  <title>จัดการโรงพยาบาล - ระบบรายงานโรค</title>
  <meta name="description" content="จัดการข้อมูลโรงพยาบาล ค้นหา กรอง และแก้ไขข้อมูลโรงพยาบาล" />
</svelte:head>

<!-- ============================================ -->
<!-- MAIN CONTENT -->
<!-- ============================================ -->

<div class="min-h-screen bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    
    <!-- Page Header -->
    <div class="mb-8">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">จัดการโรงพยาบาล</h1>
          <p class="mt-2 text-sm text-gray-700">
            ค้นหา กรอง และจัดการข้อมูลโรงพยาบาลในระบบ
          </p>
        </div>
        
        <!-- Create Button -->
        <!-- Debug: Show button for testing -->
        <div class="mt-4 sm:mt-0">
          <div class="mb-2 text-xs text-gray-500">
            Debug: User Role = {currentUser?.userRoleId || 'undefined'}, 
            Superadmin = {isSuperadmin ? 'true' : 'false'}
          </div>
          
          <!-- Show button for testing (remove isSuperadmin check temporarily) -->
          <button
            type="button"
            on:click={handleCreateNew}
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            เพิ่มโรงพยาบาล
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div class="rounded-lg bg-white p-4 shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">ทั้งหมด</div>
              <div class="text-2xl font-bold text-gray-900">{(totalCount || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-4 shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">เปิดใช้งาน</div>
              <div class="text-2xl font-bold text-gray-900">{hospitals.filter(h => h.isActive).length}</div>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-4 shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">ปิดใช้งาน</div>
              <div class="text-2xl font-bold text-gray-900">{hospitals.filter(h => !h.isActive).length}</div>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-4 shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
              </svg>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">หน้าปัจจุบัน</div>
              <div class="text-2xl font-bold text-gray-900">{currentPage}/{totalPages || 1}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="mb-6 rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
            <p class="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Filters -->
    <div class="mb-6">
      <HospitalFilters
        bind:filters
        {loading}
        {dropdownOptions}
        on:filter={handleFilter}
        on:reset={handleResetFilters}
      />
    </div>

    <!-- Hospital Table -->
    <div class="mb-6">
      <HospitalTable
        {hospitals}
        {loading}
        {currentSort}
        showActions={true}
        showDeleteAction={canDelete}
        on:sort={handleSort}
        on:delete={handleDelete}
      />
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div class="flex flex-1 justify-between sm:hidden">
          <!-- Mobile Pagination -->
          <button
            type="button"
            on:click={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevPage || loading}
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ก่อนหน้า
          </button>
          <button
            type="button"
            on:click={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || loading}
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถัดไป
          </button>
        </div>
        
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <!-- Desktop Pagination Info -->
          <div>
            <p class="text-sm text-gray-700">
              แสดง <span class="font-medium">{Math.max((currentPage - 1) * pageSize + 1, 0)}</span>
              ถึง <span class="font-medium">{Math.min(currentPage * pageSize, totalCount || 0)}</span>
              จาก <span class="font-medium">{(totalCount || 0).toLocaleString()}</span> โรงพยาบาล
            </p>
          </div>
          
          <!-- Desktop Pagination Controls -->
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <!-- Previous Button -->
              <button
                type="button"
                on:click={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage || loading}
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">ก่อนหน้า</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Page Numbers -->
              {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                return startPage + i;
              }) as pageNum}
                {#if pageNum <= totalPages}
                  <button
                    type="button"
                    on:click={() => handlePageChange(pageNum)}
                    disabled={loading}
                    class="relative inline-flex items-center px-4 py-2 text-sm font-semibold {pageNum === currentPage 
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'} disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pageNum}
                  </button>
                {/if}
              {/each}

              <!-- Next Button -->
              <button
                type="button"
                on:click={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage || loading}
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">ถัดไป</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>