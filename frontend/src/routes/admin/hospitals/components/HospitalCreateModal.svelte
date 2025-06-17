<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { Hospital } from '$lib/types/backend';

  let { 
    isOpen = false, 
    hospital = null,
    onSave,
    onClose 
  } = $props<{
    isOpen: boolean;
    hospital: Partial<Hospital> | null;
    onSave: (data: Partial<Hospital>) => void;
    onClose: () => void;
  }>();

  let formData = $state<Partial<Hospital>>({});

  $effect(() => {
    formData = hospital ? { ...hospital } : { isActive: true };
  });

  // ✅ แก้ไข: เพิ่ม event parameter และเรียก preventDefault()
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    onSave(formData);
  }

  $effect(() => {
    if (!isOpen) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if isOpen}
<div transition:slide class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onclick={onClose}></div>

    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <form onsubmit={handleSubmit}>
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
            {hospital?.id ? 'แก้ไขข้อมูลโรงพยาบาล' : 'เพิ่มโรงพยาบาลใหม่'}
          </h3>
          <div class="mt-4 space-y-4">
            <div>
              <label for="hospitalName" class="block text-sm font-medium text-gray-700">ชื่อโรงพยาบาล</label>
              <input type="text" bind:value={formData.hospitalName} id="hospitalName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
            </div>
            <div>
              <label for="hospitalCode9eDigit" class="block text-sm font-medium text-gray-700">รหัส 9 หลัก</label>
              <input type="text" bind:value={formData.hospitalCode9eDigit} id="hospitalCode9eDigit" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
            </div>
             <div>
              <label for="organizationType" class="block text-sm font-medium text-gray-700">ประเภทองค์กร</label>
              <input type="text" bind:value={formData.organizationType} id="organizationType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            </div>
             <div class="flex items-center">
                <input id="isActive" type="checkbox" bind:checked={formData.isActive} class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label for="isActive" class="ml-2 block text-sm text-gray-900">เปิดใช้งาน</label>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
            บันทึก
          </button>
          <button type="button" onclick={onClose} class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
{/if}