<!-- src/lib/components/ui/Pagination.svelte -->
<!-- Reusable Pagination Component for entire application -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // ============================================
  // TYPES
  // ============================================

  interface Props {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize?: number;
    showInfo?: boolean;
    showSizeChanger?: boolean;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    maxVisiblePages?: number;
    compact?: boolean;
    disabled?: boolean;
    pageSizeOptions?: number[];
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  }

  let {
    currentPage = 1,
    totalPages = 1,
    totalItems,
    pageSize = 20,
    showInfo = true,
    showSizeChanger = false,
    showFirstLast = true,
    showPrevNext = true,
    maxVisiblePages = 7,
    compact = false,
    disabled = false,
    pageSizeOptions = [10, 20, 50, 100],
    onPageChange,
    onPageSizeChange
  }: Props = $props();

  // ============================================
  // EVENT DISPATCHER
  // ============================================

  const dispatch = createEventDispatcher<{
    pageChange: { page: number };
    pageSizeChange: { pageSize: number };
  }>();

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

  // Validate current page
  const safePage = $derived(() => {
    return Math.max(1, Math.min(currentPage, totalPages));
  });

  // Check if has previous page
  const hasPrevious = $derived(() => {
    return safePage() > 1;
  });

  // Check if has next page
  const hasNext = $derived(() => {
    return safePage() < totalPages;
  });

  // Generate visible page numbers
  const visiblePages = $derived(() => {
    const current = safePage();
    const total = totalPages;
    const maxVisible = Math.min(maxVisiblePages, total);
    const pages: number[] = [];

    if (total <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end positions
      let start = Math.max(1, current - Math.floor(maxVisible / 2));
      let end = Math.min(total, start + maxVisible - 1);

      // Adjust start if end is at the boundary
      if (end === total) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  });

  // Info text calculation
  const infoText = $derived(() => {
    if (!totalItems || !showInfo) return '';
    
    const current = safePage();
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, totalItems);
    
    return `แสดง ${startItem.toLocaleString()}-${endItem.toLocaleString()} จากทั้งหมด ${totalItems.toLocaleString()} รายการ`;
  });

  // Button base classes
  const buttonBaseClasses = $derived(() => {
    const classes = [
      'relative',
      'inline-flex',
      'items-center',
      'justify-center',
      'text-sm',
      'font-medium',
      'transition-colors',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-blue-500'
    ];

    if (compact) {
      classes.push('px-2', 'py-1');
    } else {
      classes.push('px-3', 'py-2');
    }

    return classes.join(' ');
  });

  // Page button classes
  const pageButtonClasses = $derived(() => {
    return [
      buttonBaseClasses(),
      'border',
      'border-gray-300',
      'bg-white',
      'text-gray-700',
      'hover:bg-gray-50',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    ].join(' ');
  });

  // Active page button classes
  const activePageButtonClasses = $derived(() => {
    return [
      buttonBaseClasses(),
      'border',
      'border-blue-500',
      'bg-blue-500',
      'text-white',
      'hover:bg-blue-600'
    ].join(' ');
  });

  // Navigation button classes
  const navButtonClasses = $derived(() => {
    return [
      buttonBaseClasses(),
      'border',
      'border-gray-300',
      'bg-white',
      'text-gray-500',
      'hover:bg-gray-50',
      'hover:text-gray-700',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    ].join(' ');
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handlePageChange(page: number): void {
    if (disabled || page === safePage() || page < 1 || page > totalPages) {
      return;
    }

    onPageChange?.(page);
    dispatch('pageChange', { page });
  }

  function handlePageSizeChange(newPageSize: number): void {
    if (disabled || newPageSize === pageSize) {
      return;
    }

    onPageSizeChange?.(newPageSize);
    dispatch('pageSizeChange', { pageSize: newPageSize });
  }

  function handlePrevious(): void {
    handlePageChange(safePage() - 1);
  }

  function handleNext(): void {
    handlePageChange(safePage() + 1);
  }

  function handleFirst(): void {
    handlePageChange(1);
  }

  function handleLast(): void {
    handlePageChange(totalPages);
  }
</script>

<!-- ============================================ -->
<!-- PAGINATION COMPONENT -->
<!-- ============================================ -->

<div class="flex {compact ? 'flex-col space-y-2' : 'flex-col sm:flex-row'} items-center justify-between">
  
  <!-- Info Text -->
  {#if showInfo && infoText()}
    <div class="text-sm text-gray-700 {compact ? 'order-2' : 'mb-4 sm:mb-0'}">
      {infoText()}
    </div>
  {/if}

  <!-- Main Pagination Controls -->
  <div class="flex items-center space-x-1 {compact ? 'order-1' : ''}">
    
    <!-- First Page Button -->
    {#if showFirstLast && !compact}
      <button
        type="button"
        class={navButtonClasses()}
        disabled={disabled || !hasPrevious()}
        onclick={handleFirst}
        aria-label="หน้าแรก"
        title="หน้าแรก"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    {/if}

    <!-- Previous Page Button -->
    {#if showPrevNext}
      <button
        type="button"
        class={navButtonClasses()}
        disabled={disabled || !hasPrevious()}
        onclick={handlePrevious}
        aria-label="หน้าก่อนหน้า"
        title="หน้าก่อนหน้า"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {#if !compact}
          <span class="ml-1">ก่อนหน้า</span>
        {/if}
      </button>
    {/if}

    <!-- Page Numbers -->
    {#each visiblePages() as page (page)}
      <button
        type="button"
        class={page === safePage() ? activePageButtonClasses() : pageButtonClasses()}
        disabled={disabled}
        onclick={() => handlePageChange(page)}
        aria-label="หน้า {page}"
        aria-current={page === safePage() ? 'page' : undefined}
      >
        {page}
      </button>
    {/each}

    <!-- Next Page Button -->
    {#if showPrevNext}
      <button
        type="button"
        class={navButtonClasses()}
        disabled={disabled || !hasNext()}
        onclick={handleNext}
        aria-label="หน้าถัดไป"
        title="หน้าถัดไป"
      >
        {#if !compact}
          <span class="mr-1">ถัดไป</span>
        {/if}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    {/if}

    <!-- Last Page Button -->
    {#if showFirstLast && !compact}
      <button
        type="button"
        class={navButtonClasses()}
        disabled={disabled || !hasNext()}
        onclick={handleLast}
        aria-label="หน้าสุดท้าย"
        title="หน้าสุดท้าย"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    {/if}

  </div>

  <!-- Page Size Changer -->
  {#if showSizeChanger}
    <div class="flex items-center space-x-2 {compact ? 'order-3' : 'mt-4 sm:mt-0'}">
      <label for="pageSize" class="text-sm text-gray-700">
        แสดง
      </label>
      <select
        id="pageSize"
        class="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={pageSize}
        disabled={disabled}
        onchange={(e) => handlePageSizeChange(Number((e.target as HTMLSelectElement).value))}
      >
        {#each pageSizeOptions as option (option)}
          <option value={option}>
            {option}
          </option>
        {/each}
      </select>
      <span class="text-sm text-gray-700">
        รายการ
      </span>
    </div>
  {/if}

</div>

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Ensure buttons align properly */
  button {
    min-width: 2.5rem;
  }
  
  /* Hover effects */
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Focus states */
  button:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
  
  /* Disabled state */
  button:disabled {
    transform: none;
    box-shadow: none;
  }
  
  /* Select styling */
  select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }
</style>