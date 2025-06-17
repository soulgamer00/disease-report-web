<script lang="ts">
  let { onSearch, onReset } = $props<{
    onSearch: (filters: { search: string; isActive?: boolean }) => void;
    onReset: () => void;
  }>();

  let searchTerm = $state('');
  let statusFilter = $state('all');

  // ✅ แก้ไข: เพิ่ม event parameter และเรียก preventDefault()
  function handleSearch(event: SubmitEvent) {
    event.preventDefault();
    onSearch({
      search: searchTerm,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    });
  }

  function handleReset() {
    searchTerm = '';
    statusFilter = 'all';
    onReset();
  }
</script>

<form onsubmit={handleSearch} class="p-4 bg-white rounded-lg shadow mb-6">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label for="search" class="block text-sm font-medium text-gray-700">ค้นหา</label>
      <input type="text" bind:value={searchTerm} id="search" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="ชื่อโรงพยาบาล, รหัส...">
    </div>
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700">สถานะ</label>
      <select bind:value={statusFilter} id="status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        <option value="all">ทั้งหมด</option>
        <option value="active">เปิดใช้งาน</option>
        <option value="inactive">ปิดใช้งาน</option>
      </select>
    </div>
    <div class="flex items-end space-x-2">
      <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
        ค้นหา
      </button>
      <button type="button" onclick={handleReset} class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
        ล้างค่า
      </button>
    </div>
  </div>
</form>