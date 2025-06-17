<!-- src/lib/components/ui/Modal.svelte -->
<!-- Reusable Modal Component for entire application -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { clickOutside } from '$lib/utils/clickOutside';
  import type { Snippet } from 'svelte';

  // ============================================
  // PROPS & INTERFACE
  // ============================================

  interface Props {
    show?: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    showHeader?: boolean;
    showFooter?: boolean;
    maxHeight?: string;
    zIndex?: number;
    children?: Snippet;
    headerSlot?: Snippet;
    footerSlot?: Snippet;
  }

  let {
    show = $bindable(false),
    title = '',
    size = 'md',
    closable = true,
    closeOnClickOutside = true,
    closeOnEscape = true,
    showHeader = true,
    showFooter = false,
    maxHeight = '90vh',
    zIndex = 50,
    children,
    headerSlot,
    footerSlot
  }: Props = $props();

  // ============================================
  // EVENT DISPATCHER
  // ============================================

  const dispatch = createEventDispatcher<{
    close: void;
    open: void;
    clickOutside: void;
  }>();

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

  // Modal size classes
  const sizeClasses = $derived(() => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4'
    };
    return sizes[size];
  });

  // Z-index style
  const zIndexStyle = $derived(`z-${zIndex}`);

  // ============================================
  // FUNCTIONS
  // ============================================

  function closeModal(): void {
    if (!closable) return;
    show = false;
    dispatch('close');
  }

  function handleClickOutside(): void {
    if (!closeOnClickOutside || !closable) return;
    dispatch('clickOutside');
    closeModal();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && closeOnEscape && closable) {
      closeModal();
    }
  }

  function handleOpen(): void {
    dispatch('open');
  }

  // ============================================
  // EFFECTS
  // ============================================

  $effect(() => {
    if (show) {
      handleOpen();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'auto';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  });
</script>

<!-- ============================================ -->
<!-- MODAL OVERLAY & CONTENT -->
<!-- ============================================ -->

{#if show}
  <!-- Modal Backdrop -->
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity {zIndexStyle}"
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    tabindex="-1"
    onkeydown={handleKeydown}
  >
    <!-- Modal Container -->
    <div class="fixed inset-0 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        
        <!-- Modal Panel -->
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all {sizeClasses()}"
          style="max-height: {maxHeight};"
          use:clickOutside={{ enabled: closeOnClickOutside, callback: handleClickOutside }}
          transition:fade={{ duration: 200, delay: 100 }}
        >
          
          <!-- Modal Header -->
          {#if showHeader}
            <div class="border-b border-gray-200 px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <!-- Custom Header Slot -->
                  {#if headerSlot}
                    {@render headerSlot()}
                  {:else if title}
                    <h3 id="modal-title" class="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                  {/if}
                </div>
                
                <!-- Close Button -->
                {#if closable}
                  <button
                    type="button"
                    class="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    onclick={closeModal}
                    aria-label="ปิด"
                  >
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Modal Body -->
          <div class="px-6 py-4 overflow-y-auto" style="max-height: calc({maxHeight} - 8rem);">
            {#if children}
              {@render children()}
            {/if}
          </div>

          <!-- Modal Footer -->
          {#if showFooter && footerSlot}
            <div class="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
              {@render footerSlot()}
            </div>
          {/if}

        </div>
      </div>
    </div>
  </div>
{/if}

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Ensure modal is above everything else */
  :global(body.modal-open) {
    overflow: hidden;
  }
  
  /* Custom scrollbar for modal content */
  .modal-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .modal-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .modal-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .modal-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>