<!-- src/lib/components/ui/Table.svelte -->
<!-- Reusable Table Component for entire application -->

<script lang="ts">
  import type { Snippet } from 'svelte';

  // ============================================
  // TYPES
  // ============================================

  interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    class?: string;
  }

  interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
  }

  interface Props {
    columns: Column[];
    data: Record<string, unknown>[];
    loading?: boolean;
    empty?: boolean;
    striped?: boolean;
    bordered?: boolean;
    hover?: boolean;
    compact?: boolean;
    sticky?: boolean;
    caption?: string;
    sortable?: boolean;
    sortConfig?: SortConfig;
    emptyMessage?: string;
    loadingMessage?: string;
    rowKey?: string;
    onSort?: (sortConfig: SortConfig) => void;
    onRowClick?: (row: Record<string, unknown>, index: number) => void;
    rowClass?: (row: Record<string, unknown>, index: number) => string;
  }

  let {
    columns = [],
    data = [],
    loading = false,
    empty = false,
    striped = false,
    bordered = false,
    hover = true,
    compact = false,
    sticky = false,
    caption,
    sortable = true,
    sortConfig,
    emptyMessage = 'ไม่พบข้อมูล',
    loadingMessage = 'กำลังโหลดข้อมูล...',
    rowKey = 'id',
    onSort,
    onRowClick,
    rowClass
  }: Props = $props();

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

  // Table wrapper classes
  const wrapperClasses = $derived(() => {
    const classes = ['overflow-x-auto'];
    if (bordered) classes.push('border', 'border-gray-200', 'rounded-lg');
    return classes.join(' ');
  });

  // Table base classes
  const tableClasses = $derived(() => {
    const classes = ['min-w-full', 'divide-y', 'divide-gray-200'];
    if (striped) classes.push('divide-y-2');
    return classes.join(' ');
  });

  // Header classes
  const headerClasses = $derived(() => {
    const classes = ['bg-gray-50'];
    if (sticky) classes.push('sticky', 'top-0', 'z-10');
    return classes.join(' ');
  });

  // Header cell base classes
  const headerCellBaseClasses = $derived(() => {
    const classes = ['px-6', 'text-left', 'text-xs', 'font-medium', 'text-gray-500', 'uppercase', 'tracking-wider'];
    if (compact) {
      return classes.map(c => c === 'px-6' ? 'px-3' : c === 'py-3' ? 'py-2' : c).join(' ');
    } else {
      classes.push('py-3');
    }
    return classes.join(' ');
  });

  // Body row classes
  const bodyRowClasses = $derived(() => {
    const classes = ['bg-white'];
    if (striped) classes.push('even:bg-gray-50');
    if (hover) classes.push('hover:bg-gray-50');
    if (onRowClick) classes.push('cursor-pointer');
    return classes.join(' ');
  });

  // Body cell base classes
  const bodyCellBaseClasses = $derived(() => {
    const classes = ['px-6', 'whitespace-nowrap', 'text-sm', 'text-gray-900'];
    if (compact) {
      return classes.map(c => c === 'px-6' ? 'px-3' : c === 'py-4' ? 'py-2' : c).join(' ');
    } else {
      classes.push('py-4');
    }
    return classes.join(' ');
  });

  // Check if table should show empty state
  const shouldShowEmpty = $derived(!loading && (empty || data.length === 0));

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function handleSort(column: Column): void {
    if (!sortable || !column.sortable || !onSort) return;

    const newDirection = 
      sortConfig?.key === column.key && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';

    onSort({
      key: column.key,
      direction: newDirection
    });
  }

  function handleRowClick(row: Record<string, unknown>, index: number): void {
    onRowClick?.(row, index);
  }

  function getSortIcon(column: Column): string {
    if (!sortable || !column.sortable) return '';
    
    if (sortConfig?.key !== column.key) {
      return 'M7 10l5 5 5-5H7z'; // Default sort icon
    }
    
    return sortConfig.direction === 'asc' 
      ? 'M5 15l7-7 7 7H5z' // Sort up
      : 'M19 9l-7 7-7-7h14z'; // Sort down
  }

  function getColumnAlignment(align?: string): string {
    const alignments = {
      left: 'text-left',
      center: 'text-center', 
      right: 'text-right'
    };
    return alignments[align as keyof typeof alignments] || 'text-left';
  }

  function getCellValue(row: Record<string, unknown>, column: Column): unknown {
    return row[column.key];
  }

  function getRowClasses(row: Record<string, unknown>, index: number): string {
    const baseClasses = bodyRowClasses();
    const customClasses = rowClass?.(row, index);
    return customClasses ? `${baseClasses} ${customClasses}` : baseClasses;
  }
</script>

<!-- ============================================ -->
<!-- TABLE COMPONENT -->
<!-- ============================================ -->

<div class={wrapperClasses}>
  
  <!-- Table Caption -->
  {#if caption}
    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">{caption}</h3>
    </div>
  {/if}

  <table class={tableClasses}>
    
    <!-- Table Header -->
    <thead class={headerClasses}>
      <tr>
        {#each columns as column (column.key)}
          <th 
            class="{headerCellBaseClasses} {getColumnAlignment(column.align)} {column.class || ''}"
            style={column.width ? `width: ${column.width}` : ''}
            role={column.sortable && sortable ? 'columnheader' : undefined}
            tabindex={column.sortable && sortable ? 0 : undefined}
          >
            {#if column.sortable && sortable}
              <button
                type="button"
                class="group inline-flex items-center space-x-1 text-left font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                onclick={() => handleSort(column)}
              >
                <span>{column.label}</span>
                <svg 
                  class="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d={getSortIcon(column)} />
                </svg>
              </button>
            {:else}
              {column.label}
            {/if}
          </th>
        {/each}
      </tr>
    </thead>

    <!-- Table Body -->
    <tbody class="bg-white divide-y divide-gray-200">
      
      <!-- Loading State -->
      {#if loading}
        <tr>
          <td colspan={columns.length} class="px-6 py-12 text-center">
            <div class="flex items-center justify-center space-x-2">
              <svg class="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-gray-500">{loadingMessage}</span>
            </div>
          </td>
        </tr>
      
      <!-- Empty State -->
      {:else if shouldShowEmpty}
        <tr>
          <td colspan={columns.length} class="px-6 py-12 text-center">
            <div class="text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="text-lg font-medium">{emptyMessage}</p>
            </div>
          </td>
        </tr>
      
      <!-- Data Rows -->
      {:else}
        {#each data as row, index (row[rowKey] || index)}
          <tr 
            class={getRowClasses(row, index)}
            onclick={() => handleRowClick(row, index)}
          >
            {#each columns as column (column.key)}
              <td 
                class="{bodyCellBaseClasses} {getColumnAlignment(column.align)} {column.class || ''}"
                style={column.width ? `width: ${column.width}` : ''}
              >
                {String(getCellValue(row, column) || '-')}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}

    </tbody>
  </table>

</div>

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Ensure table scrolls horizontally on small screens */
  .overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }
  
  .overflow-x-auto::-webkit-scrollbar {
    height: 8px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f7fafc;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
  
  /* Sticky header enhancement */
  .sticky {
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }
  
  /* Loading animation */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>