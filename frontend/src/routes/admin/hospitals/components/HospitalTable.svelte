<script lang="ts">
  import type { Hospital } from '$lib/types/backend';

  let { hospitals = [], onEdit, onDelete } = $props<{
    hospitals: Hospital[];
    onEdit: (hospital: Hospital) => void;
    onDelete: (hospital: Hospital) => void;
  }>();
</script>

<div class="overflow-x-auto bg-white rounded-lg shadow">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อโรงพยาบาล</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส (9 หลัก)</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
        <th class="relative px-6 py-3">
          <span class="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      {#if hospitals.length === 0}
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">ไม่พบข้อมูล</td>
        </tr>
      {:else}
        {#each hospitals as hospital (hospital.id)}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{hospital.hospitalName}</div>
              <div class="text-sm text-gray-500">{hospital.affiliation || ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.hospitalCode9eDigit}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.organizationType}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class:text-green-800={hospital.isActive} class:bg-green-100={hospital.isActive} class:text-red-800={!hospital.isActive} class:bg-red-100={!hospital.isActive} class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {hospital.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button onclick={() => onEdit(hospital)} class="text-indigo-600 hover:text-indigo-900">แก้ไข</button>
              <button onclick={() => onDelete(hospital)} class="text-red-600 hover:text-red-900 ml-4">ลบ</button>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>