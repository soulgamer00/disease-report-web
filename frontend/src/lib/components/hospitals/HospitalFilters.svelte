<!-- src/lib/components/hospitals/HospitalFilters.svelte -->
<!-- ✅ Hospital search and filter component -->
<!-- Debounced search with multiple filter options -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { debounce } from 'lodash-es';
  import type { HospitalFilters, HospitalDropdownOptions } from '$lib/types/hospital.types';

  const dispatch = createEventDispatcher<{
    filter: HospitalFilters;
    reset: void;
  }>();

  // ============================================
  // PROPS
  // ============================================
  
  export let filters: HospitalFilters = {
    search: '',
    organizationType: '',
    healthServiceType: '',
    affiliation: '',
    province: '',
    isActive: null
  };
  
  export let loading = false;
  export let showAdvanced = false;
  export let dropdownOptions: HospitalDropdownOptions = {
    organizationTypes: [],
    healthServiceTypes: [],
    affiliations: [],
    provinces: []
  };

  // ============================================
  // REACTIVE FILTERS
  // ============================================
  
  let localFilters = { ...filters };
  let showAdvancedFilters = showAdvanced;

  // Debounced search function
  const debouncedFilter = debounce(() => {
    dispatch('filter', localFilters);
  }, 300);

  // Watch for changes and emit debounced events
  $: {
    localFilters;
    debouncedFilter();
  }

  // ============================================
  // FILTER HANDLERS
  // ============================================
  
  function handleReset() {
    localFilters = {
      search: '',
      organizationType: '',
      healthServiceType: '',
      affiliation: '',
      province: '',
      isActive: null
    };
    dispatch('reset');
    dispatch('filter', localFilters);
  }

  function toggleAdvanced() {
    showAdvancedFilters = !showAdvancedFilters;
  }

  function hasActiveFilters(): boolean {
    return (
      localFilters.search !== '' ||
      localFilters.organizationType !== '' ||
      localFilters.healthServiceType !== '' ||
      localFilters.affiliation !== '' ||
      localFilters.province !== '' ||
      localFilters.isActive !== null
    );
  }

  // ============================================
  // STATUS OPTIONS
  // ============================================
  
  const statusOptions = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'true', label: 'เปิดใช้งาน' },
    { value: 'false', label: 'ปิดใช้งาน' }
  ];
</script>

<!-- ============================================ -->
<!-- HOSPITAL FILTERS COMPONENT -->
<!-- ============================================ -->

<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <!-- Header -->
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-lg font-medium text-gray-900">ค้นหาและกรองข้อมูล</h3>
    <div class="flex items-center space-x-2">
      <!-- Advanced Toggle -->
      <button
        type="button"
        class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        on:click={toggleAdvanced}
      >
        {showAdvancedFilters ? 'ซ่อนตัวกรองขั้นสูง' : 'แสดงตัวกรองขั้นสูง'}
      </button>
      
      <!-- Reset Button -->
      {#if hasActiveFilters()}
        <button
          type="button"
          class="text-sm text-red-600 hover:text-red-800 hover:underline"
          on:click={handleReset}
          disabled={loading}
        >
          ล้างตัวกรอง
        </button>
      {/if}
    </div>
  </div>

  <!-- Search Bar -->
  <div class="mb-4">
    <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
      ค้นหาโรงพยาบาล
    </label>
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        id="search"
        type="text"
        bind:value={localFilters.search}
        placeholder="ค้นหาด้วยชื่อโรงพยาบาล, รหัส, หรือที่อยู่..."
        class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={loading}
      />
      {#if loading}
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Basic Filters Row -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <!-- Organization Type -->
    <div>
      <label for="organizationType" class="block text-sm font-medium text-gray-700 mb-2">
        ประเภทองค์กร
      </label>
      <select
        id="organizationType"
        bind:value={localFilters.organizationType}
        class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={loading}
      >
        <option value="">ทั้งหมด</option>
        {#each dropdownOptions.organizationTypes as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>

    <!-- Province -->
    <div>
      <label for="province" class="block text-sm font-medium text-gray-700 mb-2">
        จังหวัด
      </label>
      <select
        id="province"
        bind:value={localFilters.province}
        class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={loading}
      >
        <option value="">ทุกจังหวัด</option>
        {#each dropdownOptions.provinces as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </div>

    <!-- Status -->
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
        สถานะ
      </label>
      <select
        id="status"
        bind:value={localFilters.isActive}
        class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={loading}
      >
        {#each statusOptions as option}
          <option value={option.value === '' ? null : option.value === 'true'}>{option.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Advanced Filters -->
  {#if showAdvancedFilters}
    <div class="mt-6 border-t border-gray-200 pt-6">
      <h4 class="mb-4 text-sm font-medium text-gray-900">ตัวกรองขั้นสูง</h4>
      
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Health Service Type -->
        <div>
          <label for="healthServiceType" class="block text-sm font-medium text-gray-700 mb-2">
            ประเภทบริการสุขภาพ
          </label>
          <select
            id="healthServiceType"
            bind:value={localFilters.healthServiceType}
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">ทั้งหมด</option>
            {#each dropdownOptions.healthServiceTypes as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>

        <!-- Affiliation -->
        <div>
          <label for="affiliation" class="block text-sm font-medium text-gray-700 mb-2">
            สังกัด
          </label>
          <select
            id="affiliation"
            bind:value={localFilters.affiliation}
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">ทั้งหมด</option>
            {#each dropdownOptions.affiliations as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  {/if}

  <!-- Active Filters Summary -->
  {#if hasActiveFilters()}
    <div class="mt-4 border-t border-gray-200 pt-4">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-gray-700">ตัวกรองที่เลือก:</span>
        
        {#if localFilters.search}
          <span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            ค้นหา: "{localFilters.search}"
          </span>
        {/if}
        
        {#if localFilters.organizationType}
          <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            ประเภท: {dropdownOptions.organizationTypes.find(o => o.value === localFilters.organizationType)?.label || localFilters.organizationType}
          </span>
        {/if}
        
        {#if localFilters.province}
          <span class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
            จังหวัด: {dropdownOptions.provinces.find(p => p.value === localFilters.province)?.label || localFilters.province}
          </span>
        {/if}
        
        {#if localFilters.isActive !== null}
          <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            สถานะ: {localFilters.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </span>
        {/if}
        
        {#if localFilters.healthServiceType}
          <span class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            บริการ: {dropdownOptions.healthServiceTypes.find(h => h.value === localFilters.healthServiceType)?.label || localFilters.healthServiceType}
          </span>
        {/if}
        
        {#if localFilters.affiliation}
          <span class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
            สังกัด: {dropdownOptions.affiliations.find(a => a.value === localFilters.affiliation)?.label || localFilters.affiliation}
          </span>
        {/if}
      </div>
    </div>
  {/if}
</div>