<!-- src/lib/components/ui/Loading.svelte -->
<!-- Reusable Loading Component for entire application -->

<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  // ============================================
  // TYPES
  // ============================================

  type LoadingType = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'bar' | 'ring';
  type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type LoadingColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

  interface Props {
    show?: boolean;
    type?: LoadingType;
    size?: LoadingSize;
    color?: LoadingColor;
    overlay?: boolean;
    fullscreen?: boolean;
    text?: string;
    textPosition?: 'top' | 'bottom' | 'right' | 'left';
    center?: boolean;
    transparent?: boolean;
    children?: Snippet;
  }

  let {
    show = true,
    type = 'spinner',
    size = 'md',
    color = 'primary',
    overlay = false,
    fullscreen = false,
    text,
    textPosition = 'bottom',
    center = false,
    transparent = false,
    children
  }: Props = $props();

  // ============================================
  // REACTIVE COMPUTATIONS
  // ============================================

  // Size classes
  const sizeClasses = $derived(() => {
    const sizes = {
      xs: { width: 'w-4 h-4', text: 'text-xs' },
      sm: { width: 'w-6 h-6', text: 'text-sm' },
      md: { width: 'w-8 h-8', text: 'text-base' },
      lg: { width: 'w-12 h-12', text: 'text-lg' },
      xl: { width: 'w-16 h-16', text: 'text-xl' }
    };
    return sizes[size];
  });

  // Color classes
  const colorClasses = $derived(() => {
    const colors = {
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-cyan-600'
    };
    return colors[color];
  });

  // Container classes
  const containerClasses = $derived(() => {
    const classes = [];

    if (overlay || fullscreen) {
      classes.push('fixed', 'inset-0', 'z-50');
      if (!transparent) {
        classes.push('bg-white', 'bg-opacity-75');
      }
    }

    if (center || overlay || fullscreen) {
      classes.push('flex', 'items-center', 'justify-center');
    }

    if (fullscreen) {
      classes.push('min-h-screen');
    }

    return classes.join(' ');
  });

  // Loading wrapper classes
  const wrapperClasses = $derived(() => {
    const classes = ['flex', 'items-center'];

    if (textPosition === 'top' || textPosition === 'bottom') {
      classes.push('flex-col');
    }

    if (textPosition === 'right') {
      classes.push('flex-row');
    }

    if (textPosition === 'left') {
      classes.push('flex-row-reverse');
    }

    return classes.join(' ');
  });

  // Text spacing classes
  const textSpacingClasses = $derived(() => {
    const spacing = {
      top: 'mb-2',
      bottom: 'mt-2',
      left: 'mr-3',
      right: 'ml-3'
    };
    return spacing[textPosition];
  });

  // Spinner animation classes
  const spinnerClasses = $derived(() => {
    return [
      'animate-spin',
      sizeClasses().width,
      colorClasses()
    ].join(' ');
  });

  // Dots animation classes  
  const dotsClasses = $derived(() => {
    const dotSize = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5', 
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4'
    };
    return dotSize[size];
  });

  // Pulse animation classes
  const pulseClasses = $derived(() => {
    return [
      'animate-pulse',
      'rounded-full',
      sizeClasses().width,
      colorClasses().replace('text-', 'bg-')
    ].join(' ');
  });

  // Skeleton classes
  const skeletonClasses = $derived(() => {
    return [
      'animate-pulse',
      'bg-gray-300',
      'rounded'
    ].join(' ');
  });
</script>

<!-- ============================================ -->
<!-- LOADING COMPONENT -->
<!-- ============================================ -->

{#if show}
  <div 
    class={containerClasses()}
    transition:fade={{ duration: 200 }}
    role="status"
    aria-label="กำลังโหลด"
  >
    <div class={wrapperClasses()}>
      
      <!-- Text - Top/Left Position -->
      {#if text && (textPosition === 'top' || textPosition === 'left')}
        <div class="text-gray-600 {sizeClasses().text} {textSpacingClasses()}">
          {text}
        </div>
      {/if}

      <!-- Loading Animation -->
      <div class="flex items-center justify-center">
        
        <!-- Spinner -->
        {#if type === 'spinner'}
          <svg class={spinnerClasses()} fill="none" viewBox="0 0 24 24">
            <circle 
              class="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              stroke-width="4"
            />
            <path 
              class="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>

        <!-- Dots -->
        {:else if type === 'dots'}
          <div class="flex space-x-1">
            <div class="{dotsClasses()} {colorClasses().replace('text-', 'bg-')} animate-bounce" style="animation-delay: 0ms;"></div>
            <div class="{dotsClasses()} {colorClasses().replace('text-', 'bg-')} animate-bounce" style="animation-delay: 150ms;"></div>
            <div class="{dotsClasses()} {colorClasses().replace('text-', 'bg-')} animate-bounce" style="animation-delay: 300ms;"></div>
          </div>

        <!-- Pulse -->
        {:else if type === 'pulse'}
          <div class={pulseClasses()}></div>

        <!-- Skeleton -->
        {:else if type === 'skeleton'}
          <div class="space-y-2">
            <div class="{skeletonClasses()} h-4 w-32"></div>
            <div class="{skeletonClasses()} h-4 w-24"></div>
            <div class="{skeletonClasses()} h-4 w-28"></div>
          </div>

        <!-- Bar -->
        {:else if type === 'bar'}
          <div class="w-32 bg-gray-200 rounded-full h-2">
            <div class="bg-current h-2 rounded-full animate-pulse {colorClasses()}" style="width: 60%;"></div>
          </div>

        <!-- Ring -->
        {:else if type === 'ring'}
          <div class="relative {sizeClasses().width}">
            <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div class="absolute inset-0 rounded-full border-4 border-t-current animate-spin {colorClasses()}"></div>
          </div>

        {/if}
      </div>

      <!-- Text - Bottom/Right Position -->
      {#if text && (textPosition === 'bottom' || textPosition === 'right')}
        <div class="text-gray-600 {sizeClasses().text} {textSpacingClasses()}">
          {text}
        </div>
      {/if}

      <!-- Custom Content -->
      {#if children}
        <div class="mt-2">
          {@render children()}
        </div>
      {/if}

    </div>
  </div>
{/if}

<!-- ============================================ -->
<!-- STYLES -->
<!-- ============================================ -->

<style>
  /* Spinner animation */
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
  
  /* Bounce animation for dots */
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
  
  .animate-bounce {
    animation: bounce 1.4s ease-in-out infinite;
  }
  
  /* Pulse animation */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  /* Ensure overlay covers everything */
  .fixed.inset-0 {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  
  /* Backdrop blur effect */
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }
</style>