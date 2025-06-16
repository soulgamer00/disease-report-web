<!-- src/routes/admin/hospitals/+page.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  // ============================================
  // TYPES
  // ============================================

  interface Hospital {
    id: string;
    hospitalName: string;
    hospitalCode9eDigit: string;
    hospitalCode9Digit: string | null;  // ✅ แก้ไข: เอา ? ออก เพื่อให้ตรงกับ backend
    hospitalCode5Digit: string | null;  // ✅ แก้ไข: เอา ? ออก เพื่อให้ตรงกับ backend
    organizationType: string | null;    // ✅ แก้ไข: เอา ? ออก เพื่อให้ตรงกับ backend
    healthServiceType: string | null;   // ✅ แก้ไข: เอา ? ออก เพื่อให้ตรงกับ backend
    affiliation: string | null;         // ✅ แก้ไข: เอา ? ออก เพื่อให้ตรงกับ backend
    departmentDivision: string | null;  // ✅ แก้ไข: เอา ? ออก เพื่อให้ตรงกับ backend
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
      patientVisits: number;
      populations: number;
      users: number;
    };
  }

  interface PageData {
    hospitals: Hospital[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    currentQuery: {
      page?: number;
      limit?: number;
      search?: string;
      organizationType?: string;
      healthServiceType?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      isActive?: boolean;
    };
    user: {
      id: string;
      username: string;
      name: string;
      userRoleId: number;
      userRole: string;
      hospitalCode9eDigit: string | null;
      isActive: boolean;
    };
    success: boolean;
    message: string;
  }

  // ============================================
  // PROPS & DATA
  // ============================================

  let { data }: { data: PageData } = $props();

  // ============================================
  // REACTIVE STATE (using $state for SvelteKit 5)
  // ============================================

  let isLoading = $state(false);
  let searchQuery = $state('');
  let selectedOrganizationType = $state('');
  let selectedHealthServiceType = $state('');
  let currentSort = $state(data.currentQuery.sortBy || 'hospitalName');
  let currentSortOrder = $state(data.currentQuery.sortOrder || 'asc');

  // ============================================
  // COMPUTED VALUES (using $derived for SvelteKit 5)
  // ============================================

  const currentPage = $derived(data.pagination.page);
  const totalPages = $derived(data.pagination.totalPages);
  const totalRecords = $derived(data.pagination.total);
  const hasNextPage = $derived(data.pagination.hasNext);
  const hasPrevPage = $derived(data.pagination.hasPrev);

  // Check user permissions
  const canCreateHospital = $derived(data.user?.userRoleId === 1); // SuperAdmin only
  const canEditHospital = $derived(data.user?.userRoleId <= 2); // Admin or SuperAdmin
  const canDeleteHospital = $derived(data.user?.userRoleId === 1); // SuperAdmin only
  const canExportData = $derived(data.user?.userRoleId <= 2); // Admin or SuperAdmin

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Format date for display in Thai format
   */
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = (date.getFullYear() + 543).toString(); // Convert to Buddhist Era
      return `${day}/${month}/${year}`;
    } catch {
      return '-';
    }
  }

  /**
   * Get organization type display name
   */
  function getOrganizationTypeDisplay(type: string | null): string {
    if (!type) return '-';
    
    const types: Record<string, string> = {
      'กรมอนามัย': 'กรมอนามัย',
      'โรงพยาบาลทั่วไป': 'โรงพยาบาลทั่วไป',
      'โรงพยาบาลชุมชน': 'โรงพยาบาลชุมชน',
      'สถานีอนามัย': 'สถานีอนามัย',
      'ศูนย์สุขภาพชุมชน': 'ศูนย์สุขภาพชุมชน',
    };
    
    return types[type] || type;
  }

  /**
   * Get health service type display name
   */
  function getHealthServiceTypeDisplay(type: string | null): string {
    if (!type) return '-';
    
    const types: Record<string, string> = {
      'ปฐมภูมิ': 'ปฐมภูมิ',
      'ทุติยภูมิ': 'ทุติยภูมิ',
      'ตติยภูมิ': 'ตติยภูมิ',
    };
    
    return types[type] || type;
  }

  /**
   * Build search query parameters
   */
  function buildSearchParams(): Record<string, any> {
    const params: Record<string, any> = {
      page: 1, // Reset to first page on new search
      limit: data.currentQuery.limit || 20,
      sortBy: currentSort,
      sortOrder: currentSortOrder,
      isActive: true
    };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedOrganizationType) params.organizationType = selectedOrganizationType;
    if (selectedHealthServiceType) params.healthServiceType = selectedHealthServiceType;

    return params;
  }

  /**
   * Navigate to new page with search parameters
   */
  function navigateWithParams(params: Record<string, any>): void {
    if (!browser) return;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    goto(`/admin/hospitals?${searchParams.toString()}`, { replaceState: false });
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle search form submission
   */
  function handleSearch(event: SubmitEvent): void {
    event.preventDefault();
    const params = buildSearchParams();
    navigateWithParams(params);
  }

  /**
   * Handle clear all filters
   */
  function handleClearFilters(): void {
    searchQuery = '';
    selectedOrganizationType = '';
    selectedHealthServiceType = '';

    navigateWithParams({
      page: 1,
      limit: data.currentQuery.limit || 20,
      sortBy: currentSort,
      sortOrder: currentSortOrder,
      isActive: true
    });
  }

  /**
   * Handle pagination
   */
  function handlePageChange(newPage: number): void {
    const params = {
      ...buildSearchParams(),
      page: newPage
    };
    navigateWithParams(params);
  }

  /**
   * Handle sorting
   */
  function handleSort(column: string): void {
    let newSortOrder: 'asc' | 'desc' = 'asc';
    
    if (currentSort === column) {
      newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    }

    currentSort = column;
    currentSortOrder = newSortOrder;

    const params = {
      ...buildSearchParams(),
      sortBy: column,
      sortOrder: newSortOrder
    };
    navigateWithParams(params);
  }

  /**
   * Handle hospital detail view
   */
  function handleViewHospital(hospitalId: string): void {
    goto(`/admin/hospitals/${hospitalId}`);
  }

  /**
   * Handle hospital edit
   */
  function handleEditHospital(hospitalId: string): void {
    goto(`/admin/hospitals/${hospitalId}/edit`);
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  onMount(() => {
    // Initialize form values from current query
    const query = data.currentQuery;
    
    searchQuery = query.search || '';
    selectedOrganizationType = query.organizationType || '';
    selectedHealthServiceType = query.healthServiceType || '';
  });
</script>

<!-- ============================================ -->
<!-- PAGE TITLE -->
<!-- ============================================ -->

<svelte:head>
  <title>จัดการโรงพยาบาล - ระบบรายงานโรค</title>
  <meta name="description" content="จัดการข้อมูลโรงพยาบาลในระบบ" />
</svelte:head>

<!-- ============================================ -->
<!-- MAIN CONTENT -->
<!-- ============================================ -->

<div class="min-h-screen bg-gray-50">

  <!-- Page Header with Actions -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <!-- Breadcrumb/Page Info -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900">จัดการโรงพยาบาล</h2>
            <p class="text-sm text-gray-600 mt-1">
              แสดงผลลัพธ์ {((currentPage - 1) * (data.currentQuery.limit || 20)) + 1} - {Math.min(currentPage * (data.currentQuery.limit || 20), totalRecords)} 
              จากทั้งหมด {totalRecords.toLocaleString()} โรงพยาบาล
            </p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center space-x-3">
          {#if canExportData}
            <button
              type="button"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              disabled={isLoading || data.hospitals.length === 0}
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ส่งออก Excel
            </button>
          {/if}
          
          {#if canCreateHospital}
            <button
              type="button"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              onclick={() => goto('/admin/hospitals/create')}
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              เพิ่มโรงพยาบาล
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Search and Filters -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <form onsubmit={handleSearch} class="space-y-4">
        
        <!-- Search Row -->
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
              ค้นหา
            </label>
            <input
              id="search"
              type="text"
              placeholder="ค้นหาด้วยชื่อโรงพยาบาล หรือรหัส"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              bind:value={searchQuery}
            />
          </div>
          
          <div class="flex gap-2">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              ค้นหา
            </button>
            
            <button
              type="button"
              class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              onclick={handleClearFilters}
              disabled={isLoading}
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Organization Type Filter -->
          <div>
            <label for="organizationType" class="block text-sm font-medium text-gray-700 mb-2">
              ประเภทหน่วยงาน
            </label>
            <select
              id="organizationType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              bind:value={selectedOrganizationType}
            >
              <option value="">ทั้งหมด</option>
              <option value="รัฐบาล">รัฐบาล</option>
              <option value="เอกชน">เอกชน</option>
              <option value="กรมอนามัย">กรมอนามัย</option>
              <option value="โรงพยาบาลทั่วไป">โรงพยาบาลทั่วไป</option>
              <option value="โรงพยาบาลชุมชน">โรงพยาบาลชุมชน</option>
              <option value="สถานีอนามัย">สถานีอนามัย</option>
              <option value="ศูนย์สุขภาพชุมชน">ศูนย์สุขภาพชุมชน</option>
            </select>
          </div>

          <!-- Health Service Type Filter -->
          <div>
            <label for="healthServiceType" class="block text-sm font-medium text-gray-700 mb-2">
              ระดับการให้บริการ
            </label>
            <select
              id="healthServiceType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              bind:value={selectedHealthServiceType}
            >
              <option value="">ทั้งหมด</option>
              <option value="สำนักงานสาธารณสุขอำเภอ">สำนักงานสาธารณสุขอำเภอ</option>
              <option value="โรงพยาบาลทั่วไป">โรงพยาบาลทั่วไป</option>
              <option value="โรงพยาบาลส่งเสริมสุขภาพตำบล">โรงพยาบาลส่งเสริมสุขภาพตำบล</option>
              <option value="ศูนย์บริการสาธารณสุข อปท.">ศูนย์บริการสาธารณสุข อปท.</option>
              <option value="ปฐมภูมิ">ปฐมภูมิ</option>
              <option value="ทุติยภูมิ">ทุติยภูมิ</option>
              <option value="ตติยภูมิ">ตติยภูมิ</option>
            </select>
          </div>

        </div>

      </form>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ลำดับ
              </th>
              
              <!-- Sortable: Hospital Name -->
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onclick={() => handleSort('hospitalName')}>
                <div class="flex items-center">
                  ชื่อโรงพยาบาล
                  {#if currentSort === 'hospitalName'}
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {#if currentSortOrder === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      {/if}
                    </svg>
                  {/if}
                </div>
              </th>

              <!-- Sortable: Hospital Code -->
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onclick={() => handleSort('hospitalCode9eDigit')}>
                <div class="flex items-center">
                  รหัสโรงพยาบาล
                  {#if currentSort === 'hospitalCode9eDigit'}
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {#if currentSortOrder === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      {/if}
                    </svg>
                  {/if}
                </div>
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ประเภท/ระดับบริการ
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถิติ
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>

              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          
          <tbody class="bg-white divide-y divide-gray-200">
            {#each data.hospitals as hospital, index}
              <tr class="hover:bg-gray-50 transition-colors duration-150">
                
                <!-- Row Number -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {((currentPage - 1) * (data.currentQuery.limit || 20)) + index + 1}
                </td>

                <!-- Hospital Name -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {hospital.hospitalName}
                  </div>
                  {#if hospital.affiliation}
                    <div class="text-sm text-gray-500">
                      {hospital.affiliation}
                    </div>
                  {/if}
                </td>

                <!-- Hospital Code -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {hospital.hospitalCode9eDigit}
                  </div>
                  {#if hospital.hospitalCode5Digit}
                    <div class="text-sm text-gray-500">
                      รหัส 5 หลัก: {hospital.hospitalCode5Digit}
                    </div>
                  {/if}
                </td>

                <!-- Type/Service Level -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {getOrganizationTypeDisplay(hospital.organizationType)}
                  </div>
                  <div class="text-sm text-gray-500">
                    {getHealthServiceTypeDisplay(hospital.healthServiceType)}
                  </div>
                </td>

                <!-- Statistics -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {#if hospital._count}
                    <div>ผู้ป่วย: {hospital._count.patientVisits.toLocaleString()}</div>
                    <div>ประชากร: {hospital._count.populations.toLocaleString()}</div>
                    <div>ผู้ใช้: {hospital._count.users.toLocaleString()}</div>
                  {:else}
                    <div>-</div>
                  {/if}
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  {#if hospital.isActive}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ใช้งาน
                    </span>
                  {:else}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ปิดใช้งาน
                    </span>
                  {/if}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      type="button"
                      class="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                      title="ดูรายละเอียด"
                      aria-label="ดูรายละเอียดโรงพยาบาล"
                      onclick={() => handleViewHospital(hospital.id)}
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {#if canEditHospital}
                      <button
                        type="button"
                        class="text-green-600 hover:text-green-900 transition-colors duration-150"
                        title="แก้ไข"
                        aria-label="แก้ไขข้อมูลโรงพยาบาล"
                        onclick={() => handleEditHospital(hospital.id)}
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    {/if}
                  </div>
                </td>

              </tr>
            {:else}
              <tr>
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p class="text-lg font-medium">ไม่พบข้อมูลโรงพยาบาล</p>
                    <p class="text-sm mt-1">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองของคุณ</p>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div class="flex justify-between items-center w-full">
            
            <!-- Previous Button -->
            <button
              type="button"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              disabled={!hasPrevPage || isLoading}
              onclick={() => handlePageChange(currentPage - 1)}
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              ก่อนหน้า
            </button>

            <!-- Page Numbers -->
            <div class="hidden md:flex space-x-2">
              {#each Array.from({length: Math.min(totalPages, 7)}, (_, i) => {
                const start = Math.max(1, currentPage - 3);
                const end = Math.min(totalPages, start + 6);
                return start + i;
              }).filter(page => page <= totalPages) as pageNum}
                <button
                  type="button"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-150 {pageNum === currentPage ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
                  disabled={isLoading}
                  onclick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              {/each}

              {#if totalPages > 7 && currentPage < totalPages - 3}
                <span class="px-4 py-2 text-gray-500">...</span>
                <button
                  type="button"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  disabled={isLoading}
                  onclick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              {/if}
            </div>

            <!-- Mobile Page Info -->
            <div class="md:hidden">
              <span class="text-sm text-gray-700">
                หน้า {currentPage} จาก {totalPages}
              </span>
            </div>

            <!-- Next Button -->
            <button
              type="button"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              disabled={!hasNextPage || isLoading}
              onclick={() => handlePageChange(currentPage + 1)}
            >
              ถัดไป
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>
        </div>
      {/if}

    </div>

  </div>
</div>

<!-- Loading Overlay -->
{#if isLoading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 flex items-center">
      <svg class="animate-spin h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-gray-700">กำลังโหลดข้อมูล...</span>
    </div>
  </div>
{/if}