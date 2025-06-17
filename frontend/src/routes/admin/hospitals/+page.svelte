<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Hospital, QueryParams } from '$lib/types/backend';

	// Import stores and child components
	import { hospitalStore } from '$lib/stores/hospitals';
	import HospitalSearchForm from './components/HospitalSearchForm.svelte';
	import HospitalTable from './components/HospitalTable.svelte';
	import HospitalCreateModal from './components/HospitalCreateModal.svelte';

	// Props from server-side load function
	let { data } = $props<{ data: App.PageData }>();

	// Page-level reactive state using Svelte 5 Runes
	let isModalOpen = $state(false);
	let selectedHospital = $state<Partial<Hospital> | null>(null);
	let searchQuery = $state<Partial<QueryParams>>(data.currentQuery);

	// This $effect runs when the component mounts and whenever `searchQuery` changes
	$effect(() => {
		hospitalStore.fetchHospitals(searchQuery);
	});

	// --- Component Event Handlers ---

	function openCreateModal() {
		selectedHospital = null; // Clear selection for creating a new hospital
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
	}

	// ✅ FIX: The function signature now correctly matches the data passed from the child component.
	async function handleSave(hospitalData: Partial<Hospital>) {
		await hospitalStore.saveHospital(hospitalData);
		closeModal();
		hospitalStore.fetchHospitals(searchQuery); // Refresh data
	}

	// ✅ FIX: Correct function signature.
	function handleEdit(hospital: Hospital) {
		selectedHospital = hospital;
		isModalOpen = true;
	}

	// ✅ FIX: Correct function signature.
	async function handleDelete(hospital: Hospital) {
		if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโรงพยาบาล "${hospital.hospitalName}"?`)) {
			await hospitalStore.deleteHospital(hospital.id);
			hospitalStore.fetchHospitals(searchQuery); // Refresh data
		}
	}

	// ✅ FIX: Correct function signature.
	function handleSearch(filters: { search: string; isActive?: boolean }) {
		const newQuery = { ...searchQuery, ...filters, page: 1 };
		
		// Update the URL to be shareable
		const url = new URL($page.url);
		Object.entries(newQuery).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				url.searchParams.set(key, String(value));
			} else {
				url.searchParams.delete(key);
			}
		});

		// ✅ FIX: Use `invalidateAll: false` instead of the deprecated `keepData: true`.
		goto(url.toString(), { invalidateAll: false, noScroll: true });

		// Update the reactive state, which will trigger the $effect to fetch new data.
		searchQuery = newQuery;
	}

	function handleResetSearch() {
		const defaultQuery: Partial<QueryParams> = { page: 1, limit: 20, sortBy: 'hospitalName', sortOrder: 'asc', isActive: true };
        const url = new URL($page.url);
        url.search = new URLSearchParams(defaultQuery as Record<string, string>).toString();

		// ✅ FIX: Use `invalidateAll: false`.
        goto(url.toString(), { invalidateAll: false, noScroll: true });

		searchQuery = defaultQuery;
    }
</script>

<div class="container mx-auto p-4 md:p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold text-gray-800">จัดการโรงพยาบาล</h1>
		<button onclick={openCreateModal} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
			เพิ่มโรงพยาบาล
		</button>
	</div>

	<HospitalSearchForm 
		onSearch={handleSearch}
		onReset={handleResetSearch}
	/>

	{#if $hospitalStore.isLoading && $hospitalStore.hospitals.length === 0}
		<p class="text-center text-gray-500 py-8">กำลังโหลดข้อมูล...</p>
	{:else if $hospitalStore.error}
		<div class="text-center text-red-500 bg-red-50 p-4 rounded-lg">
			<p class="font-bold">เกิดข้อผิดพลาด</p>
			<p>{$hospitalStore.error}</p>
		</div>
	{:else}
		<HospitalTable 
			hospitals={$hospitalStore.hospitals}
			onEdit={handleEdit}
			onDelete={handleDelete}
		/>

		{#if $hospitalStore.pagination && $hospitalStore.pagination.totalPages > 1}
			<div class="mt-6 flex justify-center">
				<p class="text-sm text-gray-700">
					หน้า {$hospitalStore.pagination.page} จาก {$hospitalStore.pagination.totalPages} (ทั้งหมด {$hospitalStore.pagination.total} รายการ)
				</p>
			</div>
		{/if}
	{/if}
</div>

<HospitalCreateModal 
	isOpen={isModalOpen} 
	hospital={selectedHospital}
	onSave={handleSave}
	onClose={closeModal}
/>