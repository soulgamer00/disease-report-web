<!-- src/lib/components/hospitals/HospitalTable.svelte -->
<!-- ✅ Hospital table component with sorting, pagination, and actions -->
<!-- Pure client-side component for displaying hospital data -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  import type { HospitalInfo } from '$lib/types/hospital.types';
  import { getHospitalLocation, getHospitalStatusDisplay } from '$lib/api/hospital.api';
  import dayjs from 'dayjs';
  
  const dispatch = createEventDispatcher<{
    sort: { field: keyof HospitalInfo; direction: 'asc' | 'desc' };
    delete: { hospital: HospitalInfo };
    edit: { hospital: HospitalInfo };
    view: { hospital: HospitalInfo };
  }>();

  // ============================================
  // PROPS
  // ============================================
  
  export let hospitals: HospitalInfo[] = [];
  export let loading = false;
  export let currentSort: { field: keyof HospitalInfo; direction: 'asc' | 'desc' } = {
    field: 'hospitalName',
    direction: 'asc'
  };
  export let showActions = true;
  export let showDeleteAction = false; // Only for superadmin
  export let emptyMessage = 'ไม่พบข้อมูลโรงพยาบาล';

  // ============================================
  // SORTING LOGIC
  // ============================================
  
  function handleSort(field: keyof HospitalInfo) {
    const direction = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    dispatch('sort', { field, direction });
  }

  function getSortIcon(field: keyof HospitalInfo): string {
    if (currentSort.field !== field) return '↕️';
    return currentSort.direction === 'asc' ? '↑' : '↓';
  }

  // ============================================
  // ACTION HANDLERS
  // ============================================
  
  function handleView(hospital: HospitalInfo) {
    dispatch('view', { hospital });
    goto(`/hospitals/${hospital.hospitalCode9eDigit}`);
  }

  function handleEdit(hospital: HospitalInfo) {
    dispatch('edit', { hospital });
    goto(`/hospitals/${hospital.hospitalCode9eDigit}/edit`);
  }

  function handleDelete(hospital: HospitalInfo) {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบโรงพยาบาล "${hospital.hospitalName}"?`)) {
      dispatch('delete', { hospital });
    }
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  function getDisplayCode(hospital: HospitalInfo): string {
    return hospital.hospitalCode9eDigit || hospital.hospitalCode9Digit || 'N/A';
  }

  function formatDate(dateString: string): string {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  }
</script>

<!-- ============================================ -->
<!-- HOSPITAL TABLE COMPONENT -->
<!-- ============================================ -->

<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
  <!-- Table Header -->
  <div class="bg-gray-50 px-6 py-4">
    <h3 class="text-lg font-medium text-gray-900">รายการโรงพยาบาล</h3>
    <p class="mt-1 text-sm text-gray-500">
      จำนวน {hospitals.length} โรงพยาบาล
    </p>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex h-64 items-center justify-center">
      <div class="flex items-center space-x-2">
        <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <span class="text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    </div>

  <!-- Empty State -->
  {:else if hospitals.length === 0}
    <div class="flex h-64 items-center justify-center">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่พบโรงพยาบาล</h3>
        <p class="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    </div>

  <!-- Table Content -->
  {:else}
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Table Header -->
        <thead class="bg-gray-50">
          <tr>
            <!-- Hospital Name -->
            <th 
              class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
              on:click={() => handleSort('hospitalName')}
            >
              <div class="flex items-center space-x-1">
                <span>ชื่อโรงพยาบาล</span>
                <span class="text-gray-400">{getSortIcon('hospitalName')}</span>
              </div>
            </th>

            <!-- Hospital Code -->
            <th 
              class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
              on:click={() => handleSort('hospitalCode9eDigit')}
            >
              <div class="flex items-center space-x-1">
                <span>รหัสโรงพยาบาล</span>
                <span class="text-gray-400">{getSortIcon('hospitalCode9eDigit')}</span>
              </div>
            </th>

            <!-- Organization Type -->
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              ประเภทองค์กร
            </th>

            <!-- Location -->
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              ที่อยู่
            </th>

            <!-- Status -->
            <th 
              class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
              on:click={() => handleSort('isActive')}
            >
              <div class="flex items-center space-x-1">
                <span>สถานะ</span>
                <span class="text-gray-400">{getSortIcon('isActive')}</span>
              </div>
            </th>

            <!-- Updated Date -->
            <th 
              class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
              on:click={() => handleSort('updatedAt')}
            >
              <div class="flex items-center space-x-1">
                <span>อัปเดตล่าสุด</span>
                <span class="text-gray-400">{getSortIcon('updatedAt')}</span>
              </div>
            </th>

            <!-- Actions -->
            {#if showActions}
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                การดำเนินการ
              </th>
            {/if}
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-gray-200 bg-white">
          {#each hospitals as hospital (hospital.id)}
            <tr class="hover:bg-gray-50">
              <!-- Hospital Name -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {hospital.hospitalName}
                    </div>
                    {#if hospital.affiliation}
                      <div class="text-sm text-gray-500">
                        {hospital.affiliation}
                      </div>
                    {/if}
                  </div>
                </div>
              </td>

              <!-- Hospital Code -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 font-mono">
                  {getDisplayCode(hospital)}
                </div>
                {#if hospital.hospitalCode5Digit}
                  <div class="text-xs text-gray-500 font-mono">
                    รหัสเก่า: {hospital.hospitalCode5Digit}
                  </div>
                {/if}
              </td>

              <!-- Organization Type -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {hospital.organizationType || 'ไม่ระบุ'}
                </div>
                {#if hospital.healthServiceType}
                  <div class="text-xs text-gray-500">
                    {hospital.healthServiceType}
                  </div>
                {/if}
              </td>

              <!-- Location -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {getHospitalLocation(hospital)}
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                {#snippet statusSnippet(isActive: boolean)}
                  {@const status = getHospitalStatusDisplay(isActive)}
                  <span class="inline-flex rounded-full px-2 text-xs font-semibold {status.class}">
                    {status.text}
                  </span>
                {/snippet}
                {@render statusSnippet(hospital.isActive)}
              </td>

              <!-- Updated Date -->
              <td class="px-6 py-4 text-sm text-gray-500">
                {formatDate(hospital.updatedAt)}
              </td>

              <!-- Actions -->
              {#if showActions}
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <!-- View Button -->
                    <button
                      type="button"
                      class="text-blue-600 hover:text-blue-900 hover:underline"
                      on:click={() => handleView(hospital)}
                      title="ดูรายละเอียด"
                    >
                      ดู
                    </button>

                    <!-- Edit Button -->
                    <button
                      type="button"
                      class="text-indigo-600 hover:text-indigo-900 hover:underline"
                      on:click={() => handleEdit(hospital)}
                      title="แก้ไข"
                    >
                      แก้ไข
                    </button>

                    <!-- Delete Button (Superadmin only) -->
                    {#if showDeleteAction}
                      <button
                        type="button"
                        class="text-red-600 hover:text-red-900 hover:underline"
                        on:click={() => handleDelete(hospital)}
                        title="ลบ"
                      >
                        ลบ
                      </button>
                    {/if}
                  </div>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Additional custom styles if needed */
  .font-mono {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
</style>