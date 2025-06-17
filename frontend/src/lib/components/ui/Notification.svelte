<!-- src/lib/components/ui/Notification.svelte -->
<!-- Reusable Notification/Toast Component for entire application -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  // ============================================
  // TYPES
  // ============================================

  type NotificationType = 'success' | 'error' | 'warning' | 'info';
  type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

  interface Props {
    show?: boolean;
    type?: NotificationType;
    title?: string;
    message?: string;
    duration?: number;
    closable?: boolean;
    position?: NotificationPosition;
    persistent?: boolean;
    icon?: boolean;
    actionText?: string;
    onAction?: () => void;
    onClose?: () => void;
    children?: Snippet;
  }

  let {
    show = $bindable(false),
    type = 'info',
    title,
    message = '',
    duration = 5000,
    closable = true,
    position = 'top-right',
    persistent = false,
    icon = true,
    actionText,
    onAction,
    onClose,
    children
  }: Props = $props();

  // ============================================
  // EVENT DISPATCHER
  // ============================================

  const dispatch = createEventDispatcher<{
    close: void;
    action: void;
  }>();

  // ============================================
  // REACTIVE STATE
  // ============================================

  let timeoutId: ReturnType<typeof setTimeout>;

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

  // Position classes
  const positionClasses = $derived(() => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position];
  });

  // Type-based styling
  const typeClasses = $derived(() => {
    const types = {
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        iconColor: 'text-green-400'
      },
      error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        iconColor: 'text-red-400'
      },
      warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        iconColor: 'text-yellow-400'
      },
      info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        iconColor: 'text-blue-400'
      }
    };
    return types[type];
  });

  // Container classes
  const containerClasses = $derived(() => {
    return [
      'fixed',
      'z-50',
      'max-w-sm',
      'w-full',
      positionClasses,
      'pointer-events-auto'
    ].join(' ');
  });

  // Notification classes
  const notificationClasses = $derived(() => {
    const styles = typeClasses();
    return [
      'rounded-lg',
      'border',
      'p-4',
      'shadow-lg',
      'backdrop-blur-sm',
      styles.bg,
      styles.border,
      styles.text
    ].join(' ');
  });

  // Transition direction based on position
  const transitionParams = $derived(() => {
    if (position.includes('right')) {
      return { x: 300, duration: 300 };
    } else if (position.includes('left')) {
      return { x: -300, duration: 300 };
    } else if (position.includes('top')) {
      return { y: -100, duration: 300 };
    } else {
      return { y: 100, duration: 300 };
    }
  });

  // ============================================
  // FUNCTIONS
  // ============================================

  function getIcon(): string {
    const icons = {
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.12 16.5c-.77.833.192 2.5 1.732 2.5z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[type];
  }

  function handleClose(): void {
    show = false;
    onClose?.();
    dispatch('close');
  }

  function handleAction(): void {
    onAction?.();
    dispatch('action');
  }

  function startAutoClose(): void {
    if (!persistent && duration > 0) {
      timeoutId = setTimeout(() => {
        handleClose();
      }, duration);
    }
  }

  function stopAutoClose(): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  // ============================================
  // EFFECTS
  // ============================================

  $effect(() => {
    if (show) {
      startAutoClose();
    } else {
      stopAutoClose();
    }

    return () => {
      stopAutoClose();
    };
  });
</script>

<!-- ============================================ -->
<!-- NOTIFICATION TOAST -->
<!-- ============================================ -->

{#if show}
  <div
    class={containerClasses}
    role="alert"
    aria-live="polite"
    transition:fly={transitionParams()}
    onmouseenter={stopAutoClose}
    onmouseleave={startAutoClose}
  >
    <div class={notificationClasses}>
      <div class="flex">
        
        <!-- Icon -->
        {#if icon}
          <div class="flex-shrink-0">
            <svg 
              class="h-5 w-5 {typeClasses().iconColor}" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d={getIcon()} 
              />
            </svg>
          </div>
        {/if}

        <!-- Content -->
        <div class="ml-3 w-0 flex-1">
          
          <!-- Title -->
          {#if title}
            <p class="text-sm font-medium {typeClasses().text}">
              {title}
            </p>
          {/if}

          <!-- Message or Custom Content -->
          {#if children}
            <div class="mt-1">
              {@render children()}
            </div>
          {:else if message}
            <p class="text-sm {typeClasses().text} {title ? 'mt-1' : ''}">
              {message}
            </p>
          {/if}

          <!-- Action Button -->
          {#if actionText && onAction}
            <div class="mt-3">
              <button
                type="button"
                class="text-sm font-medium {typeClasses().text} hover:underline focus:outline-none focus:underline"
                onclick={handleAction}
              >
                {actionText}
              </button>
            </div>
          {/if}

        </div>

        <!-- Close Button -->
        {#if closable}
          <div class="ml-4 flex flex-shrink-0">
            <button
              type="button"
              class="inline-flex rounded-md {typeClasses().bg} text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onclick={handleClose}
              aria-label="ปิดการแจ้งเตือน"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/if}

      </div>
    </div>
  </div>
{/if}

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Ensure notifications appear above everything */
  :global(.notification-container) {
    z-index: 9999;
  }
  
  /* Smooth hover transitions */
  button:hover {
    transition: all 0.15s ease-in-out;
  }
  
  /* Custom focus ring */
  button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
</style>