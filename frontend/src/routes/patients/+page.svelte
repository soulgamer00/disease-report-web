<!-- src/routes/patients/+page.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import type { PatientVisitQueryParams } from '$lib/types/backend';
  import { 
    GenderEnum, 
    PatientTypeEnum, 
    PatientConditionEnum,
    getThaiGender,
    getThaiPatientType,
    getThaiPatientCondition,
    getThaiNamePrefix
  } from '$lib/types/backend';

  // ============================================
  // PROPS & DATA
  // ============================================

  let { data }: { data: PageData } = $props();

  // ============================================
  // REACTIVE STATE (using $state for SvelteKit 5)
  // ============================================

  let isLoading = $state(false);
  let searchQuery = $state('');
  let selectedGender = $state<GenderEnum | ''>('');
  let selectedPatientType = $state<PatientTypeEnum | ''>('');
  let selectedPatientCondition = $state<PatientConditionEnum | ''>('');
  let selectedDiseaseId = $state('');
  let selectedHospitalCode = $state('');
  let startDate = $state('');
  let endDate = $state('');
  let ageMin = $state('');
  let ageMax = $state('');
  let currentSort = $state(data.currentQuery.sortBy || 'illnessDate');
  let currentSortOrder = $state(data.currentQuery.sortOrder || 'desc');

  // ============================================
  // COMPUTED VALUES (using $derived for SvelteKit 5)
  // ============================================

  const currentPage = $derived(data.pagination.page);
  const totalPages = $derived(data.pagination.totalPages);
  const totalRecords = $derived(data.pagination.total);
  const hasNextPage = $derived(data.pagination.hasNext);
  const hasPrevPage = $derived(data.pagination.hasPrev);

  // Check user permissions
  const canCreatePatient = $derived(data.user?.userRoleId <= 2); // Admin or SuperAdmin
  const canEditPatient = $derived(data.user?.userRoleId <= 2);
  const canDeletePatient = $derived(data.user?.userRoleId <= 2);
  const canExportData = $derived(data.user?.userRoleId <= 3); // All users

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Format date for display in Thai format (simple format without dayjs)
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
   * Format date with time for tooltips
   */
  function formatDateWithTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = (date.getFullYear() + 543).toString();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes} น.`;
    } catch {
      return '-';
    }
  }

  /**
   * Get full name with prefix
   */
  function getFullName(visit: typeof data.patientVisits[0]): string {
    const prefix = getThaiNamePrefix(visit.namePrefix);
    return `${prefix}${visit.fname} ${visit.lname}`;
  }

  /**
   * Calculate age from birth date and illness date
   */
  function formatAge(ageAtIllness: number): string {
    return `${ageAtIllness} ปี`;
  }

  /**
   * Get patient status badge color
   */
  function getPatientConditionClass(condition: PatientConditionEnum): string {
    switch (condition) {
      case PatientConditionEnum.RECOVERED:
        return 'bg-green-100 text-green-800';
      case PatientConditionEnum.DIED:
        return 'bg-red-100 text-red-800';
      case PatientConditionEnum.UNDER_TREATMENT:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Build search query parameters
   */
  function buildSearchParams(): PatientVisitQueryParams {
    const params: PatientVisitQueryParams = {
      page: 1, // Reset to first page on new search
      limit: data.currentQuery.limit || 20,
      sortBy: currentSort,
      sortOrder: currentSortOrder,
      isActive: true
    };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (selectedGender) params.gender = selectedGender;
    if (selectedPatientType) params.patientType = selectedPatientType;
    if (selectedPatientCondition) params.patientCondition = selectedPatientCondition;
    if (selectedDiseaseId) params.diseaseId = selectedDiseaseId;
    if (selectedHospitalCode) params.hospitalCode9eDigit = selectedHospitalCode;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (ageMin && !isNaN(Number(ageMin))) params.ageMin = Number(ageMin);
    if (ageMax && !isNaN(Number(ageMax))) params.ageMax = Number(ageMax);

    return params;
  }

  /**
   * Navigate to new page with search parameters
   */
  function navigateWithParams(params: PatientVisitQueryParams): void {
    if (!browser) return;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value.toString());
      }
    });

    goto(`/patients?${searchParams.toString()}`, { replaceState: false });
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
    selectedGender = '';
    selectedPatientType = '';
    selectedPatientCondition = '';
    selectedDiseaseId = '';
    selectedHospitalCode = '';
    startDate = '';
    endDate = '';
    ageMin = '';
    ageMax = '';

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
    let newSortOrder: 'asc' | 'desc' = 'desc';
    
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
   * Handle patient detail view
   */
  function handleViewPatient(patientId: string): void {
    goto(`/patients/${patientId}`);
  }

  /**
   * Handle patient edit
   */
  function handleEditPatient(patientId: string): void {
    goto(`/patients/${patientId}/edit`);
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  onMount(() => {
    // Initialize form values from current query
    const query = data.currentQuery;
    
    searchQuery = query.search || '';
    selectedGender = (query.gender as GenderEnum) || '';
    selectedPatientType = (query.patientType as PatientTypeEnum) || '';
    selectedPatientCondition = (query.patientCondition as PatientConditionEnum) || '';
    selectedDiseaseId = query.diseaseId || '';
    selectedHospitalCode = query.hospitalCode9eDigit || '';
    startDate = query.startDate || '';
    endDate = query.endDate || '';
    ageMin = query.ageMin?.toString() || '';
    ageMax = query.ageMax?.toString() || '';
  });
</script>

<!-- ============================================ -->
<!-- PAGE TITLE -->
<!-- ============================================ -->

<svelte:head>
  <title>รายการผู้ป่วย - ระบบรายงานโรค</title>
  <meta name="description" content="ข้อมูลการเยี่ยมผู้ป่วยและรายงานโรค" />
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
            <h2 class="text-lg font-semibold text-gray-900">รายการผู้ป่วย</h2>
            <p class="text-sm text-gray-600 mt-1">
              แสดงผลลัพธ์ {((currentPage - 1) * (data.currentQuery.limit || 20)) + 1} - {Math.min(currentPage * (data.currentQuery.limit || 20), totalRecords)} 
              จากทั้งหมด {totalRecords.toLocaleString()} รายการ
            </p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center space-x-3">
          {#if canExportData}
            <button
              type="button"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              disabled={isLoading || data.patientVisits.length === 0}
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ส่งออก Excel
            </button>
          {/if}
          
          {#if canCreatePatient}
            <button
              type="button"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              onclick={() => goto('/patients/create')}
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              เพิ่มข้อมูลผู้ป่วย
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
              placeholder="ค้นหาด้วยชื่อ นามสกุล เลขบัตรประชาชน หรือโรงพยาบาล"
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Gender Filter -->
          <div>
            <label for="gender" class="block text-sm font-medium text-gray-700 mb-2">
              เพศ
            </label>
            <select
              id="gender"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              bind:value={selectedGender}
            >
              <option value="">ทั้งหมด</option>
              <option value={GenderEnum.MALE}>{getThaiGender(GenderEnum.MALE)}</option>
              <option value={GenderEnum.FEMALE}>{getThaiGender(GenderEnum.FEMALE)}</option>
            </select>
          </div>

          <!-- Patient Type Filter -->
          <div>
            <label for="patientType" class="block text-sm font-medium text-gray-700 mb-2">
              ประเภทผู้ป่วย
            </label>
            <select
              id="patientType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              bind:value={selectedPatientType}
            >
              <option value="">ทั้งหมด</option>
              <option value={PatientTypeEnum.IPD}>{getThaiPatientType(PatientTypeEnum.IPD)}</option>
              <option value={PatientTypeEnum.OPD}>{getThaiPatientType(PatientTypeEnum.OPD)}</option>
              <option value={PatientTypeEnum.ACF}>{getThaiPatientType(PatientTypeEnum.ACF)}</option>
            </select>
          </div>

          <!-- Patient Condition Filter -->
          <div>
            <label for="patientCondition" class="block text-sm font-medium text-gray-700 mb-2">
              สถานะผู้ป่วย
            </label>
            <select
              id="patientCondition"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              bind:value={selectedPatientCondition}
            >
              <option value="">ทั้งหมด</option>
              <option value={PatientConditionEnum.RECOVERED}>{getThaiPatientCondition(PatientConditionEnum.RECOVERED)}</option>
              <option value={PatientConditionEnum.UNDER_TREATMENT}>{getThaiPatientCondition(PatientConditionEnum.UNDER_TREATMENT)}</option>
              <option value={PatientConditionEnum.DIED}>{getThaiPatientCondition(PatientConditionEnum.DIED)}</option>
              <option value={PatientConditionEnum.UNKNOWN}>{getThaiPatientCondition(PatientConditionEnum.UNKNOWN)}</option>
            </select>
          </div>

          <!-- Age Range -->
          <div>
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ช่วงอายุ
            </label>
            <div class="flex gap-2">
              <input
                type="number"
                placeholder="ต่ำสุด"
                min="0"
                max="150"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                bind:value={ageMin}
              />
              <input
                type="number"
                placeholder="สูงสุด"
                min="0"
                max="150"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                bind:value={ageMax}
              />
            </div>
          </div>

        </div>

        <!-- Date Range -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
              วันที่เริ่มต้น
            </label>
            <input
              id="startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              bind:value={startDate}
            />
          </div>
          
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">
              วันที่สิ้นสุด
            </label>
            <input
              id="endDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              bind:value={endDate}
            />
          </div>
        </div>

      </form>
    </div>

    <!-- Results Summary and Actions - ย้ายไปไว้ใน page header แล้ว -->
    <div class="flex justify-end items-center mb-4">
      <!-- Actions จะอยู่ใน header แล้ว เหลือแค่พื้นที่ว่าง -->
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
              
              <!-- Sortable: Patient Name -->
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onclick={() => handleSort('fname')}>
                <div class="flex items-center">
                  ชื่อ-นามสกุล
                  {#if currentSort === 'fname'}
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
                เพศ/อายุ
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                โรค
              </th>

              <!-- Sortable: Illness Date -->
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onclick={() => handleSort('illnessDate')}>
                <div class="flex items-center">
                  วันที่ป่วย
                  {#if currentSort === 'illnessDate'}
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
                ประเภท/สถานะ
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                โรงพยาบาล
              </th>

              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          
          <tbody class="bg-white divide-y divide-gray-200">
            {#each data.patientVisits as visit, index}
              <tr class="hover:bg-gray-50 transition-colors duration-150">
                
                <!-- Row Number -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {((currentPage - 1) * (data.currentQuery.limit || 20)) + index + 1}
                </td>

                <!-- Patient Name -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {getFullName(visit)}
                  </div>
                  <div class="text-sm text-gray-500">
                    {visit.idCardCode}
                  </div>
                </td>

                <!-- Gender/Age -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{getThaiGender(visit.gender)}</div>
                  <div>{formatAge(visit.ageAtIllness)}</div>
                </td>

                <!-- Disease -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {visit.disease?.thaiName || '-'}
                  </div>
                  <div class="text-sm text-gray-500">
                    {visit.disease?.shortName || '-'}
                  </div>
                </td>

                <!-- Illness Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div title={formatDateWithTime(visit.illnessDate)}>
                    {formatDate(visit.illnessDate)}
                  </div>
                </td>

                <!-- Type/Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {getThaiPatientType(visit.patientType)}
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getPatientConditionClass(visit.patientCondition)}">
                    {getThaiPatientCondition(visit.patientCondition)}
                  </span>
                </td>

                <!-- Hospital -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {visit.hospital?.hospitalName || '-'}
                  </div>
                  <div class="text-sm text-gray-500">
                    {visit.hospitalCode9eDigit}
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      type="button"
                      class="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                      title="ดูรายละเอียด"
                      aria-label="ดูรายละเอียดผู้ป่วย"
                      onclick={() => handleViewPatient(visit.id)}
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {#if canEditPatient}
                      <button
                        type="button"
                        class="text-green-600 hover:text-green-900 transition-colors duration-150"
                        title="แก้ไข"
                        aria-label="แก้ไขข้อมูลผู้ป่วย"
                        onclick={() => handleEditPatient(visit.id)}
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
                <td colspan="8" class="px-6 py-12 text-center">
                  <div class="text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-lg font-medium">ไม่พบข้อมูลผู้ป่วย</p>
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